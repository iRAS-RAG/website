import { apiFetch } from "./client";
import jwt, { addTokenListener } from "./jwt";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: { accessToken?: string; refreshToken?: string } | string;
  message?: string;
  [key: string]: unknown;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch("/auth/login", { method: "POST", body: payload });
}

export type Role = "Admin" | "Supervisor" | "Operator";

export const roles = ["Admin", "Supervisor", "Operator"] as const;

function buildDisplayName(raw: Record<string, unknown>): string {
  const firstName = String(raw["firstName"] ?? "");
  const lastName = String(raw["lastName"] ?? "");
  if (firstName && lastName) return `${lastName} ${firstName}`.trim();
  if (firstName || lastName) return (firstName || lastName).trim();
  return "Guest";
}

export const currentUser: { id: string; name: string; role: Role | null } = {
  id: "",
  name: "Guest",
  role: null,
};

function roleOrDefault(r: unknown): Role | null {
  if (r === "Admin" || r === "Supervisor" || r === "Operator") return r as Role;
  return null;
}

function updateCurrentUser(token: string | null) {
  if (!token) {
    currentUser.id = "";
    currentUser.name = "Guest";
    currentUser.role = null;
    return;
  }
  const info = jwt.getUserFromToken(token);
  currentUser.id = info.id ?? "";
  currentUser.name = buildDisplayName(info.raw);
  currentUser.role = roleOrDefault(info.role);
}

(() => {
  const access = jwt.getAccessToken();
  if (access) updateCurrentUser(access);
})();

addTokenListener((access) => {
  updateCurrentUser(access);
});

export function setCurrentUser(user: { id: string; name: string; role: Role | null }) {
  currentUser.id = user.id;
  currentUser.name = user.name;
  currentUser.role = user.role;
}

export function clearCurrentUser() {
  jwt.clearTokens();
  currentUser.id = "";
  currentUser.name = "Guest";
  currentUser.role = null;
}

export function logout(): Promise<unknown> {
  const refresh = jwt.getRefreshToken();
  const path = refresh ? `/auth/logout?refreshToken=${encodeURIComponent(refresh)}` : "/auth/logout";
  return apiFetch(path, { method: "POST" });
}

export const isAdmin = () => currentUser.role === "Admin";
export const isSupervisor = () => currentUser.role === "Supervisor";
export const isOperator = () => currentUser.role === "Operator";
