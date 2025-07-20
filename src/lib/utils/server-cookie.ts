import { cookies } from "next/headers";

// Cookie設定の定数
const COOKIE_CONFIG = {
  SELECTED_GROUP_ID: "selectedGroupId",
  MAX_AGE: 60 * 60 * 24 * 30, // 30日
  HTTP_ONLY: false, // クライアントサイドで読み取り可能にする
  SECURE: process.env.NODE_ENV === "production",
  SAME_SITE: "strict" as const,
} as const;

/**
 * 現在選択されているグループIDをcookieから取得（サーバーサイド用）
 */
export async function getSelectedGroupId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const groupIdCookie = cookieStore.get(COOKIE_CONFIG.SELECTED_GROUP_ID);

    if (!groupIdCookie?.value) {
      return null;
    }

    const groupId = parseInt(groupIdCookie.value, 10);
    return Number.isNaN(groupId) ? null : groupId;
  } catch (error) {
    console.error("Error getting selected group ID from cookie:", error);
    return null;
  }
}

/**
 * 選択されているグループIDをcookieに設定（サーバーサイド用）
 */
export async function setSelectedGroupId(groupId: number): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_CONFIG.SELECTED_GROUP_ID, groupId.toString(), {
      httpOnly: COOKIE_CONFIG.HTTP_ONLY,
      secure: COOKIE_CONFIG.SECURE,
      sameSite: COOKIE_CONFIG.SAME_SITE,
      maxAge: COOKIE_CONFIG.MAX_AGE,
    });
  } catch (error) {
    console.error("Error setting selected group ID to cookie:", error);
  }
}

/**
 * 選択されているグループIDのcookieを削除（サーバーサイド用）
 */
export async function clearSelectedGroupId(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_CONFIG.SELECTED_GROUP_ID);
  } catch (error) {
    console.error("Error clearing selected group ID cookie:", error);
  }
}
