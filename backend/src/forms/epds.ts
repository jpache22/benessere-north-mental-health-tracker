import { Hono } from 'hono';
import { getConnection } from '../db/pool';
import { Bindings } from '../types';
import { EPDSRequest } from '../types';

const epds = new Hono<{Bindings: Bindings}>();

// Get all the rows from the EPDS table, no matter the user
epds.get('/', async(context) => {
    var client = await getConnection(context.env.HYPERDRIVE.connectionString); // get the pool to connect to supabase database
    try {
        // query the database
        const result = await client.query(
            `SELECT form_submission_id, user_id, completion_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, total_score FROM public."EPDS"`
        );
        return context.json({success: true, epds: result.rows});
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.mmessage }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// Get the rows from EPDS table for a specific user ( a user may have multiple rows if they have multiple submissions for this form ) will be ordered by completion date
epds.get('/:userid', async(context) => {
    const id = context.req.param('userid'); // id 
    var client = await getConnection(context.env.HYPERDRIVE.connectionString); // get the pool to connect to supabase database
    try {
        // query the database
        const result = await client.query(
            `SELECT user_id, form_submission_id, completion_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, total_score
            FROM public."EPDS" WHERE user_id = $1
            ORDER BY completion_date;`,
            [id]
        );
        // check if there was a user that matched the id
        if (result.rows.length === 0) {
            return context.json({ success: false, error: `User EPDS form data not found for ${id}` }, 404);
        } else {
            // else return the rows for this user
            return context.json({ success: true, epds: result.rows});
        }
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// only get the total scores for each user id ordered by completion date
epds.get('/total_score/:userid', async(context) => {
    const id = context.req.param('userid'); // user id
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);
    try {
        // query the database
        const result = await client.query(
            `SELECT completion_date, total_score
            FROM public."EPDS" WHERE user_id = $1
            ORDER BY completion_date;`,
            [id]
        );
        // check if there is a user id which matches
        if (result.rows.length === 0) {
            return context.json({ success: false, error: `User EPDS form data not found for ${id}` }, 404)
        } else {
            return context.json({ success: true, epds: result.rows});
        }
    } catch( err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

// Insert a new submission into the table
epds.post('/', async(context) => {
    // await the data 
    const data = await context.req.json();
    var client = await getConnection(context.env.HYPERDRIVE.connectionString);

    try {
        // validate data
        const validData = EPDSRequest.parse(data); // will throw error if invalid
        // determine total score and depression severity
        const total_score = validData.q1 + validData.q2 + validData.q3 + validData.q4 + validData.q5 + validData.q6 + validData.q7 + validData.q8 + validData.q9 + validData.q10;
        const completion_date = new Date().toISOString();
        // query the data base
        const result = await client.query(
            `INSERT INTO public."EPDS" (user_id, completion_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, total_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING form_submission_id;`,
            [
                validData.user_id,
                completion_date,
                validData.q1,
                validData.q2,
                validData.q3,
                validData.q4,
                validData.q5,
                validData.q6,
                validData.q7,
                validData.q8,
                validData.q9,
                validData.q10,
                total_score
            ]
        );

        return context.json(({ success: true, formId: result.rows[0].form_submission_id }));

    } catch(err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }finally {
        if (client) {
            await client.end();
        }
    }
});

export default epds;