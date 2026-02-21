export function translateRole(r: string) {
  switch (r) {
    case "Admin":
      return "Quản trị viên";
    case "Supervisor":
      return "Quản lý";
    case "Operator":
      return "Kỹ thuật viên";
    default:
      return r;
  }
}
