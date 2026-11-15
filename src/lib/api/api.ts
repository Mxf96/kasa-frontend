const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error("La variable d'environnement API_URL n'est pas définie.");
}

/**
 * Effectue une requête HTTP vers l'API Express depuis le serveur Next.js.
 * Les réponses ne sont pas mises en cache afin de récupérer les données actuelles.
 *
 * @typeParam T - Forme attendue des données JSON renvoyées par l'API.
 * @param endpoint - Chemin relatif à `API_URL` (ex. `/api/properties`).
 * @param options - Options Fetch supplémentaires (méthode, en-têtes, etc.).
 * @returns Les données JSON typées avec `T`.
 * @throws {Error} Lorsque le backend renvoie un statut non compris entre 200 et 299.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erreur API : ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}