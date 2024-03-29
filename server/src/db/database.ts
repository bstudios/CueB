import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import BetterSQLite3DatabaseLib from "better-sqlite3";
import path from "path";
import * as devicesSchema from "./schema/devices";
import * as channelsSchema from "./schema/channels";
import * as relations from "./schema/relations";

export const createDatabase = (databaseAddress: string) => {
  const sqlite = new BetterSQLite3DatabaseLib(databaseAddress);
  const db = drizzle(sqlite, {
    schema: {
      ...devicesSchema,
      ...channelsSchema,
      ...relations,
    },
  });
  migrate(db, {
    migrationsFolder: path.join(__dirname, "../../src/db/migrations/"),
  });
  console.log("Database initialized.");
  return db;
};

export class Database {
  static db: ReturnType<typeof createDatabase>;
  constructor(databaseAddress: string) {
    Database.db = createDatabase(databaseAddress);
  }
}
