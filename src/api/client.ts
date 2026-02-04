import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import jwt from "./jwt";

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

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const refresh = jwt.getRefreshToken();
  if (!refresh) return Promise.resolve(null);
  refreshPromise = axiosInstance
    .get("/auth/refresh-token", { params: { refreshToken: refresh } })
    .then((res) => {
      const data = (res.data as Record<string, unknown>)?.data ?? res.data;
      let access: string | null = null;
      let refreshNew: string | null = null;
      if (data && typeof data === "object") {
        access = (data.accessToken as string) || (data.token?.accessToken as string) || null;
        refreshNew = (data.refreshToken as string) || (data.token?.refreshToken as string) || null;
      }
      if (access) jwt.setTokens(access, refreshNew ?? undefined);
      return access ?? null;
    })
    .catch(() => {
      jwt.clearTokens();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// request interceptor: attach access token
axiosInstance.interceptors.request.use((cfg) => {
  const token = jwt.getAccessToken();
  if (token && cfg && cfg.headers && !("authorization" in (cfg.headers as Record<string, string>))) {
    (cfg.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return cfg;
});

// response interceptor: on 401 try refresh then retry once
axiosInstance.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const requestUrl = originalConfig?.url ?? "";

    // Don't attempt refresh for refresh endpoint itself
    if (requestUrl.includes("/auth/refresh-token") || !jwt.getRefreshToken()) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const newToken = await doRefresh();
        if (newToken) {
          if (!originalConfig.headers) originalConfig.headers = {} as Record<string, string>;
          (originalConfig.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
          return axios.request(originalConfig);
        }
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);

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
