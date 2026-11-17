import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPropertyById } from "@/lib/api/properties";
import { getImageUrl } from "@/lib/images";
import AccommodationCarousel from "@/components/accommodations/AccommodationCarousel";

import styles from "@/styles/app/Accommodation.module.scss";

interface AccommodationPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Page serveur présentant le détail d'un logement identifié par son ID.
 * Rend la page 404 si la récupération du logement échoue.
 * La galerie interactive est isolée dans un composant client pour conserver
 * le reste de cette page côté serveur.
 */
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

  // Unifie la couverture et les photos supplémentaires sans doublons ni valeurs vides.
  const gallery = Array.from(
    new Set(
      [accommodation.cover, ...(accommodation.pictures ?? [])].filter(
        (image): image is string => Boolean(image),
      ),
    ),
  );

  const hostInitials = accommodation.host.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backButton}>
        ← Retour aux annonces
      </Link>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          {/* Galerie interactive : le reste de la page reste rendu côté serveur. */}
          <AccommodationCarousel images={gallery} title={accommodation.title} />

          {/* Informations */}

          <section className={styles.information}>
            <h1>{accommodation.title}</h1>

            <p className={styles.location}>
              <span aria-hidden="true">♧</span>

              {accommodation.location}
            </p>

            <p className={styles.description}>{accommodation.description}</p>

            {accommodation.equipments.length > 0 && (
              <div className={styles.section}>
                <h2>Équipements</h2>

                <ul>
                  {accommodation.equipments.map((equipment) => (
                    <li key={equipment}>{equipment}</li>
                  ))}
                </ul>
              </div>
            )}

            {accommodation.tags.length > 0 && (
              <div className={styles.section}>
                <h2>Catégories</h2>

                <div className={styles.tags}>
                  {accommodation.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Hôte */}

        <aside className={styles.hostCard}>
          <h2>Votre hôte</h2>

          <div className={styles.hostInfo}>
            <div className={styles.hostPicture}>
              {accommodation.host.picture ? (
                <Image
                  src={getImageUrl(accommodation.host.picture)}
                  alt={`Photo de ${accommodation.host.name}`}
                  fill
                  sizes="60px"
                />
              ) : (
                <span className={styles.hostPlaceholder} aria-hidden="true">
                  {hostInitials}
                </span>
              )}
            </div>

            <p className={styles.hostName}>{accommodation.host.name}</p>

            <div
              className={styles.rating}
              aria-label={`Note ${accommodation.rating_avg} sur 5`}
            >
              <span aria-hidden="true">★</span>

              <span>{Number(accommodation.rating_avg ?? 0).toFixed(1)}</span>
            </div>
          </div>

          <div className={styles.hostActions}>
            <button type="button" disabled title="Fonctionnalité non disponible">
              Contacter l’hôte
            </button>

            <button type="button" disabled title="Fonctionnalité non disponible">
              Envoyer un message
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}