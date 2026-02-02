export type Role = "Admin" | "Manager" | "Technician";

export const currentUser: { id: string; name: string; role: Role } = {
  id: "",
  name: "Guest",
  role: "Technician",
};

export function setCurrentUser(user: { id: string; name: string; role: Role }) {
  currentUser.id = user.id;
  currentUser.name = user.name;
  currentUser.role = user.role;
}

export function clearCurrentUser() {
  currentUser.id = "";
  currentUser.name = "Guest";
  currentUser.role = "Technician";
}

export const isAdmin = () => currentUser.role === "Admin";
