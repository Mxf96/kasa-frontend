"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import styles from "@/styles/components/layout/Header.module.scss";

export default function Header() {
  const { user, isLoading, logout } = useAuth();

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
            width={120}
            height={45}
            priority
          />
        </Link>

        <div className={styles.actions}>
          {!isLoading &&
            (user ? (
              <>
                <Link
                  href="/accommodations/new"
                  className={styles.addAccommodation}
                >
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

                <button
                  type="button"
                  className={styles.logoutButton}
                  onClick={() => void logout()}
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                >
                  <span className={styles.logoutIcon} aria-hidden="true" />
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.loginLink}>
                <span className={styles.loginIcon} aria-hidden="true" />

                <span>Se connecter</span>
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}