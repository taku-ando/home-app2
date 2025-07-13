import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";
import type { DrizzleD1DB } from "./types";

export function getDb(d1: D1Database): DrizzleD1DB {
  return drizzle(d1, { schema });
}
