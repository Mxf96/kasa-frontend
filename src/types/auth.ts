export type UserRole = "client" | "owner" | "admin";

export interface AuthUser {
  id: number | string | null;
  email: string | null;
  role: UserRole | null;
  name?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}