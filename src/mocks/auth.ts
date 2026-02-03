export type Role = "Admin" | "Supervisor" | "Operator";

export const currentUser: { id: string; name: string; role: Role } = {
  id: "",
  name: "Guest",
  role: "Operator",
};

export function setCurrentUser(user: { id: string; name: string; role: Role }) {
  currentUser.id = user.id;
  currentUser.name = user.name;
  currentUser.role = user.role;
}

export function clearCurrentUser() {
  currentUser.id = "";
  currentUser.name = "Guest";
  currentUser.role = "Operator";
}

export const isAdmin = () => currentUser.role === "Admin";
export const isSupervisor = () => currentUser.role === "Supervisor";
export const isOperator = () => currentUser.role === "Operator";
