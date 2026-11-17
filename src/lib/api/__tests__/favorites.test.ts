import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addFavorite, getFavorites, removeFavorite } from "../favorites";

import type { Property } from "@/types/property";

const property: Property = {
  id: "logement-1",
  slug: "appartement-paris",
  title: "Appartement à Paris",
  description: "Un appartement à Paris",
  cover: "/images/paris.jpg",
  location: "Paris",
  price_per_night: 95,
  rating_avg: 4.5,
  ratings_count: 8,
  host: { id: 7, name: "Marie", picture: null },
};

const fetchMock = vi.fn<typeof fetch>();

/** Simule une réponse HTTP sans effectuer de véritable requête réseau. */
function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("API des favoris", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("récupère les favoris de l'utilisateur avec une requête non mise en cache", async () => {
    fetchMock.mockResolvedValue(response([property]));

    const result = await getFavorites(12);

    expect(result).toEqual([property]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend/api/users/12/favorites",
      { method: "GET", cache: "no-store" },
    );
  });

  it.each([
    { format: "tableau direct", data: [property] },
    { format: "objet favorites", data: { favorites: [property] } },
    { format: "objet data/tableau", data: { data: [property] } },
    { format: "objet data/favorites", data: { data: { favorites: [property] } } },
  ])("normalise la réponse sous le format $format", async ({ data }) => {
    fetchMock.mockResolvedValue(response(data));

    expect(await getFavorites("12")).toEqual([property]);
  });

  it("retourne une liste vide lorsque la réponse ne contient pas de favoris", async () => {
    fetchMock.mockResolvedValue(response({ data: {} }));

    expect(await getFavorites(12)).toEqual([]);
  });

  it("encode l'identifiant de l'utilisateur dans l'URL", async () => {
    fetchMock.mockResolvedValue(response([]));

    await getFavorites("utilisateur 12/3");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend/api/users/utilisateur%2012%2F3/favorites",
      { method: "GET", cache: "no-store" },
    );
  });

  it("rejette la récupération lorsque l'API renvoie une erreur HTTP", async () => {
    fetchMock.mockResolvedValue(response({ message: "Non autorisé" }, 401));

    await expect(getFavorites(12)).rejects.toThrow("Impossible de récupérer les favoris.");
  });

  it("ajoute un favori via une requête POST", async () => {
    fetchMock.mockResolvedValue(response({}, 201));

    await expect(addFavorite("logement-1")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend/api/properties/logement-1/favorite",
      { method: "POST" },
    );
  });

  it("supprime un favori via une requête DELETE", async () => {
    fetchMock.mockResolvedValue(response({}, 204));

    await expect(removeFavorite("logement-1")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend/api/properties/logement-1/favorite",
      { method: "DELETE" },
    );
  });

  it("encode l'identifiant du logement lors de l'ajout", async () => {
    fetchMock.mockResolvedValue(response({}, 200));

    await addFavorite("logement/avec espace");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend/api/properties/logement%2Favec%20espace/favorite",
      { method: "POST" },
    );
  });

  it("remonte le message d'erreur retourné par l'API lors d'un ajout", async () => {
    fetchMock.mockResolvedValue(response({ message: "Favori déjà enregistré" }, 409));

    await expect(addFavorite("logement-1")).rejects.toThrow("Favori déjà enregistré");
  });

  it("remonte le message d'erreur retourné par l'API lors d'une suppression", async () => {
    fetchMock.mockResolvedValue(response({ error: "Suppression interdite" }, 403));

    await expect(removeFavorite("logement-1")).rejects.toThrow("Suppression interdite");
  });

  it("utilise un message de repli lorsque l'erreur serveur n'est pas du JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new SyntaxError("JSON invalide")),
    } as unknown as Response);

    await expect(addFavorite("logement-1")).rejects.toThrow(
      "Impossible d'ajouter le logement aux favoris.",
    );
  });
});
