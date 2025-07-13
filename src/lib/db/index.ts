import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";
import type { DrizzleD1DB } from "./types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDb(d1: D1Database): DrizzleD1DB {
  return drizzle(d1, { schema });
}

export const getD1Sesstion = async () => {
  if (process.env.DB) {
    return process.env.DB
  } else {
    try {
      return (getCloudflareContext().env as any).HOME_APP2_DB as D1Database
    } catch (e) {
      console.error(e)
      return null;
    }
  }
}