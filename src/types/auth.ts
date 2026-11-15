/** Rôles exposés par l'API Kasa. Les permissions sont contrôlées côté backend. */
export type UserRole = "client" | "owner" | "admin";

/** Informations de session utilisées par l'interface pour l'utilisateur connecté. */
export interface AuthUser {
  id: number | string | null;
  email: string | null;
  role: UserRole | null;
}

/** Identifiants attendus par la route de connexion. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Données transmises à la route d'inscription. */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}