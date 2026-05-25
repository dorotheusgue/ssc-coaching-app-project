import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function buildDb() {
 const url = process.env.DB_URL;
 const authToken = process.env.DB_TOKEN;
 if (!url) {
 throw new Error("DB_URL is not set");
 }
 const client = createClient({ url, authToken });
 return drizzle(client, { schema });
}

export function getDb() {
 if (!_db) {
 _db = buildDb();
 }
 return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
 get(_target, prop) {
 const database = getDb();
 const value = Reflect.get(database, prop);
 if (typeof value === "function") {
 return value.bind(database);
 }
 return value;
 },
});
