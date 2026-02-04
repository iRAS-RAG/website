import { apiFetch } from "./client";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function toUiUser(item: any): User {
  const firstName = item.firstName || "";
  const lastName = item.lastName || "";
  const name = `${lastName} ${firstName}`.trim();
  return {
    id: item.id,
    name,
    email: item.email,
    role: item.roleName || item.role || "Operator",
  };
}

export async function fetchUsers(): Promise<User[]> {
  const res = await apiFetch("/users");
  // API returns { message, data: [...] }
  const items = (res as any)?.data ?? res;
  if (!Array.isArray(items)) return [];
  return items.map(toUiUser);
}

export async function createUser(payload: Omit<User, "id">): Promise<User> {
  // Backend likely expects firstName/lastName and roleName
  const parts = (payload.name || "").trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || "";
  const body = { email: payload.email, firstName, lastName, roleName: payload.role };
  const res = await apiFetch("/users", { method: "POST", body });
  // Map response if available
  const created = (res as any)?.data ?? res;
  return toUiUser(created);
}

export async function updateUser(id: string, payload: Partial<User>): Promise<User | null> {
  const parts = (payload.name || "").trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || "";
  const body: any = {};
  if (payload.email) body.email = payload.email;
  if (payload.name) {
    body.firstName = firstName;
    body.lastName = lastName;
  }
  if (payload.role) body.roleName = payload.role;
  const res = await apiFetch(`/users/${id}`, { method: "PUT", body });
  const updated = (res as any)?.data ?? res;
  if (!updated) return null;
  return toUiUser(updated);
}

export async function deleteUser(id: string): Promise<boolean> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
  return true;
}

export async function resetPassword(id: string): Promise<boolean> {
  // assume endpoint exists
  await apiFetch(`/users/${id}/reset-password`, { method: "POST" });
  return true;
}

export default { fetchUsers, createUser, updateUser, deleteUser, resetPassword };
