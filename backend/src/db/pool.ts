import {Client, Pool} from "pg";

//this is a pool it manages connections to database(s) with reuse!
let pool: Pool;

export function getPool(connectionString: string): Pool {
    if (!pool) {
        pool = new Pool({ connectionString });
    }
    return pool;
}


export async function  getPool2(connectionString: string){
    const client = new Client({
        connectionString: connectionString,
    });

    await client.connect();
    return client;
}