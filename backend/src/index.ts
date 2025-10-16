import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { Client } from "pg";

import { Pool } from "pg";


type Bindings = {
  HYPERDRIVE: Hyperdrive,
  MAIN_PAGES_URL: string,
  DEV_PAGES_URL: string,
  JMASER_DEV_PAGES_URL: string
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
        return context.json({ success: true, date: result.rows[0].now });
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }
})

export default app
