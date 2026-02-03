import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { currentUser } from "../mocks/auth";

type Props = {
  check: () => boolean;
  children: JSX.Element;
  redirectTo?: string;
};

function roleDefaultRedirect() {
  switch (currentUser.role) {
    case "Admin":
      return "/admin/dashboard";
    case "Supervisor":
      return "/supervisor/dashboard";
    case "Operator":
      return "/operator/dashboard";
    default:
      return "/";
  }
}

export default function ProtectedRoute({ check, children, redirectTo }: Props) {
  const target = redirectTo ?? roleDefaultRedirect();
  return check() ? children : <Navigate to={target} replace />;
}
