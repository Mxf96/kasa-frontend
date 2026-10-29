import { NextResponse } from "next/server";

import type { AuthUser, UserRole } from "@/types/auth";

const API_URL = process.env.API_URL;

interface JwtPayload {
  id?: number | string;
  userId?: number | string;
  sub?: number | string;
  email?: string;
  role?: UserRole;
  name?: string;
  exp?: number;
}

interface LoginResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  user?: Partial<AuthUser>;
  message?: string;
  error?: string;
}

function decodeJwt(token: string): JwtPayload {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return {};
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(
      Buffer.from(normalizedPayload, "base64").toString("utf-8"),
    ) as JwtPayload;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  if (!API_URL) {
    return NextResponse.json(
      {
        message: "La variable d'environnement API_URL n'est pas définie.",
      },
      {
        status: 500,
      },
    );
  }

  try {
    const body = await request.json();

    const backendResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      cache: "no-store",
    });

    const data = (await backendResponse.json()) as LoginResponse;

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message:
            data.message ??
            data.error ??
            "Adresse email ou mot de passe incorrect.",
        },
        {
          status: backendResponse.status,
        },
      );
    }

    const token = data.token ?? data.access_token ?? data.accessToken;

    if (!token) {
      return NextResponse.json(
        {
          message: "Le backend n'a retourné aucun token d'authentification.",
        },
        {
          status: 500,
        },
      );
    }

    const payload = decodeJwt(token);

    const user: AuthUser = {
      id: data.user?.id ?? payload.id ?? payload.userId ?? payload.sub ?? null,

      email: data.user?.email ?? payload.email ?? body.email ?? null,

      role: data.user?.role ?? payload.role ?? null,

      name: data.user?.name ?? payload.name ?? null,
    };

    const response = NextResponse.json({
      user,
    });

    const maxAge = payload.exp
      ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 0)
      : 60 * 60 * 24;

    response.cookies.set({
      name: "kasa_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Impossible de communiquer avec le serveur d'authentification.",
      },
      {
        status: 500,
      },
    );
  }
}