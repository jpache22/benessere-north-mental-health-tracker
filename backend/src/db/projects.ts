import { Hono } from 'hono';
import { getPool } from '../db/pool';
import { Bindings } from '../types';

const projects = new Hono<{Bindings: Bindings}>();

// add routes to get information from the projects tables

// retrieves all the rows for the projects table
projects.get('/', async(context) => {
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);
    try {
        const result = await connectionPool.query(
            `SELECT project_id, expiry_date, label, num_of_therapy_sessions, session_forms, screening_forms, pre_group_forms, post_group_forms FROM public."projects"`
        );
        return context.json({ success:true, projects: result.rows });
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.mmessage });
    }
});

// retrieve project by label
projects.get('/label/:label', async(context) => {
    const label = context.req.param('label');
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);
    try {
        const result = await connectionPool.query(
            `SELECT label, project_id, expiry_date, num_of_therapy_sessions, session_forms, screening_forms, pre_group_forms, post_group_forms
            FROM public."projects" WHERE label = $1;`,
            [label]
        );

        // check if there was a project that matched the label
        if (result.rows.length === 0) {
            return context.json({ success: false, error: `Project data not found for label = ${label}` }, 404);
        } else {
            return context.json({ success: true, projects: result.rows});
        }

    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.mmessage }, 500);
    }
});

// retrieve project by project id
projects.get('/project_id/:project_id', async(context) => {
    const project_id = context.req.param('project_id');
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);
    try {
        const result = await connectionPool.query(
            `SELECT project_id, label, expiry_date, num_of_therapy_sessions, session_forms, screening_forms, pre_group_forms, post_group_forms
            FROM public."projects" WHERE project_id = $1;`,
            [project_id]
        );
        // check if there was a project that matched the project_id
        if (result.rows.length === 0) {
            return context.json({ success: false, error: `Project data not found for project_id = ${project_id}` }, 404);
        } else {
            return context.json({ success: true, projects: result.rows[0]}); // should only be 1 group
        }
    } catch(err: any) {
        console.error(err);
        return context.json({ success: false, error: err.mmessage }, 500);
    }
})

// post for project
/* takes a json as data in the following format
{
    expiry_date: ,
    label: ,
    num_of_therapy_sessions: ,
    session_forms: [],
    post_group_forms: [],
    screening_forms: [], // optional value
    pre_group_forms: [] // optional value
}
*/
projects.post('/', async(context) => {
    const data = await context.req.json(); // get the data from the post request
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);

    const {
      expiry_date,
      label,
      num_of_therapy_sessions,
      session_forms,
      screening_forms,
      pre_group_forms,
      post_group_forms
    } = data;

    // validate the inputs
    if (expiry_date === undefined || label === undefined || num_of_therapy_sessions === undefined || session_forms === undefined || post_group_forms === undefined) {
        return context.json({ success: false, error: "Missing required fields"}, 400);
    }

    try {
        const result = await connectionPool.query(
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
                expiry_date,
                label,
                num_of_therapy_sessions,
                session_forms,
                post_group_forms,
                screening_forms ?? null,
                pre_group_forms ?? null
            ]
        );
        return context.json(({ success: true, project_id: result.rows[0].project_id }));
    } catch( err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }
});

export default projects;