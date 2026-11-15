const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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