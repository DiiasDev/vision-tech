import { Snackbar, Alert, type AlertColor } from "@mui/material";

interface AlertComponentProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
  position?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
}

export default function AlertComponent({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 6000,
  position = { vertical: "top", horizontal: "right" },
}: AlertComponentProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={position}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
