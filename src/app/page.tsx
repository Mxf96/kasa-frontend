import Image from "next/image";

import AccommodationCard from "@/components/accommodations/AccommodationCard";

import styles from "@/styles/app/page.module.scss";

const accommodations = [
  {
    id: 1,
    title: "Appartement cosy",
    location: "Île de France - Paris 17e",
    price: 100,
    image: "/assets/img/accommodations/Appartement cosy.svg",
  },
  {
    id: 2,
    title: "Magnifique appartement proche Canal Saint Martin",
    location: "Île de France - Paris 10e",
    price: 110,
    image: "/assets/img/accommodations/Appartement de Standing - 10e.svg",
  },
  {
    id: 3,
    title: "Studio de charme - Buttes Chaumont",
    location: "Île de France - Paris 20e",
    price: 120,
    image: "/assets/img/accommodations/Studio de charme - Buttes Chaumont.svg",
  },
  {
    id: 4,
    title: "Nid douillet au coeur du 11ème",
    location: "Île de France - Paris 11e",
    price: 130,
    image: "/assets/img/accommodations/Nid douillet au coeur du 11ème.svg",
  },
  {
    id: 5,
    title: "Appartement de Standing - 10e",
    location: "Île de France - Paris 10e",
    price: 140,
    image: "/assets/img/accommodations/Nid douillet au coeur du 11ème.svg",
  },
  {
    id: 6,
    title: "Studio d'artiste",
    location: "Île de France - Paris 18e",
    price: 150,
    image: "/assets/img/accommodations/Studio d'artiste.svg",
  },
  {
    id: 7,
    title: "Appartement cosy",
    location: "Île de France - Paris 17e",
    price: 100,
    image: "/assets/img/accommodations/Appartement cosy.svg",
  },
  {
    id: 8,
    title: "Magnifique appartement proche Canal Saint Martin",
    location: "Île de France - Paris 10e",
    price: 110,
    image: "/assets/img/accommodations/Appartement de Standing - 10e.svg",
  },
  {
    id: 9,
    title: "Studio de charme - Buttes Chaumont",
    location: "Île de France - Paris 20e",
    price: 120,
    image: "/assets/img/accommodations/Studio de charme - Buttes Chaumont.svg",
  },
  {
    id: 10,
    title: "Nid douillet au coeur du 11ème",
    location: "Île de France - Paris 11e",
    price: 130,
    image: "/assets/img/accommodations/Nid douillet au coeur du 11ème.svg",
  },
  {
    id: 11,
    title: "Appartement de Standing - 10e",
    location: "Île de France - Paris 10e",
    price: 140,
    image: "/assets/img/accommodations/Nid douillet au coeur du 11ème.svg",
  },
  {
    id: 12,
    title: "Studio d'artiste",
    location: "Île de France - Paris 18e",
    price: 150,
    image: "/assets/img/accommodations/Studio d'artiste.svg",
  },
];

export default function Home() {
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
            title={accommodation.title}
            location={accommodation.location}
            price={accommodation.price}
            image={accommodation.image}
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
              Profitez d'une plateforme sécurisée et de profils d'hôtes
              vérifiés.
            </p>
          </article>

          <article className={styles.step}>
            <h3>Vivez l'expérience</h3>

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