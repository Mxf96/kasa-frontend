import { NextResponse } from "next/server";

import type { AuthUser, UserRole } from "@/types/auth";

const API_URL = process.env.API_URL;

interface JwtPayload {
  id?: number | string;
  userId?: number | string;
  sub?: number | string;
  email?: string;
  role?: UserRole;
  exp?: number;
}

interface BackendUser {
  id?: number | string;
  email?: string;
  role?: UserRole;
}

interface BackendLoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;

  user?: BackendUser;

  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    user?: BackendUser;
  };

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
        message: "La variable API_URL n'est pas définie.",
      },
      {
        status: 500,
      },
    );
  }

  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim() : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "L'adresse email et le mot de passe sont obligatoires.",
        },
        {
          status: 400,
        },
      );
    }

    console.log("[LOGIN] Envoi au backend :", {
      email,
      password: "***",
    });

    const backendResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",

      headers: {
        Accept: "application/json",

        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),

      cache: "no-store",
    });

    const responseText = await backendResponse.text();

    let data: BackendLoginResponse = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText) as BackendLoginResponse;
      } catch {
        data = {
          message: responseText,
        };
      }
    }

    console.log("[LOGIN] Réponse backend :", {
      status: backendResponse.status,

      ok: backendResponse.ok,

      data,
    });

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

    const token =
      data.token ??
      data.accessToken ??
      data.access_token ??
      data.data?.token ??
      data.data?.accessToken ??
      data.data?.access_token;

    if (!token) {
      console.error("[LOGIN] Aucun token trouvé :", data);

      return NextResponse.json(
        {
          message: "Aucun token n'a été retourné par le backend.",
        },
        {
          status: 500,
        },
      );
    }

    const payload = decodeJwt(token);

    const backendUser = data.user ?? data.data?.user;

    const user: AuthUser = {
      id:
        backendUser?.id ?? payload.id ?? payload.userId ?? payload.sub ?? null,

      email: backendUser?.email ?? payload.email ?? email,

      role: backendUser?.role ?? payload.role ?? null,
    };

    const response = NextResponse.json({
      user,
    });

    response.cookies.set({
      name: "kasa_session",
      value: token,

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("[LOGIN] Erreur :", error);

    return NextResponse.json(
      {
        message: "Impossible de communiquer avec le serveur.",
      },
      {
        status: 500,
      },
    );
  }
}