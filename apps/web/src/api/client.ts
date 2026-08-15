const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function getToken(): string | null {
  return localStorage.getItem("babycheck_token");
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("babycheck_token", token);
  } else {
    localStorage.removeItem("babycheck_token");
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      data.error ?? "Request failed",
      data.details
    );
  }

  return data as T;
}
