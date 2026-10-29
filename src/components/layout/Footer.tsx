import Image from "next/image";
import Link from "next/link";

import styles from "@/styles/components/layout/Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <Link href="/" className={styles.logo} aria-label="Kasa - Accueil">
          <Image
            src="/assets/img/logo/logo(2).svg"
            alt="Kasa"
            width={36}
            height={36}
          />
        </Link>

        <p className={styles.copyright}>© 2026 Kasa. All rights reserved</p>
      </div>
    </footer>
  );
}