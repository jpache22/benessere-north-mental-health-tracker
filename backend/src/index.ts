import {Context, Hono} from 'hono'
import {cors} from 'hono/cors';
import {Bindings} from './types';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';
import {getPool} from './db/pool';
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
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
            'SELECT * FROM users WHERE username = $1 LIMIT 1',
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
            userId: result.rows[0].id ?? "",
            username: result.rows[0].username ?? "",
            role: result.rows[0].role ?? ""
        };

        const jwtToken = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuer('BenessereNorth')
            .setExpirationTime('1h')
            .sign(secret);

        //return a token if they match, with a 200 code
        return context.json({ success: true, token: jwtToken,  userId: result.rows[0].id, role: result.rows[0].role, username: result.rows[0].username, email: result.rows[0].email }, 200);
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
            'INSERT INTO Users (username, password, passwordsalt, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, hashedPassword, salt, email, "patient"]

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

///TEST FUNCTION
async function testCheckAuthToken() {
    // Create a JWT for testing
    const secret = new TextEncoder().encode("supersecret");

    const payload1 = {
        userId: "123",
        username: "user1",
        role: "admin"
    };

    const jwt = await new jose.SignJWT(payload1)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer("BenessereNorth")
        .setExpirationTime('2h')
        .sign(secret);

    // Mock context
    const context = {
        req: {
            header: (name: string) => {
                if (name.toLowerCase() === 'authorization') {
                    return `Bearer ${jwt}`;
                }
                return null;
            }
        },
        env: {
            JWT_SECRET: "supersecret"
        }
    } as any;

    // Test the function
    const payload = await check_auth_token(context);
    console.log("Decoded payload:", payload);
}

//testCheckAuthToken();


app.get('/adminFetchTable', async (context) => {

    try {
        //check to make sure caller as access to this data
        const authToken = await check_auth_token(context);

        if ( authToken == null) {
            //if returns null then caller does not have clearance return unauthorized
            return context.json({success: false}, 401);
        }

        if(authToken.role !== "admin") {
            return context.json({success: false}, 403);
        }

        const connectionString = context.env.HYPERDRIVE.connectionString;
        const pool = getPool(connectionString);

        //get saved hashed password from db
        const result = await pool.query(
            //'INSERT INTO Users (username, password) VALUES ($1, $2) RETURNING id',
            //[username, password]
            'SELECT id, username, email, role FROM users'
        );


        const payload = {
            count: result.rows.length,
            data: result.rows
        };


        return context.json({ success: true, payload: payload}, 200);
    } catch (err : any) {
        console.error(err);
        return context.json({ success: false, error: err.message }, 500);
    }

});

//update User table~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
interface UserUpdatePayload {
    id: number;
    username: string;
    password?: string | null;
    email?: string | null;
    role?: string | null;
}


function isUserUpdatePayload(body: any): body is UserUpdatePayload {
    return (
        typeof body === "object" &&
        body !== null &&
        "id" in body &&
        "username" in body &&
        typeof body.username === "string"
    );
}

async function userUpdateSql(body: unknown) {
    if (!isUserUpdatePayload(body)) {
        throw new Error("Invalid request body");
    }

    const { id, username, password, email, role } = body;

    let setClauses = [];
    let values: (string | number | null)[] = [id];   // $1 is always id
    let paramIndex = 2;  // Next placeholder is $2

    if (email != null) {
        setClauses.push(`email = $${paramIndex++}`);
        values.push(email);
    }

    if (role != null) {
        setClauses.push(`role = $${paramIndex++}`);
        values.push(role);
    }

    let outPasswordSalt = "";
    let outHashedPassword = "";

    if (password != null) {
        outPasswordSalt = await bcrypt.genSalt(10);
        outHashedPassword = await bcrypt.hash(password + ":" + username.toLowerCase(), outPasswordSalt);

        setClauses.push(`password = $${paramIndex++}`);
        values.push(outHashedPassword);

        setClauses.push(`passwordsalt = $${paramIndex++}`);
        values.push(outPasswordSalt);
    }

    if (setClauses.length === 0) return null;

    const sql = `UPDATE users SET ${setClauses.join(", ")} WHERE id = $1`;

    return { sql, values };
}

app.post('/userUpdate', async (context) => {
    try {
        // Access control
        const authToken = await check_auth_token(context);
        if (!authToken) return context.json({ success: false }, 401);
        if (authToken.role !== "admin") return context.json({ success: false }, 403);

        const body = await context.req.json();

        // Require username in body for hashing
        if (!body.username || typeof body.username !== "string") {
            return context.json({ success: false, error: "Username is required" }, 400);
        }

        // Build SQL
        const updateResult = await userUpdateSql(body);
        if (!updateResult)
            return context.json({ success: true }, 200); // nothing to update

        const { sql, values } = updateResult;

        // DB Connection
        const pool = getPool(context.env.HYPERDRIVE.connectionString);

        // Run update once
        const queryResult = await pool.query(sql, values);

        if(queryResult.rowCount === 0) return context.json({success:false}, 404);

        return context.json({ success: true }, 200);

    } catch (err) {
        console.error(err);
        return context.json({ success: false, error: err }, 500);
    }
});


app.post('/users/self/password', async (context) => {
    //{ "password": "fo456",  "old_pass": "sfdsdgsd"}

    try {
        // Access control
        const authToken = await check_auth_token(context);
        if (!authToken) return context.json({success: false}, 401);



        let body = await context.req.json();
        //body.userid = context.req.param('userid');
        body.username = authToken.username;

        // Require username in body for hashing
        if (!body.username || typeof body.username !== "string") {
            return context.json({ success: false, error: "Login Token is damaged" }, 500);
        }

        // Build SQL
        const updateResult = await userUpdateSql(body);
        if (!updateResult)
            return context.json({ success: true }, 200); // nothing to update

        const { sql, values } = updateResult;

        // DB Connection
        const pool = getPool(context.env.HYPERDRIVE.connectionString);

        // Run update once
        const queryResult = await pool.query(sql, values);

        if(queryResult.rowCount === 0) return context.json({success:false}, 404);

        return context.json({ success: true }, 200);

    } catch (err) {
        console.error(err);
        return context.json({ success: false, error: err }, 500);
    }


});




// routes for groups and projects
app.route('/groups', groups);
app.route('/projects', projects);

// form routes
app.route('/phq9', phq9);


export default app


//delete when done used for local testing
//check_auth_token("{ 'req': { 'hedaers': ['Authorization': 'bearer foo']} }")