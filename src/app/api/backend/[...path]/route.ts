import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_COOKIE_NAME = "kasa_session";

interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}

async function proxyRequest(request: Request, context: RouteContext) {
  const API_URL = process.env.API_URL;

  if (!API_URL) {
    return NextResponse.json(
      {
        message: "La variable API_URL n'est pas définie.",
      },
      {
        status: 500,
      },
    );
  }

  const cookieStore = await cookies();

  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      {
        message: "Vous devez être connecté.",
      },
      {
        status: 401,
      },
    );
  }

  const { path } = await context.params;

  const requestUrl = new URL(request.url);

  const targetUrl =
    `${API_URL.replace(/\/$/, "")}/${path.join("/")}` + requestUrl.search;

  const headers = new Headers();

  headers.set("Authorization", `Bearer ${token}`);

  headers.set("Accept", "application/json");

  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);

  const backendResponse = await fetch(targetUrl, {
    method: request.method,

    headers,

    body: hasBody ? await request.arrayBuffer() : undefined,

    cache: "no-store",
  });

  if (backendResponse.status === 401) {
    cookieStore.set({
      name: TOKEN_COOKIE_NAME,

      value: "",

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 0,
    });
  }

  const body = await backendResponse.arrayBuffer();

  const responseHeaders = new Headers();

  const responseContentType = backendResponse.headers.get("content-type");

  if (responseContentType) {
    responseHeaders.set("Content-Type", responseContentType);
  }

  return new Response(body, {
    status: backendResponse.status,

    statusText: backendResponse.statusText,

    headers: responseHeaders,
  });
}

export function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}