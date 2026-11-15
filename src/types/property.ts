/** Informations publiques sur l'hôte associées à un logement. */
export interface PropertyHost {
  id: number;
  name: string;
  picture: string | null;
}

/** Représentation d'un logement telle que renvoyée par l'API de liste. */
export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string | null;
  location: string;
  price_per_night: number;
  rating_avg: number;
  ratings_count: number;
  host: PropertyHost;
}

/** Données supplémentaires nécessaires à la page détaillée d'un logement. */
export interface PropertyDetail extends Property {
  pictures: string[];
  equipments: string[];
  tags: string[];
}