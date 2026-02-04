import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

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

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    ...(API_KEY ? { "x-api-key": API_KEY } : {}),
  },
});

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const method = (options.method || (options.body ? "POST" : "GET")).toLowerCase();
  const headers = Object.assign({}, options.headers || {});

  const config: AxiosRequestConfig = {
    method: method as AxiosRequestConfig["method"],
    headers,
    data: options.body ?? undefined,
    signal: options.signal ?? undefined,
    withCredentials: options.credentials === "include",
  };

  try {
    const res = path.startsWith("http") ? await axios.request({ url: path, ...config }) : await axiosInstance.request({ url: path.replace(/^\/+/, ""), ...config });
    return res.data as T;
  } catch (e) {
    const err: ApiError = new Error((e as AxiosError).message || "API error");
    if ((e as AxiosError).isAxiosError) {
      const ax = e as AxiosError;
      err.status = ax.response?.status;
      err.data = ax.response?.data ?? ax.message;
    }
    throw err;
  }
}

export { API_BASE, API_KEY };
