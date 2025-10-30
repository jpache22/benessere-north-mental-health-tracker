import { Pool } from "pg";

//this is a pool it manages connections to database(s) with reuse!
let pool: Pool;

export function getPool(connectionString: string): Pool {
    if (!pool) {
        pool = new Pool({ connectionString });
    }
    return pool;
}