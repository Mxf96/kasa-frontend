# Kasa — Refonte frontend avec Next.js

Kasa est une plateforme de découverte de locations d'appartements et de maisons entre particuliers. Ce dépôt contient la **refonte de son interface frontend**, réalisée dans le cadre du projet OpenClassrooms **« Développez une plateforme de réservation avec React »**.

L'application s'appuie sur une **API Express.js fournie** pour récupérer les logements et gérer les comptes utilisateurs. L'interface est construite avec Next.js, React, TypeScript et SCSS, en privilégiant le rendu côté serveur, l'accessibilité et le référencement naturel.

> **Périmètre :** ce dépôt concerne le frontend. Le backend est un projet distinct : [OpenClassrooms-Student-Center/dev-react-P12](https://github.com/OpenClassrooms-Student-Center/dev-react-P12).

## Technologies utilisées

- **Next.js 16** — App Router, Server Components, Route Handlers et métadonnées.
- **React et TypeScript** — composants et typage des réponses API.
- **SCSS Modules** — styles des pages et composants, responsive design.
- **Express.js + SQLite** — API et base de données fournies, dans un projet séparé.
- **JWT + cookie HttpOnly** — gestion de l'authentification et des sessions.
- **`next/image`** — optimisation des images.
- **JSDoc** — documentation des modules, fonctions et composants.

## Fonctionnalités

### Consultation des logements

- Affichage des logements récupérés depuis `GET /api/properties`.
- Cartes réutilisables avec titre, localisation, photo et prix par nuit.
- Page de détail dynamique via `/accommodations/[id]`, alimentée par `GET /api/properties/:id`.
- Présentation des photos, équipements, catégories et informations de l'hôte.
- Pages d'accueil, À propos et page 404 personnalisée.
- Interface responsive.

### Authentification et favoris

- Inscription, connexion et déconnexion via le backend.
- JWT conservé dans un **cookie HttpOnly**, accessible aux routes serveur Next.js.
- `AuthContext` pour partager l'état de session entre les composants.
- `FavoritesContext` pour consulter, ajouter et retirer les logements favoris.
- Page `/favorites` réservée à un utilisateur connecté.

> **À noter :** dans la version du code examinée, les favoris sont synchronisés avec l'API Express, **et non avec `localStorage`**. Le brief Sprint 1 recommande une persistance via `localStorage` : ce point reste à aligner si cette recommandation doit être suivie strictement.

### SEO et accessibilité

- Rendu côté serveur des pages de consultation quand cela est possible.
- Métadonnées par page (`title`, `description`, URL canonique, Open Graph).
- **Sitemap dynamique** à l'adresse `/sitemap.xml` et règles `/robots.txt`.
- Données structurées **Schema.org / JSON-LD** pour le site, les logements et le fil d'Ariane.
- Liens d'évitement, indicateurs de focus clavier, libellés accessibles, contrastes améliorés et prise en charge de `prefers-reduced-motion`.

## Prérequis

- **Node.js 20.9 ou supérieur**, compatible avec Next.js 16.
- **npm**.
- Le dépôt du backend Kasa, lancé séparément.

## Installation et démarrage en local

### 1. Lancer le backend

Récupérer le backend fourni :

```bash
git clone https://github.com/OpenClassrooms-Student-Center/dev-react-P12.git kasa-backend
cd kasa-backend
npm install
```

Le backend écoute **sur le port 3000 par défaut**. Pour l'utiliser en parallèle avec le frontend Next.js, le lancer sur **4000**. Exemple avec **PowerShell** :

```powershell
$env:PORT="4000"
$env:JWT_SECRET="remplacer-par-un-secret-de-developpement"
npm start
```

API : `http://localhost:4000`  
Documentation OpenAPI du backend : `http://localhost:4000/docs.html`

La base SQLite se trouve dans `data/kasa.sqlite3`. Le backend initialise la base et les données de démonstration si nécessaire.

### 2. Configurer le frontend

Dans un **deuxième terminal**, se placer à la racine du dépôt frontend et installer les dépendances :

```bash
npm install
```

Créer un fichier **`.env.local`** à la racine :

```dotenv
# Adresse du backend, utilisée côté serveur Next.js
API_URL=http://localhost:4000

# Adresse publique du frontend (SEO, sitemap et URLs canoniques)
SITE_URL=http://localhost:3000

# Utile si certaines images de l'API sont servies par /uploads/
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Ne pas commiter `.env.local`. Ne jamais y exposer un secret JWT via une variable `NEXT_PUBLIC_*`.

### 3. Démarrer le frontend

**Développement :**

```bash
npm run dev
```

Ouvrir `http://localhost:3000`.

**Vérification en mode production :**

```bash
npm run build
npm start
```

Le backend doit rester démarré : les pages récupèrent leurs données depuis l'API.

## Structure du projet

```text
src/
├── app/
│   ├── about/                 # Page À propos
│   ├── accommodations/[id]/   # Détail d'un logement
│   ├── api/
│   │   ├── auth/              # Login, register, session, logout
│   │   └── backend/[...path]/  # Proxy API authentifié
│   ├── favorites/             # Liste des favoris
│   ├── login/ et register/    # Pages d'authentification
│   ├── layout.tsx             # Layout global et providers
│   ├── loading.tsx            # État de chargement
│   ├── page.tsx               # Accueil
│   ├── robots.ts              # /robots.txt
│   └── sitemap.ts             # /sitemap.xml
├── components/
│   ├── accommodations/        # Carte de logement
│   ├── layout/                # Header et Footer
│   └── seo/                   # Composant JSON-LD
├── context/                   # AuthContext, FavoritesContext
├── lib/
│   ├── api/                   # Client API, propriétés et favoris
│   ├── images.ts              # Résolution des URLs d'images
│   └── seo.ts                 # URL canonique du site
├── styles/                    # SCSS global et modules
└── types/                     # Types AuthUser et Property

public/assets/                  # Logos, icônes et illustrations
```

## Routes principales

| Route                  | Fonction                                         |
| ---------------------- | ------------------------------------------------ |
| `/`                    | Liste des logements                              |
| `/accommodations/[id]` | Détail d'un logement                             |
| `/about`               | Présentation de Kasa                             |
| `/login`               | Connexion                                        |
| `/register`            | Inscription                                      |
| `/favorites`           | Favoris de l'utilisateur connecté                |
| `/sitemap.xml`         | Sitemap XML généré depuis les logements          |
| `/robots.txt`          | Consignes d'exploration des moteurs de recherche |

Les appels publics aux propriétés passent par `src/lib/api/properties.ts`. Les actions nécessitant un JWT passent par les routes serveur Next.js, qui lisent le cookie de session et transmettent l'en-tête `Authorization` à Express.

## SEO et données structurées

Le projet utilise les API de métadonnées Next.js pour générer les titres, descriptions et URLs canoniques. Les données structurées sont injectées en **JSON-LD** :

- `WebSite` sur la page d'accueil ;
- `Accommodation` et `BreadcrumbList` sur la page de détail.

Avant un déploiement public, renseigner `SITE_URL` avec l'URL réelle du site :

```dotenv
SITE_URL=https://votre-domaine.fr
```

Vérifier ensuite :

- `/sitemap.xml` et `/robots.txt` ;
- le contenu `<script type="application/ld+json">` dans le HTML ;
- les données structurées avec le [validateur Schema.org](https://validator.schema.org/) et le [test des résultats enrichis Google](https://search.google.com/test/rich-results).

> Un balisage Schema.org valide ne garantit pas l'affichage d'un résultat enrichi par Google.

## Accessibilité et performances

Des ajustements ont été réalisés sur les contrastes, les éléments interactifs, la navigation clavier, les attributs accessibles et la structure des pages.

**Premier audit Lighthouse communiqué pour la page d'accueil en mode production local :**

| Indicateur       |   Score |
| ---------------- | ------: |
| Performance      | **100** |
| Accessibilité    | **100** |
| Bonnes pratiques |  **92** |
| SEO              | **100** |

Ces scores concernent **la page d'accueil dans les conditions du test**, et non automatiquement toutes les pages ou tous les appareils. Pour valider l'ensemble du site, relancer Lighthouse sur les pages principales et compléter par un audit [WAVE](https://wave.webaim.org/extension/) ainsi que des tests au clavier.

## Documentation et tests

Les fichiers TypeScript et TSX sont annotés avec **JSDoc** lorsque cela permet de préciser la responsabilité d'un module, les paramètres, les valeurs de retour ou le comportement d'une fonction.

Le cahier des charges demande des **tests unitaires pour les favoris et le carrousel**. Les archives `src` examinées pour ce README ne permettent pas de confirmer la présence de ces tests, ni d'indiquer une commande de test fiable : consulter le `package.json` du dépôt complet avant de documenter un script `test`.

## Points restant à confirmer / finaliser

- **Carrousel :** la version examinée affiche une galerie de photos, mais ne possède pas encore de navigation interactive entre images. Prévoir le cas d'une seule photo et les tests unitaires associés.
- **Favoris :** la version examinée dépend encore de l'API et d'une session ; l'usage de `localStorage` recommandé par le brief reste à traiter.
- **URLs des logements :** les pages sont identifiées par `[id]` ; le brief recommande des URLs basées sur le `slug`.
- **Navigation :** certains liens visibles dans l'interface (messages, réinitialisation de mot de passe, etc.) nécessitent de vérifier la présence de leurs pages correspondantes.
- **Déploiement :** aucun lien public de déploiement n'a été fourni pour ce README.

## Déploiement

Le frontend peut être hébergé sur une plateforme compatible avec Next.js, par exemple **Vercel**. En production :

1. Configurer `API_URL` avec une adresse de backend **accessible depuis l'hébergement Next.js**.
2. Configurer `SITE_URL` avec le domaine public du frontend.
3. Adapter, si nécessaire, `NEXT_PUBLIC_API_URL` et les domaines autorisés dans `next.config.ts` pour les images distantes.
4. Vérifier que le backend dispose d'un `JWT_SECRET` fort et d'un stockage persistant pour SQLite.
5. Exécuter le build, vérifier les pages, le sitemap, les métadonnées et refaire les audits Lighthouse/WAVE.

Si le backend n'est pas déployé, prévoir une API de démonstration ou des données simulées afin que le frontend hébergé reste consultable.

## Ressources

- [Backend Express officiel — OpenClassrooms](https://github.com/OpenClassrooms-Student-Center/dev-react-P12)
- [Maquettes Figma Kasa](https://www.figma.com/design/UEw5iG40U3V0NeqBr91rd9/KASA-NEW)
- [Documentation Next.js](https://nextjs.org/docs)
- [Schema.org](https://schema.org/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)

---

**Projet pédagogique OpenClassrooms — Kasa.**