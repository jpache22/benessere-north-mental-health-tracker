import { Hono } from 'hono';
import { getConnection } from '../db/pool';
import { Bindings } from '../types';
import { GroupRequest } from '../types';
import { check_auth_token } from '../index';

const groups = new Hono<{Bindings: Bindings}>();

// GET all groups (admin only)
groups.get('/', async(context) => {
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== "admin") {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }

    var client = await getConnection(context.env.HYPERDRIVE.connectionString);
    try {
        const result = await client.query(
            `SELECT
                g.group_id,
                g.project_id,
                g.therapist_id,
                g.label,
                g.session_dates,
                therapist.username AS therapist_username
            FROM public."groups" g
            LEFT JOIN public.users therapist ON therapist.id = g.therapist_id`
        );
        return context.json({ success:true, groups: result.rows }, 200);
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// GET groups by group_id (admin only)
groups.get('/group_id/:group_id', async(context) => {
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== "admin") {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }

    const group_id = context.req.param("group_id");
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);

    try {
        const result = await client.query(
            `SELECT
                g.group_id,
                g.project_id,
                g.therapist_id,
                g.label,
                g.session_dates,
                therapist.username AS therapist_username
            FROM public."groups" g
            LEFT JOIN public.users therapist ON therapist.id = g.therapist_id
            WHERE g.group_id = $1`,
            [group_id]
        );

        if (result.rows.length === 0) {
            return context.json({ success: false, error: `Group not found` }, 404);
        }

        return context.json({ success: true, group: result.rows[0]});
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// GET groups by project_id (admin only)
groups.get('/project_id/:project_id', async(context) => {
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== "admin") {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }

    const project_id = context.req.param("project_id");
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);

    try {
        const result = await client.query(
            `SELECT
                g.project_id,
                g.group_id,
                g.therapist_id,
                g.label,
                g.session_dates,
                therapist.username AS therapist_username
            FROM public."groups" g
            LEFT JOIN public.users therapist ON therapist.id = g.therapist_id
            WHERE g.project_id = $1`,
            [project_id]
        );

        if (result.rows.length === 0) {
            return context.json({ success: false, error: "No groups found" }, 404);
        }

        return context.json({ success: true, group: result.rows});
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// POST new group (admin only)
groups.post('/', async(context) => {
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== "admin") {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }

    const data = await context.req.json();
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);

    try {
        const parsed = GroupRequest.safeParse(data);
        if (!parsed.success) {
            return context.json({ success: false, error: parsed.error.issues }, 400);
        }

        const validData = parsed.data;

        const projectResult = await client.query(
            `SELECT project_id, num_of_therapy_sessions FROM public."projects" WHERE project_id = $1`,
            [validData.project_id]
        );

        if (projectResult.rows.length === 0) {
            return context.json({ success: false, error: "Project not found." }, 404);
        }

        const expectedSessions = Number(projectResult.rows[0].num_of_therapy_sessions);
        if (validData.session_dates.length !== expectedSessions) {
            return context.json(
                {
                    success: false,
                    error: `session_dates must contain exactly ${expectedSessions} date(s) for this project.`
                },
                400
            );
        }

        const therapistResult = await client.query(
            `SELECT id FROM public."users" WHERE id = $1 AND role = 'therapist' LIMIT 1`,
            [validData.therapist_id]
        );

        if (therapistResult.rows.length === 0) {
            return context.json({ success: false, error: "Selected therapist not found." }, 404);
        }

        const existingGroup = await client.query(
            `SELECT 1 FROM public."groups" WHERE project_id = $1 AND label = $2 LIMIT 1`,
            [validData.project_id, validData.label]
        );

        if (existingGroup.rows.length > 0) {
            return context.json({ success: false, error: "Group label already exists in this project." }, 409);
        }

        const result = await client.query(
            `INSERT INTO public."groups" (project_id, therapist_id, label, session_dates)
            VALUES ($1, $2, $3, $4)
            RETURNING group_id;`,
            [
                validData.project_id,
                validData.therapist_id,
                validData.label,
                validData.session_dates
            ]
        );
        return context.json({ success: true, group_id: result.rows[0].group_id });
    } catch(err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    } finally {
        if (client) {
            await client.end();
        }
    }
});

export default groups;
