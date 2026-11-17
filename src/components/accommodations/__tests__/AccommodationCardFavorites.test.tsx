import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AccommodationCard from "../AccommodationCard";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

vi.mock("@/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/context/FavoritesContext", () => ({ useFavorites: vi.fn() }));

// Les tests ciblent le bouton favori, sans optimiser ni charger de vraies images.
vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: { src: string; alt: string; fill?: boolean; sizes?: string }) => (
    <img {...props} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const cardProps = {
  id: "logement-1",
  title: "Appartement à Paris",
  location: "Paris",
  price: 95,
  image: "https://example.com/photo.jpg",
};

function mockAuthentication(isAuthenticated: boolean) {
  vi.mocked(useAuth).mockReturnValue({
    user: isAuthenticated ? { id: 12, email: "client@example.com", role: "client" } : null,
    isLoading: false,
    isAuthenticated,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  });
}

function mockFavorites(isFavorite: boolean, toggleFavorite = vi.fn().mockResolvedValue(undefined)) {
  vi.mocked(useFavorites).mockReturnValue({
    favorites: [],
    isLoading: false,
    isFavorite: vi.fn().mockReturnValue(isFavorite),
    toggleFavorite,
    refreshFavorites: vi.fn(),
  });
  return toggleFavorite;
}

describe("Bouton favori des cartes de logement", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAuthentication(true);
    mockFavorites(false);
  });

  it("masque le bouton favori pour les visiteurs non connectés", () => {
    mockAuthentication(false);
    render(<AccommodationCard {...cardProps} />);

    expect(screen.queryByRole("button", { name: /favori/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /appartement à paris/i })).toHaveAttribute(
      "href", "/accommodations/logement-1",
    );
  });

  it("affiche un cœur vide et aria-pressed=false si le logement n'est pas favori", () => {
    render(<AccommodationCard {...cardProps} />);

    const button = screen.getByRole("button", { name: "Favori : Appartement à Paris" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("♡");
  });

  it("affiche un cœur plein et aria-pressed=true si le logement est favori", () => {
    mockFavorites(true);
    render(<AccommodationCard {...cardProps} />);

    const button = screen.getByRole("button", { name: "Favori : Appartement à Paris" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("♥");
  });

  it("envoie l'identifiant du logement et bloque les double-clics pendant la requête", async () => {
    let resolveToggle!: () => void;
    const toggleFavorite = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => { resolveToggle = resolve; }),
    );
    mockFavorites(false, toggleFavorite);
    render(<AccommodationCard {...cardProps} />);

    const button = screen.getByRole("button", { name: "Favori : Appartement à Paris" });
    fireEvent.click(button);

    expect(toggleFavorite).toHaveBeenCalledTimes(1);
    expect(toggleFavorite).toHaveBeenCalledWith("logement-1");
    expect(button).toBeDisabled();

    await act(async () => { resolveToggle(); });
    expect(button).not.toBeDisabled();
  });

  it("réactive le bouton après une erreur d'ajout ou de suppression", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockFavorites(false, vi.fn().mockRejectedValue(new Error("API indisponible")));

    try {
      render(<AccommodationCard {...cardProps} />);
      const button = screen.getByRole("button", { name: "Favori : Appartement à Paris" });
      fireEvent.click(button);

      await waitFor(() => expect(errorSpy).toHaveBeenCalled());
      await waitFor(() => expect(button).not.toBeDisabled());
    } finally {
      errorSpy.mockRestore();
    }
  });
});
