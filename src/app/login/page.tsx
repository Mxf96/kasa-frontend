"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import styles from "@/styles/app/Login.module.scss";

/** Page de connexion : formulaire contrôlé et redirection après authentification. */
export default function LoginPage() {
  const router = useRouter();

  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // La navigation doit se faire après le rendu, jamais pendant le rendu React.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  /** Envoie les identifiants via AuthContext et affiche une éventuelle erreur. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de vous connecter.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className={styles.loginPage}>
        <p role="status">Chargement...</p>
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <section className={styles.loginCard}>
        <div className={styles.heading}>
          <h1>Se connecter</h1>

          <p>Connectez-vous à votre compte Kasa.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Adresse email</label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className={styles.links}>
          <Link href="/forgot-password">Mot de passe oublié ?</Link>

          <p>
            Pas encore de compte ? <Link href="/register">Créer un compte</Link>
          </p>
        </div>
      </section>
    </div>
  );
}