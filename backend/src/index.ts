import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { Client } from "pg";


type Bindings = {
  HYPERDRIVE: Hyperdrive,
  MAIN_PAGES_URL: string,
  DEV_PAGES_URL: string
}

const app = new Hono<{Bindings: Bindings}>()

// must add Cross-origin resource sharing permissions for the pages urls
app.use('*', async(context, next) => { // next is a function that tells hono to continue to the next middleware/route handler
  const corsMiddleware = cors({
    origin: [context.env.DEV_PAGES_URL, context.env.MAIN_PAGES_URL],
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

  const client = new Client({connectionString});
  
  try {
    // query the current data and time
    await client.connect(); // connect to the database
    const result = await client.query(`SELECT NOW();`); // SQL query
    return context.json({success: true, date: result.rows[0].now});
  } catch(err: any) {
    console.error(err);
    return context.json({success: false, error: err.message}, 500);
  }
})

export default app
