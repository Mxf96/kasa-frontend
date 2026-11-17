import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest n'expose pas toujours afterEach dans l'espace global.
// Nettoie explicitement le DOM après chaque test pour éviter de conserver
// plusieurs rendus de composants React d'un test au suivant.
afterEach(() => {
  cleanup();
});
