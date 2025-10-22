import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { Client } from "pg";
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { Pool } from "pg";


type Bindings = {
    HYPERDRIVE: Hyperdrive,
    MAIN_PAGES_URL: string,
    DEV_PAGES_URL: string,
    JMASER_DEV_PAGES_URL: string,
    JWT_SECRET: string
}

const app = new Hono<{Bindings: Bindings}>()

//this is a pool it manages connections to database(s) with reuse!
let pool: Pool;

export function getPool(connectionString: string): Pool {
    if (!pool) {
        pool = new Pool({ connectionString });
    }
    return pool;
}


// must add Cross-origin resource sharing permissions for the pages urls
app.use('*', async(context, next) => { // next is a function that tells hono to continue to the next middleware/route handler
  const corsMiddleware = cors({
    origin: [context.env.DEV_PAGES_URL, context.env.MAIN_PAGES_URL, context.env.JMASER_DEV_PAGES_URL],
    allowMethods: ['GET'],
    credentials: true
  });

  return corsMiddleware(context, next);
});

app.get('/', (c) => {
  return c.text('Hello Cloudflare Workers!')
});

// test api call to database
app.get('/db-test', async (context) => {
    const connectionString = context.env.HYPERDRIVE.connectionString;
    const pool = getPool(connectionString);

    try {
        const result = await pool.query(`SELECT NOW();`);
        return context.json({ success: true, date: result.rows[0].now, foo: 'bar'});
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }
})

app.post('/login', async (context) => {

    let foo = " ";
    try {
        const body = await context.req.json(); // Parse JSON body

        const { username, password } = body;

        if (!username || !password) {
            return context.json({ success: false, error: 'Missing name or password' }, 400);
        }

        const connectionString = context.env.HYPERDRIVE.connectionString;
        const pool = getPool(connectionString);


        //hash password
        const hashedPassword = await bcrypt.hash(password + ":" + username.toLowerCase(), "$2b$10$aGeTwj/NtHcu4heQnKyqbu");
        //get saved hashed password from db
        const result = await pool.query(
            //'INSERT INTO Users (username, password) VALUES ($1, $2) RETURNING id',
            //[username, password]
            'SELECT password FROM users WHERE username = $1 LIMIT 1',
            [username]
        );

        //if result.rows.length ==0 return a 401 (Unauthorized)
        if(result.rows.length == 0) {
            return context.json({success: false}, 401);
        }

        //compare the password, and return 401 if not a match
        if (hashedPassword !== result.rows[0].password) {
            return context.json({ success: false, foo: foo }, 401);
        }


        // upgrade tokens to real jwt's
        const jwtToken = jwt.sign({ sub: result.rows[0].userId }, context.env.JWT_SECRET, { expiresIn: '1h' });

        //return a token if they match, with a 200 code
        return context.json({ success: true, token: jwtToken,  userId: result.rows[0].id }, 200);
    } catch (err: any) {
        console.error(err);
        context.status(500);
        return context.json({ success: false,  error: err.message });
    }


})

app.post('/register', async (context) => {

    try {
        const body = await context.req.json(); // Parse JSON body

        const { username, password } = body;

        if (!username || !password) {
            return context.json({ success: false, error: 'Missing name or password' }, 400);
        }

        const connectionString = context.env.HYPERDRIVE.connectionString;
        const pool = getPool(connectionString);

        //hash password
        const hashedPassword = await bcrypt.hash(password + ":" + username.toLowerCase(), "$2b$10$aGeTwj/NtHcu4heQnKyqbu");

        //get saved hashed password from db
        const result = await pool.query(
            'INSERT INTO Users (username, password) VALUES ($1, $2) RETURNING id',
            [username, hashedPassword]

        );

        return context.json({ success: true, userId: result.rows[0].id });
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }


})


export default app
