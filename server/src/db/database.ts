import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import BetterSQLite3DatabaseLib from "better-sqlite3";
import path from "path";
import { devices, devicesRelations } from "./schema/devices";
import { channels, channelsRelations } from "./schema/channels";

export const createDatabase = () => {
  const sqlite = new BetterSQLite3DatabaseLib(
    path.join(__dirname, "../../sqlite.db")
  );
  const db = drizzle(sqlite, {
    schema: {
      devices,
      devicesRelations,
      channels,
      channelsRelations,
    },
  });
  migrate(db, {
    migrationsFolder: "src/db/migrations",
  });
  console.log("Database initialized.");
  return db;
};

export class Database {
  static db: ReturnType<typeof createDatabase>;
  constructor() {
    Database.db = createDatabase();
  }
}
