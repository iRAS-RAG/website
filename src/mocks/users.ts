export type UserRole = "Admin" | "Supervisor" | "Operator";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

let users: User[] = [
  { id: "u1", name: "Alice Nguyen", email: "alice@example.com", role: "Admin" },
  { id: "u2", name: "Binh Tran", email: "binh@example.com", role: "Supervisor" },
  { id: "u3", name: "Cuong Le", email: "cuong@example.com", role: "Operator" },
];

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function fetchUsers(): Promise<User[]> {
  await wait();
  return users.map((u) => ({ ...u }));
}

export async function createUser(payload: Omit<User, "id">): Promise<User> {
  await wait();
  const newUser: User = { id: `u${Date.now()}`, ...payload };
  users.push(newUser);
  return { ...newUser };
}

export async function updateUser(id: string, payload: Partial<User>): Promise<User | null> {
  await wait();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...payload };
  return { ...users[idx] };
}

export async function deleteUser(id: string): Promise<boolean> {
  await wait();
  const before = users.length;
  users = users.filter((u) => u.id !== id);
  return users.length < before;
}

export async function resetPassword(id: string): Promise<boolean> {
  await wait();
  // Mock: always succeed if user exists
  return users.some((u) => u.id === id);
}
