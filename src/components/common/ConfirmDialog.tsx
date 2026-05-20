import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  content: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  color?: "error" | "primary" | "warning" | "info" | "success";
  icon?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  onClose,
  onConfirm,
  content,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loading = false,
  color = "error",
  icon,
}) => {
  // Mặc định sử dụng icon cảnh báo màu đỏ nếu là hành động "error" (Xóa)
  const defaultIcon = icon || (
    <Box
      sx={{
        bgcolor: color === "error" ? "#FEF2F2" : "#F0F9FF",
        color: color === "error" ? "#DC2626" : "#0284C7",
        p: 1,
        borderRadius: "50%",
        display: "flex",
      }}
    >
      <WarningAmberIcon />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "12px", p: 1 },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}
      >
        {defaultIcon}
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ color: "#475569", mt: 1, lineHeight: 1.6 }}>
          {content}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "#64748B",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { bgcolor: "#F1F5F9" },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={color}
          sx={{
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : color === "error" ? (
              <DeleteIcon fontSize="small" />
            ) : undefined
          }
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
