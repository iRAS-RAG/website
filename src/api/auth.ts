import { apiFetch } from "./client";
import jwt from "./jwt";

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

export const currentUser: { id: string; name: string; role: Role } = {
  id: "",
  name: "Guest",
  role: "Operator",
};

function roleOrDefault(r: unknown): Role {
  if (r === "Admin" || r === "Supervisor" || r === "Operator") return r;
  return "Operator";
}

(() => {
  const access = jwt.getAccessToken();
  if (!access) return;
  const info = jwt.getUserFromToken(access) || ({} as Record<string, unknown>);
  currentUser.id = (info.id as string) || "";
  currentUser.name = (info.name as string) || "Guest";
  currentUser.role = roleOrDefault(info.role as unknown);
})();

export function setCurrentUser(user: { id: string; name: string; role: Role }) {
  currentUser.id = user.id;
  currentUser.name = user.name;
  currentUser.role = user.role;
}

export function clearCurrentUser() {
  jwt.clearTokens();
  currentUser.id = "";
  currentUser.name = "Guest";
  currentUser.role = "Operator";
}

export function logout(): Promise<unknown> {
  const refresh = jwt.getRefreshToken();
  const path = refresh ? `/auth/logout?refreshToken=${encodeURIComponent(refresh)}` : "/auth/logout";
  return apiFetch(path, { method: "POST" });
}

export const isAdmin = () => currentUser.role === "Admin";
export const isSupervisor = () => currentUser.role === "Supervisor";
export const isOperator = () => currentUser.role === "Operator";

export default { login, logout };
