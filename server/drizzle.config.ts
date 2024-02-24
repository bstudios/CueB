import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/",
  out: "./src/db/migrations/",
  driver: "better-sqlite",
  dbCredentials: {
    url: "sqlite.db",
  },
});
