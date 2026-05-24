import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index";

await migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations applied.");
