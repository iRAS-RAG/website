const API_BASE = (import.meta.env.VITE_API_BASE || "https://localhost:7094/api/").replace(/\/+$/, "");
const API_KEY = import.meta.env.VITE_API_KEY || "";

type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  signal?: AbortSignal | null;
};

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  const isJson = contentType.includes("application/json");
  const data = text && isJson ? JSON.parse(text) : text;
  if (!res.ok) {
    const err: ApiError = new Error(res.statusText || "API error");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}/${path.replace(/^\/+/, "")}`;
  const headers: Record<string, string> = {
    accept: "application/json",
    "Content-Type": "application/json",
  };
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const init: RequestInit = {
    method: options.method || (options.body ? "POST" : "GET"),
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: options.credentials,
    signal: options.signal,
  };

  const res = await fetch(url, init);
  return parseResponse(res);
}

export { API_BASE, API_KEY };
