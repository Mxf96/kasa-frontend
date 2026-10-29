import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import { AuthProvider } from "@/context/AuthContext";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <AuthProvider>
          <Header />

          <main>{children}</main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}