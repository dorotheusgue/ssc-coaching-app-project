import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

let _db: ReturnType<typeof createDatabase<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDatabase(schema);
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof createDatabase<typeof schema>>, {
  get(_target, prop) {
    const database = getDb();
    const value = Reflect.get(database, prop);
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});
