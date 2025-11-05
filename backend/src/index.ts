import { Hono } from 'hono'
import { Context } from 'hono';
import { cors } from 'hono/cors';
import { Bindings } from './types';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { getPool } from './db/pool';
import phq9 from './forms/phq9';
import groups from './db/groups';
import projects from './db/projects';

const app = new Hono<{Bindings: Bindings}>()

// must add Cross-origin resource sharing permissions for the pages urls
app.use('*', async(context, next) => { // next is a function that tells hono to continue to the next middleware/route handler
  const corsMiddleware = cors({
    origin: [
        context.env.MAIN_PAGES_URL,
        context.env.JULISSA_DEV_PAGES_URL, 
        context.env.JMASER_DEV_PAGES_URL,
        context.env.ANDY_DEV_PAGES_URL,
        context.env.SHAWN_DEV_PAGES_URL
    ],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    credentials: true
  });

  return corsMiddleware(context, next);
});

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

        //get saved hashed password from db
        const result = await pool.query(
            //'INSERT INTO Users (username, password) VALUES ($1, $2) RETURNING id',
            //[username, password]
            'SELECT password, passwordsalt FROM users WHERE username = $1 LIMIT 1',
            [username]
        );

        //if result.rows.length ==0 return a 401 (Unauthorized)
        if(result.rows.length == 0) {
            return context.json({success: false}, 401);
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password + ":" + username.toLowerCase(), result.rows[0].passwordsalt);

        //compare the password, and return 401 if not a match
        if (hashedPassword !== result.rows[0].password) {
            return context.json({ success: false, foo: foo }, 401);
        }

        const secret = new TextEncoder().encode(context.env.JWT_SECRET);

        const payload = {
            userId: result.rows[0].id,
            username: result.rows[0].username,
            role: result.rows[0].role
        };

        const jwtToken = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuer('BenessereNorth')
            .setExpirationTime('1h')
            .sign(secret);

        //return a token if they match, with a 200 code
        return context.json({ success: true, token: jwtToken,  userId: result.rows[0].id }, 200);
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }


});

app.post('/register', async (context) => {

    try {
        const body = await context.req.json(); // Parse JSON body

        const { username, password, email } = body;

        if (!username || !password || !email) {
            return context.json({ success: false, error: 'Missing name or password' }, 400);
        }

        const connectionString = context.env.HYPERDRIVE.connectionString;
        const pool = getPool(connectionString);


        const salt = await bcrypt.genSalt(10);
        //hash password
        const hashedPassword = await bcrypt.hash(password + ":" + username.toLowerCase(), salt);

        //get saved hashed password from db
        const result = await pool.query(
            'INSERT INTO Users (username, password, passwordsalt, email) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, hashedPassword, salt, email]

        );

        return context.json({ success: true, userId: result.rows[0].id });
    } catch (err: any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }


});


export async function check_auth_token(context: Context) {
    try {
        //Get Authorization header
        const authHeader = context.req.header('authorization');

        if (!authHeader) {
            console.warn("Missing Authorization header");
            return null;
        }

        //Check for "Bearer " prefix
        if (!authHeader.startsWith("Bearer ")) {
            console.warn("Authorization header missing 'Bearer' prefix");
            return null;
        }

        //Extract the JWT token
        const jwt = authHeader.substring("Bearer ".length).trim();
        if (!jwt) {
            console.warn("Empty JWT after trimming");
            return null;
        }

        //Prepare the secret (must be Uint8Array for jose)
        const secret = new TextEncoder().encode(context.env.JWT_SECRET);

        //Verify the token (throws if invalid, expired, or signature mismatch)
        const { payload } = await jose.jwtVerify(jwt, secret, {
            issuer: "BenessereNorth",   // match the issuer you used in jwt.sign
        });

        //Return decoded payload
        return payload;

    } catch (err: any) {
        // Catch decoding or verification errors
        console.error("JWT verification failed:", err.message);
        return null;
    }
}


// routes for groups and projects
app.route('/groups', groups);
app.route('/projects', projects);

// form routes
app.route('/phq9', phq9);


export default app


//delete when done used for local testing
//check_auth_token("{ 'req': { 'hedaers': ['Authorization': 'bearer foo']} }")