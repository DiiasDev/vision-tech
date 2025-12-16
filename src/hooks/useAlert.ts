import { useState, useCallback } from "react";
import type { AlertColor } from "@mui/material";

interface AlertState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showAlert = useCallback(
    (message: string, severity: AlertColor = "info") => {
      setAlert({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const showSuccess = useCallback((message: string) => {
    showAlert(message, "success");
  }, [showAlert]);

  const showError = useCallback((message: string) => {
    showAlert(message, "error");
  }, [showAlert]);

  const showWarning = useCallback((message: string) => {
    showAlert(message, "warning");
  }, [showAlert]);

  const showInfo = useCallback((message: string) => {
    showAlert(message, "info");
  }, [showAlert]);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert,
  };
}
