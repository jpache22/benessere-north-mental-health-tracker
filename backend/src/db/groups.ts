import { Hono } from 'hono';
import { getPool } from '../db/pool';
import { Bindings } from '../types';
import { GroupRequest } from '../types';

const groups = new Hono<{Bindings: Bindings}>();

// gets all the rows of the groups table
groups.get('/', async(context) => {
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);
    try {
        const result = await connectionPool.query(
            `SELECT group_id, project_id, label, session_dates FROM public."groups"`
        );
        return context.json({ success:true, groups: result.rows }, 404);
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.mmessage }, 500);
    }
});

// get groups by group_id
groups.get('/group_id/:group_id', async(context) => {
    const group_id = context.req.param("group_id");
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);

    try {
        const result = await connectionPool.query(
            `SELECT group_id, project_id, label, session_dates
            FROM public."groups" WHERE group_id = $1`,
            [group_id]
        );

        // check if there was a group that matched the group_id
        if (result.rows.length === 0) {
            return context.json({ success: false, error: `Group data not found for group_id = ${group_id}` }, 404);
        } else {
            return context.json({ success: true, group: result.rows[0]}); // should only be 1
        }

    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.mmessage }, 500);
    }

});

// get groups by project_id
groups.get('/project_id/:project_id', async(context) => {
    const project_id = context.req.param("project_id");
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);

    try {
        const result = await connectionPool.query(
            `SELECT project_id, group_id, label, session_dates
            FROM public."groups" WHERE project_id = $1`,
            [project_id]
        );

        // check if there was a group that matched the project_id
        if (result.rows.length === 0) {
            return context.json({ success: false, error: `Group data not found for project_id = ${project_id}` }, 404);
        } else {
            return context.json({ success: true, group: result.rows});
        }

    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.mmessage }, 500);
    }

});

// post method for groups
/* Payload should be in the following format:
{
    project_id: ,
    label: ,
    session_dates: []
}
*/
groups.post('/', async(context) => {
    const data = await context.req.json(); // get the data from the post request
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);

    try {
        const validData = GroupRequest.parse(data);
        const result = await connectionPool.query(
            `INSERT INTO public."groups" (project_id, label, session_dates)
            VALUES ($1, $2, $3)
            RETURNING group_id;`,
            [
                validData.project_id,
                validData.label,
                validData.session_dates
            ]
        );
        return context.json(({ success: true, group_id: result.rows[0].group_id }));
    } catch( err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }

});

export default groups;