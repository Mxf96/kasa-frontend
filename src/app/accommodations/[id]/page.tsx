import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPropertyById } from "@/lib/api/properties";

import styles from "@/styles/app/Accommodation.module.scss";

interface AccommodationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AccommodationPage({
  params,
}: AccommodationPageProps) {
  const { id } = await params;

  let accommodation;

  try {
    accommodation = await getPropertyById(id);
  } catch {
    notFound();
  }

  if (!accommodation) {
    notFound();
  }

  /*
   * On combine la cover et la galerie du backend.
   * Set évite d'afficher deux fois la même image.
   */
  const galleryImages = Array.from(
    new Set(
      [accommodation.cover, ...(accommodation.pictures ?? [])].filter(
        (image): image is string => Boolean(image),
      ),
    ),
  ).slice(0, 5);

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backButton}>
        <span aria-hidden="true">←</span>
        Retour aux annonces
      </Link>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <section
            className={styles.gallery}
            aria-label={`Photos de ${accommodation.title}`}
          >
            {galleryImages.map((image, index) => (
              <div
                key={image}
                className={
                  index === 0 ? styles.mainImage : styles.secondaryImage
                }
              >
                <Image
                  src={image}
                  alt={
                    index === 0
                      ? accommodation.title
                      : `${accommodation.title} - photo ${index + 1}`
                  }
                  fill
                  priority={index === 0}
                  sizes={
                    index === 0
                      ? "(max-width: 900px) 100vw, 55vw"
                      : "(max-width: 900px) 50vw, 20vw"
                  }
                />
              </div>
            ))}
          </section>

          <section className={styles.information}>
            <h1>{accommodation.title}</h1>

            <div className={styles.location}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>

              <span>{accommodation.location}</span>
            </div>

            {accommodation.description && (
              <p className={styles.description}>{accommodation.description}</p>
            )}

            {accommodation.equipments?.length > 0 && (
              <div className={styles.section}>
                <h2>Équipements</h2>

                <ul className={styles.tags}>
                  {accommodation.equipments.map((equipment) => (
                    <li key={equipment}>{equipment}</li>
                  ))}
                </ul>
              </div>
            )}

            {accommodation.tags?.length > 0 && (
              <div className={styles.section}>
                <h2>Catégorie</h2>

                <ul className={styles.tags}>
                  {accommodation.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className={styles.hostCard}>
          <h2>Votre hôte</h2>

          <div className={styles.hostInfo}>
            {accommodation.host?.picture ? (
              <Image
                src={accommodation.host.picture}
                alt={`Photo de ${accommodation.host.name}`}
                width={72}
                height={72}
                className={styles.hostPicture}
              />
            ) : (
              <div className={styles.hostPlaceholder} aria-hidden="true">
                {accommodation.host?.name
                  ?.split(" ")
                  .map((part) => part.charAt(0))
                  .join("")
                  .slice(0, 2)}
              </div>
            )}

            <div className={styles.hostName}>{accommodation.host?.name}</div>

            <div
              className={styles.rating}
              aria-label={`Note ${accommodation.rating_avg} sur 5`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 2.5 2.93 5.94 6.56.95-4.75 4.63 1.12 6.53L12 17.47l-5.86 3.08 1.12-6.53-4.75-4.63 6.56-.95L12 2.5Z" />
              </svg>

              <span>{Number(accommodation.rating_avg).toFixed(1)}</span>
            </div>
          </div>

          <div className={styles.hostActions}>
            <button type="button">Contacter l&apos;hôte</button>

            <button type="button">Envoyer un message</button>
          </div>
        </aside>
      </div>
    </div>
  );
}