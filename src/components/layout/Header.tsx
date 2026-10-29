import Image from "next/image";
import Link from "next/link";

import styles from "@/styles/components/layout/Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <nav className={styles.navigation} aria-label="Navigation principale">
          <Link href="/" className={styles.navLink}>
            Accueil
          </Link>

          <Link href="/about" className={styles.navLink}>
            À propos
          </Link>
        </nav>

        <Link href="/" className={styles.logo} aria-label="Kasa - Accueil">
          <Image
            src="/assets/img/logo/logo.svg"
            alt="Kasa"
            width={100}
            height={40}
            priority
          />
        </Link>

        <div className={styles.actions}>
          <Link href="/accommodations/new" className={styles.addAccommodation}>
            <span aria-hidden="true">+</span>
            <span>Ajouter un logement</span>
          </Link>

          <Link
            href="/favorites"
            className={styles.iconLink}
            aria-label="Mes favoris"
          >
            <Image
              src="/assets/img/icons/heart.svg"
              alt=""
              width={18}
              height={18}
            />
          </Link>

          <Link
            href="/messages"
            className={styles.iconLink}
            aria-label="Mes messages"
          >
            <Image
              src="/assets/img/icons/message.svg"
              alt=""
              width={18}
              height={18}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}