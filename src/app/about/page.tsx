import Image from "next/image";

import styles from "@/styles/app/About.module.scss";

export default function AboutPage() {
  return (
    <div className={styles.about}>
      <section className={styles.intro}>
        <h1>À propos</h1>

        <p>
          Chez Kasa, nous croyons que chaque voyage mérite un lieu unique où se
          sentir bien.
        </p>

        <p>
          Depuis notre création, nous mettons en relation des voyageurs en quête
          d’authenticité avec des hôtes passionnés qui aiment partager leur
          région et leurs bonnes adresses.
        </p>
      </section>

      <section className={styles.heroImage}>
        <Image
          src="/assets/img/background/image 3.svg"
          alt="Maison Kasa entourée de verdure"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </section>

      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <h2>Notre mission est simple :</h2>

          <ol>
            <li>Offrir une plateforme fiable et simple d’utilisation</li>

            <li>Proposer des hébergements variés et de qualité</li>

            <li>
              Favoriser des échanges humains et chaleureux entre hôtes et
              voyageurs
            </li>
          </ol>

          <p className={styles.highlight}>
            Que vous cherchiez un appartement cosy en centre-ville, une maison
            en bord de mer ou un chalet à la montagne, Kasa vous accompagne pour
            que chaque séjour devienne un souvenir inoubliable.
          </p>
        </div>

        <div className={styles.missionImage}>
          <Image
            src="/assets/img/background/image 4.svg"
            alt="Maison chaleureuse proposée sur Kasa"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>
    </div>
  );
}