import { Alert, Snackbar } from "@mui/material";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import type { Toast } from "./toastContext";
import { ToastContext } from "./toastContext";
import { setToastHandlers } from "./toastService";

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast>({ message: "", severity: "info" });

  const show = useCallback((t: Toast) => {
    setToast(t);
    setOpen(true);
  }, []);

  const success = useCallback((m: string) => show({ message: m, severity: "success" }), [show]);
  const error = useCallback((m: string) => show({ message: m, severity: "error" }), [show]);
  const info = useCallback((m: string) => show({ message: m, severity: "info" }), [show]);
  const warning = useCallback((m: string) => show({ message: m, severity: "warning" }), [show]);

  useEffect(() => {
    setToastHandlers({ success, error, info, warning });
    return () => {
      setToastHandlers(null);
    };
  }, [success, error, info, warning]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning }}>
      {children}
      <Snackbar open={open} onClose={() => setOpen(false)} autoHideDuration={4000} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setOpen(false)} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
