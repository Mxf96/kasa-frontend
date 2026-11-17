"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, TouchEvent } from "react";
import Image from "next/image";

import { getImageUrl } from "@/lib/images";

import styles from "@/styles/components/accommodations/AccommodationCarousel.module.scss";

interface AccommodationCarouselProps {
  /** Ensemble des photos du logement, dans leur ordre d'affichage. */
  images: string[];
  /** Nom du logement, utilisé dans les descriptions accessibles. */
  title: string;
}

/**
 * Carrousel de photos pour la page détail d'un logement.
 * - Les flèches, les miniatures, les touches ← / → et le balayage tactile
 *   permettent de parcourir toutes les images (avec retour au début/à la fin).
 * - Avec zéro ou une seule photo, aucun contrôle inutile n'est affiché.
 */
export default function AccommodationCarousel({
  images,
  title,
}: AccommodationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const imageCount = images.length;
  const hasMultipleImages = imageCount > 1;
  // Garantit un index valide si la liste change sans remonter le composant.
  const activeIndex = imageCount > 0 ? Math.min(currentIndex, imageCount - 1) : 0;
  const mainImage = imageCount > 0 ? images[activeIndex] : null;

  /** Passe à la photo précédente avec retour à la dernière photo. */
  function showPrevious() {
    if (!hasMultipleImages) return;

    setCurrentIndex((index) => (Math.min(index, imageCount - 1) - 1 + imageCount) % imageCount);
  }

  /** Passe à la photo suivante avec retour à la première photo. */
  function showNext() {
    if (!hasMultipleImages) return;

    setCurrentIndex((index) => (Math.min(index, imageCount - 1) + 1) % imageCount);
  }

  /** Autorise la navigation clavier quand le carrousel ou ses contrôles ont le focus. */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!hasMultipleImages) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (!hasMultipleImages || event.touches.length !== 1) return;

    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  /** N'intercepte que les balayages horizontaux afin de préserver le scroll vertical. */
  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;

    if (!start || !hasMultipleImages || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) showNext();
    else showPrevious();
  }

  // Au maximum 3 miniatures sont visibles, mais les flèches permettent
  // toujours de parcourir l'ensemble des photos disponibles.
  const previews = Array.from(
    { length: Math.min(3, Math.max(imageCount - 1, 0)) },
    (_, offset) => (activeIndex + offset + 1) % imageCount,
  );

  const galleryClassName = [
    styles.gallery,
    imageCount <= 1 ? styles.singleImage : "",
    imageCount === 2 ? styles.twoImages : "",
    imageCount === 3 ? styles.threeImages : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={galleryClassName}
      aria-label={`Photos de ${title}`}
      aria-roledescription="carrousel"
      tabIndex={hasMultipleImages ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.mainImage}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => { touchStart.current = null; }}
      >
        <Image
          src={getImageUrl(mainImage)}
          alt={
            mainImage
              ? `${title} — photo ${activeIndex + 1} sur ${imageCount}`
              : `Aucune photo disponible pour ${title}`
          }
          fill
          priority
          sizes="(max-width: 1000px) 100vw, 60vw"
        />

        {hasMultipleImages && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.previous}`}
              onClick={showPrevious}
              aria-label="Photo précédente"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              onClick={showNext}
              aria-label="Photo suivante"
            >
              <span aria-hidden="true">›</span>
            </button>

            <output className={styles.counter} aria-live="polite" aria-atomic="true">
              {activeIndex + 1} / {imageCount}
            </output>
          </>
        )}
      </div>

      {previews.map((index) => (
        <button
          key={index}
          type="button"
          className={styles.thumbnail}
          onClick={() => setCurrentIndex(index)}
          aria-label={`Afficher la photo ${index + 1} sur ${imageCount}`}
        >
          <Image
            src={getImageUrl(images[index])}
            alt=""
            fill
            sizes="(max-width: 750px) 33vw, 20vw"
          />
        </button>
      ))}
    </section>
  );
}
