import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "./schema";

export type DrizzleD1DB = DrizzleD1Database<typeof schema>;
