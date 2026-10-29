import { apiFetch } from "@/lib/api/api";

import type { Property, PropertyDetail } from "@/types/property";

export function getProperties(): Promise<Property[]> {
  return apiFetch<Property[]>("/api/properties");
}

export function getPropertyById(id: string): Promise<PropertyDetail> {
  return apiFetch<PropertyDetail>(`/api/properties/${encodeURIComponent(id)}`);
}