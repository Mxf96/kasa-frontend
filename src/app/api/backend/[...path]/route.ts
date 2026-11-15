import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_COOKIE_NAME = "kasa_session";

interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}

/**
 * Proxifie une requête authentifiée vers l'API Express à URL de base fixe.
 * Le token vient du cookie HttpOnly et est ajouté dans l'en-tête `Authorization`.
 * Le corps et le statut de réponse sont retransmis au navigateur.
 *
 * @param request - Requête entrante vers `/api/backend/...`.
 * @param context - Segments de chemin fournis par l'App Router.
 * @returns La réponse HTTP du backend ou une erreur de session/configuration.
 */
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

  // Les méthodes GET et HEAD ne doivent pas transmettre de corps de requête.
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

/** Route GET du proxy authentifié. */
export function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

/** Route POST du proxy authentifié. */
export function POST(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

/** Route PATCH du proxy authentifié. */
export function PATCH(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

/** Route DELETE du proxy authentifié. */
export function DELETE(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}