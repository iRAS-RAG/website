import { createContext, useContext } from "react";

export type Severity = "success" | "error" | "info" | "warning";
export type Toast = { message: string; severity?: Severity };

export const ToastContext = createContext<{
  show: (t: Toast) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
} | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
