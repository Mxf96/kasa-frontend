import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

import "@/styles/globals.scss";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kasa",
  description: "Plateforme de location Kasa",
};

/**
 * Layout principal : police, métadonnées, navigation et fournisseurs globaux.
 * `FavoritesProvider` est imbriqué dans `AuthProvider` car il dépend de la session.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <a className="skipLink" href="#contenu-principal">
          Aller au contenu principal
        </a>

        <AuthProvider>
          <FavoritesProvider>
            <Header />

            <main id="contenu-principal" tabIndex={-1}>
              {children}
            </main>

            <Footer />
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}