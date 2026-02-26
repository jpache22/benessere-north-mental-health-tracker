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
            `SELECT group_id, project_id, label, session_dates FROM public."groups"`
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
            `SELECT group_id, project_id, label, session_dates
            FROM public."groups" WHERE group_id = $1`,
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
            `SELECT project_id, group_id, label, session_dates
            FROM public."groups" WHERE project_id = $1`,
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
        const validData = GroupRequest.parse(data);
        const result = await client.query(
            `INSERT INTO public."groups" (project_id, label, session_dates)
            VALUES ($1, $2, $3)
            RETURNING group_id;`,
            [
                validData.project_id,
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
