const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error("La variable d'environnement API_URL n'est pas définie.");
}

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