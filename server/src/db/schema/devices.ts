import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { channels } from "./channels";
import { sql } from "drizzle-orm";

export const devices = sqliteTable("devices", {
  id: integer("devices.id", { mode: "number" })
    .primaryKey({
      autoIncrement: true,
    })
    .notNull(),
  ip: text("devices.ip").notNull(),
  port: integer("devices.port")
    .default(sql`53001`)
    .notNull(),
  name: text("devices.name"),
  location: text("devices.location"),
  hidden: integer("devices.hidden", { mode: "boolean" })
    .default(false)
    .notNull(),
  channel: integer("channels.id", { mode: "number" })
    .default(sql`NULL`)
    .references(() => channels.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
});
