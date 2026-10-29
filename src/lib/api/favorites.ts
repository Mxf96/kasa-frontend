import type { Property } from "@/types/property";

interface FavoritesObjectResponse {
  favorites?: Property[];

  data?:
    | Property[]
    | {
        favorites?: Property[];
      };
}

type FavoritesResponse = Property[] | FavoritesObjectResponse;

function normalizeFavorites(data: FavoritesResponse): Property[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.favorites)) {
    return data.favorites;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (
    data.data &&
    !Array.isArray(data.data) &&
    Array.isArray(data.data.favorites)
  ) {
    return data.data.favorites;
  }

  return [];
}

export async function getFavorites(
  userId: string | number,
): Promise<Property[]> {
  const response = await fetch(
    `/api/backend/api/users/${encodeURIComponent(String(userId))}/favorites`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer les favoris.");
  }

  const data = (await response.json()) as FavoritesResponse;

  return normalizeFavorites(data);
}

export async function addFavorite(propertyId: string): Promise<void> {
  const response = await fetch(
    `/api/backend/api/properties/${encodeURIComponent(propertyId)}/favorite`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;

    throw new Error(
      data?.message ??
        data?.error ??
        "Impossible d'ajouter le logement aux favoris.",
    );
  }
}

export async function removeFavorite(propertyId: string): Promise<void> {
  const response = await fetch(
    `/api/backend/api/properties/${encodeURIComponent(propertyId)}/favorite`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;

    throw new Error(
      data?.message ??
        data?.error ??
        "Impossible de retirer le logement des favoris.",
    );
  }
}