import Image from "next/image";

import styles from "@/styles/components/accommodations/AccommodationCard.module.scss";

interface AccommodationCardProps {
  title: string;
  location: string;
  price: number;
  image: string;
}

export default function AccommodationCard({
  title,
  location,
  price,
  image,
}: AccommodationCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className={styles.image}
        />

        <button
          type="button"
          className={styles.favoriteButton}
          aria-label={`Ajouter ${title} aux favoris`}
        >
          ♡
        </button>
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
    </article>
  );
}