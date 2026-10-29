"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import styles from "@/styles/app/Register.module.scss";

export default function RegisterPage() {
  const router = useRouter();

  const { register, isAuthenticated } = useAuth();

  const [lastName, setLastName] = useState("");

  const [firstName, setFirstName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions générales d’utilisation.");

      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
      });

      router.replace("/");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de créer votre compte.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.registerPage}>
      <section className={styles.registerCard}>
        <div className={styles.header}>
          <h1>Rejoignez la communauté Kasa</h1>

          <p>
            Créez votre compte et commencez à voyager autrement : réservez des
            logements uniques, découvrez de nouvelles destinations et partagez
            vos propres lieux avec d&apos;autres voyageurs.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="lastName">Nom</label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="firstName">Prénom</label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Adresse email</label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className={styles.terms}>
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
            />

            <label htmlFor="terms">
              J&apos;accepte les{" "}
              <Link href="/terms">conditions générales d&apos;utilisation</Link>
            </label>
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
            {isSubmitting ? "Inscription..." : "S’inscrire"}
          </button>
        </form>

        <p className={styles.loginLink}>
          Déjà membre ? <Link href="/login">Se connecter</Link>
        </p>
      </section>
    </div>
  );
}
