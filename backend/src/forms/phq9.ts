import { Hono } from 'hono';
import { getPool } from '../db/pool';
import { Bindings } from '../types';
import { PHQ9Request } from '../types';

const phq9 = new Hono<{Bindings: Bindings}>();

// Define routes needed to get and post to the supabase database

// Get all the rows from the phq9 table, no matter the user
phq9.get('/', async(context) => {
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString); // get the pool to connect to supabase database
    try {
        // query the database
        const result = await connectionPool.query(
            `SELECT form_submission_id, user_id, completion_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, total_score, depression_severity FROM public."PHQ9"`
        );
        return context.json({success: true, phq9: result.rows});
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.mmessage }, 500);
    }
});

// Admin: fetch minimal PHQ-9 data for all users 
phq9.get('/admin/all', async (context) => {
  const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);

  try {
    const result = await connectionPool.query(`
      SELECT 
        form_submission_id,
        user_id,
        total_score,
        depression_severity
      FROM public."PHQ9"
      ORDER BY form_submission_id DESC;
    `);

    return context.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error(err);
    return context.json({ success: false, error: err.message }, 500);
  }
});

// Get the rows from PHQ9 for a specific user ( a user may have multiple rows if they have multiple submissions for this form ) will be ordered by completion date
phq9.get('/:userid', async(context) => {
    const id = context.req.param('userid'); // id 
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString); // get the pool to connect to supabase database
    try {
        // query the database
        const result = await connectionPool.query(
            `SELECT user_id, form_submission_id, completion_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, total_score, depression_severity
            FROM public."PHQ9" WHERE user_id = $1
            ORDER BY completion_date;`,
            [id]
        );
        // check if there was a user that matched the id
        if (result.rows.length === 0) {
            return context.json({ success: false, error: `User PHQ-9 form data not found for ${id}` }, 404);
        } else {
            // else return the rows for this user
            return context.json({ success: true, phq9: result.rows});
        }
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }
});

// only get the total scores along with depression severity for each user id ordered by completion date
phq9.get('/total_score/:userid', async(context) => {
    const id = context.req.param('userid'); // user id
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);
    try {
        // query the database
        const result = await connectionPool.query(
            `SELECT completion_date, total_score, depression_severity
            FROM public."PHQ9" WHERE user_id = $1
            ORDER BY completion_date;`,
            [id]
        );
        // check if there is a user id which matches
        if (result.rows.length === 0) {
            return context.json({ success: false, error: `User PHQ-9 form data not found for ${id}` }, 404)
        } else {
            return context.json({ success: true, phq9: result.rows});
        }
    } catch( err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }
});

// create a record for a user's PHQ-9 form submissions
/* This post request expects data in the following format
{
    user_id: ,
    q1: ,
    q2: ,
    q3: ,
    q4: ,
    q5: ,
    q6: ,
    q7: ,
    q8: ,
    q9:
}
*/
phq9.post('/', async(context) => {
    // await the data 
    const data = await context.req.json();
    const connectionPool = getPool(context.env.HYPERDRIVE.connectionString);

    try {
        // validate data
        const validData = PHQ9Request.parse(data); // will throw error if invalid
        // determine total score and depression severity
        const total_score = validData.q1 + validData.q2 + validData.q3 + validData.q4 + validData.q5 + validData.q6 + validData.q7 + validData.q8 + validData.q9;
        const depression_severity = getDepressionSeverity(total_score);
        const completion_date = new Date().toISOString();
        // query the data base
        const result = await connectionPool.query(
            `INSERT INTO public."PHQ9" (user_id, completion_date, q1, q2, q3, q4, q5, q6, q7, q8, q9, total_score, depression_severity)
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
                total_score,
                depression_severity
            ]
        );

        return context.json(({ success: true, formId: result.rows[0].form_submission_id }));

    } catch(err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }
});

function getDepressionSeverity(total_score: number) {
    if (total_score <= 4) {
        return "None-minimal";
    } else if (total_score <= 9) {
        return "Mild";
    } else if (total_score <= 14) {
        return "Moderate";
    } else if (total_score <= 19) {
        return "Moderately Severe";
    } else {
        return "Severe";
    }
}




export default phq9;