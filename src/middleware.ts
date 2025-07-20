import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  // 認証が不要なパス（ログインページとAPIルート）
  const publicPaths = ["/login", "/api/auth"];

  // 現在のパスが認証不要パスかチェック
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 認証不要のパスの場合は処理をスキップ
  if (isPublicPath) {
    return NextResponse.next();
  }

  // セッションを取得
  const session = await auth();

  // 未認証の場合はログインページにリダイレクト
  if (!session?.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
