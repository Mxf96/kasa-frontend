import Image from "next/image";

import AccommodationCard from "@/components/accommodations/AccommodationCard";

import { getProperties } from "@/lib/api/properties";

import styles from "@/styles/app/page.module.scss";

export default async function Home() {
  const accommodations = await getProperties();

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1>Chez vous, partout et ailleurs</h1>

        <p>
          Avec Kasa, vivez des séjours uniques dans des hébergements chaleureux,
          sélectionnés avec soin par nos hôtes.
        </p>
      </section>

      <section className={styles.banner}>
        <Image
          src="/assets/img/background/Frame 47.svg"
          alt="Maison moderne au milieu des dunes"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </section>

      <section
        className={styles.accommodations}
        aria-label="Logements disponibles"
      >
        {accommodations.map((accommodation) => (
          <AccommodationCard
            key={accommodation.id}
            id={accommodation.id}
            title={accommodation.title}
            location={accommodation.location}
            price={accommodation.price_per_night}
            image={accommodation.cover ?? "/assets/img/background/Frame 47.svg"}
          />
        ))}
      </section>

      <section className={styles.howItWorks}>
        <div className={styles.howItWorksHeader}>
          <h2>Comment ça marche ?</h2>

          <p>
            Que vous partiez pour un week-end improvisé, des vacances en famille
            ou un voyage professionnel,
            <br />
            Kasa vous aide à trouver un lieu qui vous ressemble.
          </p>
        </div>

        <div className={styles.steps}>
          <article className={styles.step}>
            <h3>Recherchez</h3>

            <p>
              Entrez votre destination, vos dates et laissez Kasa faire le
              reste.
            </p>
          </article>

          <article className={styles.step}>
            <h3>Réservez</h3>

            <p>
              Profitez d&apos;une plateforme sécurisée et de profils
              d&apos;hôtes vérifiés.
            </p>
          </article>

          <article className={styles.step}>
            <h3>Vivez l&apos;expérience</h3>

            <p>
              Installez-vous, profitez de votre séjour, et sentez-vous chez
              vous, partout.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}