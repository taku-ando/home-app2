import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createMiddleware } from "hono/factory";
import { DIContainer } from "../../di/container";
import { getDb } from "../../infrastructure/db";

type Env = {
  Variables: {
    diContainer: DIContainer;
  };
};

export const diMiddleware = createMiddleware<Env>(async (c, next) => {
  const { env } = getCloudflareContext();
  if (!env.HOME_APP2_DB) {
    return c.json(
      {
        success: false,
        error: "Database not configured",
        message: "D1 database binding not found",
      },
      503
    );
  }

  const db = getDb(env.HOME_APP2_DB);
  const container = new DIContainer(db);
  c.set("diContainer", container);

  await next();
});
