import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AccommodationCarousel from "../AccommodationCarousel";

// Les tests portent sur la logique du carrousel, pas sur le chargement réseau
// ni sur l'optimisation des images réalisée par Next.js.
vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority: _priority, unoptimized: _unoptimized, ...props }: {
    fill?: boolean;
    priority?: boolean;
    unoptimized?: boolean;
    src: string;
    alt: string;
    sizes?: string;
  }) => <img {...props} />,
}));

const images = ["/photos/1.jpg", "/photos/2.jpg", "/photos/3.jpg", "/photos/4.jpg", "/photos/5.jpg"];

function getMainPhoto() {
  return screen.getByRole("img", { name: /appartement lumineux — photo \d+ sur \d+/i });
}

describe("AccommodationCarousel", () => {
  it("affiche la première photo et le compteur initial", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={images} />);

    expect(getMainPhoto()).toHaveAttribute("src", images[0]);
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Photo suivante" })).toBeInTheDocument();
  });

  it("permet de passer à la photo suivante et de revenir en arrière", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={images} />);

    fireEvent.click(screen.getByRole("button", { name: "Photo suivante" }));
    expect(getMainPhoto()).toHaveAttribute("src", images[1]);
    expect(screen.getByText("2 / 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Photo précédente" }));
    expect(getMainPhoto()).toHaveAttribute("src", images[0]);
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("revient à la dernière photo en cliquant sur précédent depuis la première", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={images} />);

    fireEvent.click(screen.getByRole("button", { name: "Photo précédente" }));

    expect(getMainPhoto()).toHaveAttribute("src", images[4]);
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
  });

  it("revient à la première photo après la dernière", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={images} />);

    const nextButton = screen.getByRole("button", { name: "Photo suivante" });
    for (let i = 0; i < images.length; i += 1) {
      fireEvent.click(nextButton);
    }

    expect(getMainPhoto()).toHaveAttribute("src", images[0]);
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("permet de sélectionner directement une photo avec une miniature", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={images} />);

    fireEvent.click(screen.getByRole("button", { name: "Afficher la photo 4 sur 5" }));

    expect(getMainPhoto()).toHaveAttribute("src", images[3]);
    expect(screen.getByText("4 / 5")).toBeInTheDocument();
  });

  it("permet la navigation avec les touches fléchées", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={images} />);

    const carousel = screen.getByRole("region", { name: "Photos de Appartement lumineux" });
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(getMainPhoto()).toHaveAttribute("src", images[1]);

    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(getMainPhoto()).toHaveAttribute("src", images[0]);
  });

  it("masque les flèches, les miniatures et le compteur avec une seule image", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={[images[0]]} />);

    expect(screen.getByRole("img", { name: "Appartement lumineux — photo 1 sur 1" })).toHaveAttribute(
      "src",
      images[0],
    );
    expect(screen.queryByRole("button", { name: "Photo précédente" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Photo suivante" })).not.toBeInTheDocument();
    expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Photos de Appartement lumineux" })).queryAllByRole("button")).toHaveLength(0);
  });

  it("affiche l'image de secours sans commandes si aucune image n'est fournie", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={[]} />);

    expect(screen.getByRole("img", { name: "Aucune photo disponible pour Appartement lumineux" })).toHaveAttribute(
      "src",
      "/assets/img/background/Frame 47.svg",
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("n'intercepte pas un mouvement vertical tactile", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={images} />);

    const carousel = screen.getByRole("region", { name: "Photos de Appartement lumineux" });
    const mainImage = within(carousel).getByRole("img", { name: /photo 1 sur 5/ }).parentElement;
    expect(mainImage).not.toBeNull();

    fireEvent.touchStart(mainImage!, { touches: [{ clientX: 90, clientY: 200 }] });
    fireEvent.touchEnd(mainImage!, { changedTouches: [{ clientX: 80, clientY: 100 }] });
    expect(getMainPhoto()).toHaveAttribute("src", images[0]);
  });

  it("permet le balayage horizontal sur mobile", () => {
    render(<AccommodationCarousel title="Appartement lumineux" images={images} />);

    const carousel = screen.getByRole("region", { name: "Photos de Appartement lumineux" });
    const mainImage = within(carousel).getByRole("img", { name: /photo 1 sur 5/ }).parentElement;
    expect(mainImage).not.toBeNull();

    fireEvent.touchStart(mainImage!, { touches: [{ clientX: 160, clientY: 100 }] });
    fireEvent.touchEnd(mainImage!, { changedTouches: [{ clientX: 40, clientY: 110 }] });
    expect(getMainPhoto()).toHaveAttribute("src", images[1]);
  });
});
