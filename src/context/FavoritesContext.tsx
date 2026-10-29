"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { addFavorite, getFavorites, removeFavorite } from "@/lib/api/favorites";

import type { Property } from "@/types/property";

import { useAuth } from "@/context/AuthContext";

interface FavoritesContextValue {
  favorites: Property[];

  isLoading: boolean;

  isFavorite: (propertyId: string) => boolean;

  toggleFavorite: (propertyId: string) => Promise<void>;

  refreshFavorites: () => Promise<void>;
}

interface FavoritesProviderProps {
  children: React.ReactNode;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [favorites, setFavorites] = useState<Property[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      setIsLoading(true);

      const data = await getFavorites(user.id);

      setFavorites(data);
    } catch (error) {
      console.error("Erreur favoris :", error);

      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshFavorites();
  }, [isAuthLoading, refreshFavorites]);

  const isFavorite = useCallback(
    (propertyId: string) => {
      return favorites.some((property) => property.id === propertyId);
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) {
        throw new Error("Vous devez être connecté.");
      }

      const alreadyFavorite = isFavorite(propertyId);

      if (alreadyFavorite) {
        await removeFavorite(propertyId);
      } else {
        await addFavorite(propertyId);
      }

      await refreshFavorites();
    },
    [isAuthenticated, isFavorite, refreshFavorites],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,

      isLoading,

      isFavorite,

      toggleFavorite,

      refreshFavorites,
    }),
    [favorites, isLoading, isFavorite, toggleFavorite, refreshFavorites],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites doit être utilisé dans FavoritesProvider.");
  }

  return context;
}