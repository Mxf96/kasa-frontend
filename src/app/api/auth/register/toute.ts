import { NextResponse } from "next/server";

const API_URL = process.env.API_URL;

interface RegisterResponse {
  message?: string;
  error?: string;
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

    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          message: "Tous les champs sont obligatoires.",
        },
        {
          status: 400,
        },
      );
    }

    const backendResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,

        // Un nouvel utilisateur est un client par défaut.
        role: "client",

        // Le backend peut exploiter ce champ s'il le supporte.
        name: `${firstName.trim()} ${lastName.trim()}`,
      }),

      cache: "no-store",
    });

    const data = (await backendResponse.json()) as RegisterResponse;

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message:
            data.message ?? data.error ?? "Impossible de créer le compte.",
        },
        {
          status: backendResponse.status,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 201,
      },
    );
  } catch {
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