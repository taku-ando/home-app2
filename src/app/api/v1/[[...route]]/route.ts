import type { NextRequest } from "next/server";
import { app } from "@/lib/api/hono";

// Honoアプリと統合するヘルパー関数
async function handleRequest(request: NextRequest, method: string) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/v1", "") || "/";

  // HonoのRequestを作成
  const honoRequest = new Request(`${url.origin}${path}${url.search}`, {
    method,
    headers: request.headers,
    body:
      method !== "GET" && method !== "HEAD" ? await request.blob() : undefined,
  });

  // Honoアプリで処理
  return await app.fetch(honoRequest);
}

export async function GET(request: NextRequest) {
  return handleRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, "DELETE");
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, "PATCH");
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request, "OPTIONS");
}
