import { Hono } from 'hono'
import { Client } from "pg";

type Bindings = {
  HYPERDRIVE: Hyperdrive,
}

const app = new Hono<{Bindings: Bindings}>()



app.get('/', (c) => {
  return c.text('Hello Cloudflare Workers!')
})

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
