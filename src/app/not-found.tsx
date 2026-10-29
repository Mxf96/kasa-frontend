import Link from "next/link";

import styles from "@/styles/app/NotFound.module.scss";

export default function NotFound() {
  return (
    <section className={styles.notFound}>
      <div className={styles.content}>
        <h1>404</h1>

        <p>
          Il semble que la page que vous cherchez ait pris
          <br />
          des vacances... ou n’ait jamais existé.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            Accueil
          </Link>

          <Link href="/accommodations" className={styles.button}>
            Logements
          </Link>
        </div>
      </div>
    </section>
  );
}