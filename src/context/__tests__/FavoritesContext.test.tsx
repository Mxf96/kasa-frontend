import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FavoritesProvider, useFavorites } from "../FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { addFavorite, getFavorites, removeFavorite } from "@/lib/api/favorites";

import type { AuthUser } from "@/types/auth";
import type { Property } from "@/types/property";

vi.mock("@/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/lib/api/favorites", () => ({
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedGetFavorites = vi.mocked(getFavorites);
const mockedAddFavorite = vi.mocked(addFavorite);
const mockedRemoveFavorite = vi.mocked(removeFavorite);

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

const otherProperty: Property = {
  ...property,
  id: "logement-2",
  slug: "maison-lyon",
  title: "Maison à Lyon",
};

/** Fournit une session simulée au contexte sans contacter la route de connexion. */
function mockSession(user: AuthUser | null, isLoading = false) {
  mockedUseAuth.mockReturnValue({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  });
}

const connectedUser: AuthUser = {
  id: 12,
  email: "client@example.com",
  role: "client",
};

let currentFavorites: ReturnType<typeof useFavorites> | undefined;

/** Composant de test observant le vrai FavoritesProvider. */
function FavoritesProbe() {
  const context = useFavorites();
  currentFavorites = context;

  return (
    <div>
      <output data-testid="favorites-count">{context.favorites.length}</output>
      <output data-testid="favorites-ids">
        {context.favorites.map((item) => item.id).join(",")}
      </output>
      <output data-testid="is-favorite">
        {context.isFavorite("logement-1") ? "oui" : "non"}
      </output>
      <output data-testid="loading-state">
        {context.isLoading ? "chargement" : "prêt"}
      </output>
      <button type="button" onClick={() => void context.toggleFavorite("logement-1")}>
        Changer le favori
      </button>
    </div>
  );
}

function renderFavorites() {
  return render(
    <FavoritesProvider>
      <FavoritesProbe />
    </FavoritesProvider>,
  );
}

describe("FavoritesProvider / useFavorites", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentFavorites = undefined;
    mockSession(connectedUser);
    mockedGetFavorites.mockResolvedValue([]);
    mockedAddFavorite.mockResolvedValue(undefined);
    mockedRemoveFavorite.mockResolvedValue(undefined);
  });

  it("charge les favoris de l'utilisateur connecté au montage", async () => {
    mockedGetFavorites.mockResolvedValue([property]);
    renderFavorites();

    await waitFor(() => expect(screen.getByTestId("favorites-count")).toHaveTextContent("1"));
    expect(mockedGetFavorites).toHaveBeenCalledWith(12);
    expect(screen.getByTestId("is-favorite")).toHaveTextContent("oui");
  });

  it("ajoute un logement absent et rafraîchit la liste depuis le backend", async () => {
    mockedGetFavorites.mockResolvedValueOnce([]).mockResolvedValueOnce([property]);
    renderFavorites();
    await waitFor(() => expect(mockedGetFavorites).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Changer le favori" }));

    await waitFor(() => expect(mockedAddFavorite).toHaveBeenCalledWith("logement-1"));
    await waitFor(() => expect(screen.getByTestId("is-favorite")).toHaveTextContent("oui"));
    expect(mockedRemoveFavorite).not.toHaveBeenCalled();
    expect(mockedGetFavorites).toHaveBeenCalledTimes(2);
  });

  it("retire un favori existant et rafraîchit la liste", async () => {
    mockedGetFavorites.mockResolvedValueOnce([property]).mockResolvedValueOnce([]);
    renderFavorites();
    await waitFor(() => expect(screen.getByTestId("is-favorite")).toHaveTextContent("oui"));

    fireEvent.click(screen.getByRole("button", { name: "Changer le favori" }));

    await waitFor(() => expect(mockedRemoveFavorite).toHaveBeenCalledWith("logement-1"));
    await waitFor(() => expect(screen.getByTestId("is-favorite")).toHaveTextContent("non"));
    expect(mockedAddFavorite).not.toHaveBeenCalled();
    expect(mockedGetFavorites).toHaveBeenCalledTimes(2);
  });

  it("retrouve les favoris après le démontage puis le remontage du fournisseur", async () => {
    mockedGetFavorites.mockResolvedValue([property]);

    const firstRender = renderFavorites();
    await waitFor(() => expect(screen.getByTestId("is-favorite")).toHaveTextContent("oui"));
    firstRender.unmount();

    renderFavorites();
    await waitFor(() => expect(screen.getByTestId("is-favorite")).toHaveTextContent("oui"));

    // Simule une nouvelle visite : c'est l'API qui persiste les favoris,
    // et non le state React. Ce test ne remplace pas un test réel de la base SQLite.
    expect(mockedGetFavorites).toHaveBeenCalledTimes(2);
  });

  it("n'appelle pas l'API quand l'utilisateur n'est pas connecté", async () => {
    mockSession(null);
    renderFavorites();

    expect(screen.getByTestId("favorites-count")).toHaveTextContent("0");
    expect(mockedGetFavorites).not.toHaveBeenCalled();
    await expect(currentFavorites!.toggleFavorite("logement-1")).rejects.toThrow(
      "Vous devez être connecté.",
    );
    expect(mockedAddFavorite).not.toHaveBeenCalled();
    expect(mockedRemoveFavorite).not.toHaveBeenCalled();
  });

  it("vide les favoris en mémoire lors de la déconnexion", async () => {
    mockedGetFavorites.mockResolvedValue([property]);
    const view = renderFavorites();
    await waitFor(() => expect(screen.getByTestId("favorites-count")).toHaveTextContent("1"));

    mockSession(null);
    view.rerender(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("favorites-count")).toHaveTextContent("0"));
    expect(mockedGetFavorites).toHaveBeenCalledTimes(1);
  });

  it("charge uniquement les favoris du nouveau compte après un changement d'utilisateur", async () => {
    mockedGetFavorites.mockImplementation(async (userId) =>
      Number(userId) === 12 ? [property] : [otherProperty],
    );

    const view = renderFavorites();
    await waitFor(() => expect(screen.getByTestId("favorites-ids")).toHaveTextContent("logement-1"));

    mockSession({ ...connectedUser, id: 30 });
    view.rerender(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("favorites-ids")).toHaveTextContent("logement-2"));
    expect(screen.getByTestId("is-favorite")).toHaveTextContent("non");
    expect(mockedGetFavorites).toHaveBeenCalledWith(30);
  });

  it("attend la fin du chargement de la session pour récupérer les favoris", async () => {
    mockSession(connectedUser, true);
    const view = renderFavorites();

    expect(mockedGetFavorites).not.toHaveBeenCalled();

    mockSession(connectedUser, false);
    view.rerender(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(mockedGetFavorites).toHaveBeenCalledWith(12));
  });

  it("affiche l'état de chargement pendant la récupération", async () => {
    let resolveRequest!: (list: Property[]) => void;
    mockedGetFavorites.mockReturnValue(
      new Promise<Property[]>((resolve) => {
        resolveRequest = resolve;
      }),
    );

    renderFavorites();
    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("chargement"));

    await act(async () => {
      resolveRequest([property]);
    });

    expect(screen.getByTestId("loading-state")).toHaveTextContent("prêt");
    expect(screen.getByTestId("favorites-count")).toHaveTextContent("1");
  });

  it("réinitialise la liste et arrête le chargement en cas d'erreur API", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockedGetFavorites.mockRejectedValue(new Error("API indisponible"));

    try {
      renderFavorites();
      await waitFor(() => expect(errorSpy).toHaveBeenCalled());
      expect(screen.getByTestId("favorites-count")).toHaveTextContent("0");
      expect(screen.getByTestId("loading-state")).toHaveTextContent("prêt");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("remonte une erreur d'ajout sans déclencher de rafraîchissement", async () => {
    mockedAddFavorite.mockRejectedValue(new Error("Ajout refusé"));
    renderFavorites();
    await waitFor(() => expect(mockedGetFavorites).toHaveBeenCalledTimes(1));

    await act(async () => {
      await expect(currentFavorites!.toggleFavorite("logement-1")).rejects.toThrow("Ajout refusé");
    });

    expect(mockedGetFavorites).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("is-favorite")).toHaveTextContent("non");
  });
});
