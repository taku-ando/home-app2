import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const families = sqliteTable("families", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
});
