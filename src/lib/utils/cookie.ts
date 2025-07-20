import { cookies } from "next/headers";

// Cookie設定の定数
const COOKIE_CONFIG = {
  SELECTED_GROUP_ID: "selectedGroupId",
  MAX_AGE: 60 * 60 * 24 * 30, // 30日
  HTTP_ONLY: true,
  SECURE: process.env.NODE_ENV === "production",
  SAME_SITE: "strict" as const,
} as const;

/**
 * 現在選択されているグループIDをcookieから取得
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
 * 選択されているグループIDをcookieに設定
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
 * 選択されているグループIDのcookieを削除
 */
export async function clearSelectedGroupId(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_CONFIG.SELECTED_GROUP_ID);
  } catch (error) {
    console.error("Error clearing selected group ID cookie:", error);
  }
}

/**
 * クライアントサイド用のcookie操作ユーティリティ
 */
export const clientCookieUtils = {
  /**
   * クライアントサイドでグループIDを取得
   */
  getSelectedGroupId(): number | null {
    if (typeof document === "undefined") {
      return null;
    }

    const cookies = document.cookie.split(";");
    const groupIdCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${COOKIE_CONFIG.SELECTED_GROUP_ID}=`)
    );

    if (!groupIdCookie) {
      return null;
    }

    const value = groupIdCookie.split("=")[1];
    const groupId = parseInt(value, 10);
    return Number.isNaN(groupId) ? null : groupId;
  },

  /**
   * クライアントサイドでグループIDを設定
   */
  setSelectedGroupId(groupId: number): void {
    if (typeof document === "undefined") {
      return;
    }

    const cookieString = [
      `${COOKIE_CONFIG.SELECTED_GROUP_ID}=${groupId}`,
      `Max-Age=${COOKIE_CONFIG.MAX_AGE}`,
      `SameSite=${COOKIE_CONFIG.SAME_SITE}`,
      COOKIE_CONFIG.SECURE ? "Secure" : "",
      "Path=/",
    ]
      .filter(Boolean)
      .join("; ");

    document.cookie = cookieString;
  },

  /**
   * クライアントサイドでcookieを削除
   */
  clearSelectedGroupId(): void {
    if (typeof document === "undefined") {
      return;
    }

    document.cookie = `${COOKIE_CONFIG.SELECTED_GROUP_ID}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },
};
