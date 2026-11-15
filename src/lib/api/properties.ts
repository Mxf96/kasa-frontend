import { apiFetch } from "@/lib/api/api";

import type { Property, PropertyDetail } from "@/types/property";

/** Récupère la liste des logements disponibles depuis l'API Kasa. */
export function getProperties(): Promise<Property[]> {
  return apiFetch<Property[]>("/api/properties");
}

/**
 * Récupère le détail d'un logement par son identifiant technique.
 * @param id - Identifiant du logement reçu dans l'URL.
 * @returns Les données détaillées, y compris les photos, équipements et tags.
 */
export function getPropertyById(id: string): Promise<PropertyDetail> {
  return apiFetch<PropertyDetail>(`/api/properties/${encodeURIComponent(id)}`);
}