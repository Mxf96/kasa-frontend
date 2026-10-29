import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { AuthUser, UserRole } from "@/types/auth";

interface JwtPayload {
  id?: number | string;
  userId?: number | string;
  sub?: number | string;
  email?: string;
  role?: UserRole;
  exp?: number;
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

export async function GET() {
  const cookieStore = await cookies();

  const token = cookieStore.get("kasa_session")?.value;

  if (!token) {
    return NextResponse.json(
      {
        user: null,
      },
      {
        status: 401,
      },
    );
  }

  const payload = decodeJwt(token);

  if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) {
    const response = NextResponse.json(
      {
        user: null,
      },
      {
        status: 401,
      },
    );

    response.cookies.set({
      name: "kasa_session",
      value: "",
      path: "/",
      maxAge: 0,
    });

    return response;
  }

  const user: AuthUser = {
    id: payload.id ?? payload.userId ?? payload.sub ?? null,

    email: payload.email ?? null,

    role: payload.role ?? null,
  };

  return NextResponse.json({
    user,
  });
}