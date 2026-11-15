import { NextResponse } from "next/server";

/**
 * Termine la session en expirant le cookie JWT HttpOnly.
 * Aucun jeton n'est conservé côté navigateur après déconnexion.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set({
    name: "kasa_session",
    value: "",

    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: "lax",

    path: "/",

    maxAge: 0,
  });

  return response;
}
