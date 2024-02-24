import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const channels = sqliteTable("channels", {
  id: integer("channels.id", { mode: "number" })
    .primaryKey({
      autoIncrement: true,
    })
    .notNull(),
  number: integer("channels.number", { mode: "number" }).default(0).notNull(),
  name: text("channels.name"),
});
