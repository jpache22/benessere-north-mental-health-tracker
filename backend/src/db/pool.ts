import {Client, Pool} from "pg";



/*
so basically cloudflare already does pooling and also runs multiple machines(I think :)) so you need to make
a connection every call becuase you may not be sent to the same machine you were on the last time
this new getConnnection creates a new connection client that does esssntially what the last one did but better - JM

 */
export async function  getConnection(connectionString: string){
    const client = new Client({
        connectionString: connectionString,
    });

    await client.connect();
    return client;
}