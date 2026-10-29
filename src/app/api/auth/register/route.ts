import { NextResponse } from "next/server";

const API_URL = process.env.API_URL;

interface BackendRegisterResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
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

    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";

    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim() : "";

    /*
     * Accepte :
     * { name, email, password }
     *
     * ou :
     * { firstName, lastName, email, password }
     */
    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : `${firstName} ${lastName}`.trim();

    const email = typeof body.email === "string" ? body.email.trim() : "";

    const password = typeof body.password === "string" ? body.password : "";

    console.log("[REGISTER] Données reçues du frontend :", {
      name,
      email,
      passwordReceived: Boolean(password),
    });

    if (!name) {
      console.error("[REGISTER] Nom manquant");

      return NextResponse.json(
        {
          message: "Le nom est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          message: "L'adresse email est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          message: "Le mot de passe est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    const payload = {
      name,
      email,
      password,
      role: "client",
    };

    console.log("[REGISTER] Envoi au backend :", {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      password: "***",
    });

    const backendResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),

      cache: "no-store",
    });

    const responseText = await backendResponse.text();

    let data: BackendRegisterResponse = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText) as BackendRegisterResponse;
      } catch {
        data = {
          message: responseText,
        };
      }
    }

    console.log("[REGISTER] Réponse backend :", {
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
            `Erreur backend (${backendResponse.status})`,
        },
        {
          status: backendResponse.status,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[REGISTER] Erreur interne :", error);

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