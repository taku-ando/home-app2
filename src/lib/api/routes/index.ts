import { Hono } from "hono";
import { healthRoutes } from "./health";

// APIルートをまとめるためのメインルーター
export const apiRoutes = new Hono();

// ヘルスチェックルートを追加
apiRoutes.route("/health", healthRoutes);

// 将来的に他のルートもここに追加
// apiRoutes.route('/users', userRoutes)
// apiRoutes.route('/posts', postRoutes)

export default apiRoutes;
