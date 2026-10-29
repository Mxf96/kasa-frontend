"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import { useFavorites } from "@/context/FavoritesContext";

import styles from "@/styles/components/accommodations/AccommodationCard.module.scss";

interface AccommodationCardProps {
  id: string;

  title: string;

  location: string;

  price: number;

  image: string;
}

export default function AccommodationCard({
  id,
  title,
  location,
  price,
  image,
}: AccommodationCardProps) {
  const router = useRouter();

  const { user, isLoading: isAuthLoading } = useAuth();

  const { isFavorite, toggleFavorite } = useFavorites();

  const [isUpdating, setIsUpdating] = useState(false);

  const favorite = isFavorite(id);

  async function handleFavorite() {
    if (isUpdating || isAuthLoading) {
      return;
    }

    if (!user) {
      router.push("/login");

      return;
    }

    try {
      setIsUpdating(true);

      await toggleFavorite(id);
    } catch (error) {
      console.error("Impossible de modifier le favori :", error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <article className={styles.card}>
      <Link href={`/accommodations/${id}`} className={styles.cardLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={image}
            alt={title}
            fill
            sizes="
              (max-width: 768px) 100vw,
              (max-width: 1100px) 50vw,
              33vw
            "
            className={styles.image}
          />
        </div>

        <div className={styles.content}>
          <div>
            <h2 className={styles.title}>{title}</h2>

            <p className={styles.location}>{location}</p>
          </div>

          <p className={styles.price}>
            <strong>{price}€</strong>

            <span> par nuit</span>
          </p>
        </div>
      </Link>

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
        onClick={handleFavorite}
      >
        {favorite ? "♥" : "♡"}
      </button>
    </article>
  );
}