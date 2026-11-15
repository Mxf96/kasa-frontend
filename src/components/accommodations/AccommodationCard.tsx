"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

import { getImageUrl } from "@/lib/images";

import styles from "@/styles/components/accommodations/AccommodationCard.module.scss";

interface AccommodationCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string | null;
}

export default function AccommodationCard({
  id,
  title,
  location,
  price,
  image,
}: AccommodationCardProps) {
  const { isAuthenticated } = useAuth();

  const { isFavorite, toggleFavorite } = useFavorites();

  const [isUpdating, setIsUpdating] = useState(false);

  const favorite = isFavorite(id);

  async function handleFavoriteClick() {
    if (isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);

      await toggleFavorite(id);
    } catch (error) {
      console.error("Erreur lors de la modification du favori :", error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <article className={styles.card}>
      <Link href={`/accommodations/${id}`} className={styles.cardLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={getImageUrl(image)}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        </div>

        <div className={styles.content}>
          <h2>{title}</h2>

          <p>{location}</p>

          <span>{price} € / nuit</span>
        </div>
      </Link>

      {isAuthenticated && (
        <button
          type="button"
          className={`${styles.favoriteButton} ${
            favorite ? styles.favoriteButtonActive : ""
          }`}
          aria-label={
            favorite
              ? `Retirer ${title} des favoris`
              : `Ajouter ${title} aux favoris`
          }
          aria-pressed={favorite}
          disabled={isUpdating}
          onClick={handleFavoriteClick}
        >
          {favorite ? "♥" : "♡"}
        </button>
      )}
    </article>
  );
}