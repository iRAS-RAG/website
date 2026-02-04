import { apiFetch } from "./client";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function toUiUser(item: Record<string, unknown>): User {
  const firstName = String(item["firstName"] ?? "");
  const lastName = String(item["lastName"] ?? "");
  const name = `${lastName} ${firstName}`.trim();
  return {
    id: String(item["id"] ?? ""),
    name,
    email: String(item["email"] ?? ""),
    role: String(item["roleName"] ?? item["role"] ?? "Operator"),
  };
}

export async function getUsers(): Promise<User[]> {
  const items = await apiFetch<unknown[]>("/users");
  if (!Array.isArray(items)) return [];
  return (items as unknown[]).map((i) => toUiUser(i as Record<string, unknown>));
}

export async function createUser(payload: { firstName: string; lastName: string; email: string; role: string; password?: string }): Promise<User> {
  const body: Record<string, unknown> = { email: payload.email, firstName: payload.firstName, lastName: payload.lastName, roleName: payload.role };
  if (payload.password) body.password = payload.password;
  const created = await apiFetch<Record<string, unknown>>("/users", { method: "POST", body });
  return toUiUser(created);
}

export async function updateUser(id: string, payload: Partial<{ firstName: string; lastName: string; email: string; role: string; password?: string }>): Promise<User | null> {
  const body: Record<string, unknown> = {};
  if (payload.email) body.email = payload.email;
  if (payload.firstName !== undefined) body.firstName = payload.firstName;
  if (payload.lastName !== undefined) body.lastName = payload.lastName;
  if (payload.role) body.roleName = payload.role;
  if (payload.password) body.password = payload.password;
  const updated = await apiFetch<Record<string, unknown>>(`/users/${id}`, { method: "PUT", body });
  if (!updated) return null;
  return toUiUser(updated);
}

export async function deleteUser(id: string): Promise<boolean> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
  return true;
}

export async function resetPassword(id: string): Promise<boolean> {
  await apiFetch(`/users/${id}/reset-password`, { method: "POST" });
  return true;
}

export default { getUsers, createUser, updateUser, deleteUser, resetPassword };
