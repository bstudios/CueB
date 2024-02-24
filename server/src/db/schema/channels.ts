import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { devices } from "./devices";

export const channels = sqliteTable("channels", {
  id: integer("channels.id", { mode: "number" })
    .primaryKey({
      autoIncrement: true,
    })
    .notNull(),
  number: integer("channels.id", { mode: "number" }).default(0).notNull(),
  name: text("channels.name"),
});

export const channelsRelations = relations(devices, ({ many }) => ({
  devices: many(devices),
}));
