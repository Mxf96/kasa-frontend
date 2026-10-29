"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import AccommodationCard from "@/components/accommodations/AccommodationCard";

import { useAuth } from "@/context/AuthContext";

import { useFavorites } from "@/context/FavoritesContext";

import styles from "@/styles/app/Favorites.module.scss";

export default function FavoritesPage() {
  const router = useRouter();

  const { user, isLoading: isAuthLoading } = useAuth();

  const { favorites, isLoading } = useFavorites();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (!user && !isAuthLoading)) {
    return null;
  }

  return (
    <div className={styles.favoritesPage}>
      <section className={styles.introduction}>
        <h1>Vos favoris</h1>

        <p>
          Retrouvez ici tous les logements que vous avez aimés.
          <br />
          Prêts à réserver ? Un simple clic et votre prochain séjour est en
          route.
        </p>
      </section>

      {isLoading ? (
        <p className={styles.message}>Chargement des favoris...</p>
      ) : favorites.length > 0 ? (
        <section className={styles.grid} aria-label="Mes logements favoris">
          {favorites.map((property) => (
            <AccommodationCard
              key={property.id}
              id={property.id}
              title={property.title}
              location={property.location}
              price={property.price_per_night}
              image={property.cover ?? "/assets/img/background/Frame 47.svg"}
            />
          ))}
        </section>
      ) : (
        <div className={styles.emptyState}>
          <h2>Aucun favori</h2>

          <p>Vous n&apos;avez pas encore ajouté de logement à vos favoris.</p>
        </div>
      )}
    </div>
  );
}