import { Hono } from 'hono';
import { getConnection } from '../db/pool';
import { Bindings } from '../types';
import { ProjectRequest } from '../types';
import { check_auth_token } from '../index';

const projects = new Hono<{Bindings: Bindings}>();

// GET all projects
projects.get('/', async(context) => {
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== "admin") {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }

    var client = await getConnection(context.env.HYPERDRIVE.connectionString);
    try {
        const result = await client.query(
            `SELECT project_id, expiry_date, label, num_of_therapy_sessions, session_forms, screening_forms, pre_group_forms, post_group_forms FROM public."projects"`
        );
        return context.json({ success:true, projects: result.rows });
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message });
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// GET by label
projects.get('/label/:label', async(context) => {
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== "admin") {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }

    const label = context.req.param('label');
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);

    try {
        const result = await client.query(
            `SELECT label, project_id, expiry_date, num_of_therapy_sessions, session_forms, screening_forms, pre_group_forms, post_group_forms
            FROM public."projects" WHERE label = $1;`,
            [label]
        );

        if (result.rows.length === 0)
            return context.json({ success:false, error:"Not found" }, 404);

        return context.json({ success: true, projects: result.rows });
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// GET by project_id
projects.get('/project_id/:project_id', async(context) => {
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== "admin") {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }

    const project_id = context.req.param('project_id');
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);

    try {
        const result = await client.query(
            `SELECT project_id, label, expiry_date, num_of_therapy_sessions, session_forms, screening_forms, pre_group_forms, post_group_forms
            FROM public."projects" WHERE project_id = $1;`,
            [project_id]
        );

        if (result.rows.length === 0)
            return context.json({ success:false, error:"Not found" }, 404);

        return context.json({ success: true, projects: result.rows[0]});
    } catch(err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// POST new project
projects.post('/', async(context) => {
    const auth = await check_auth_token(context);
    if (!auth || auth.role !== "admin") {
        return context.json({ success: false, error: "Unauthorized" }, 403);
    }

    const data = await context.req.json();
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);

    try {
        const validData = ProjectRequest.parse(data);
        const result = await client.query(
            `INSERT INTO public."projects" (
                expiry_date,
                label,
                num_of_therapy_sessions,
                session_forms,
                post_group_forms,
                screening_forms,
                pre_group_forms
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING project_id;`,
            [
                validData.expiry_date,
                validData.label,
                validData.num_of_therapy_sessions,
                validData.session_forms,
                validData.post_group_forms,
                validData.screening_forms ?? null,
                validData.pre_group_forms ?? null
            ]
        );

        return context.json({ success: true, project_id: result.rows[0].project_id });
    } catch(err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

export default projects;
