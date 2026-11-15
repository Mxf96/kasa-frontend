const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Prépare l'URL d'une image pour `next/image`.
 * Conserve les URLs externes (ex. S3), préfixe les chemins `/uploads/`
 * avec l'URL publique du backend et fournit une image de secours si nécessaire.
 *
 * @param image - URL absolue, chemin local ou valeur absente.
 * @returns Une URL directement utilisable dans un composant Image.
 */
export function getImageUrl(image: string | null | undefined): string {
  if (!image) {
    return "/assets/img/background/Frame 47.svg";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/uploads/")) {
    return `${API_URL}${image}`;
  }

  return image;
}