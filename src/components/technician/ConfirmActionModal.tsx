import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography, useTheme } from "@mui/material";

interface ConfirmActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionTitle?: string;
}

export const ConfirmActionModal = ({ open, onClose, onConfirm, actionTitle = "Xử lý khẩn cấp DO thấp" }: ConfirmActionModalProps) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0px 10px 40px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* HEADER - Đã chỉnh đường gạch gần chữ hơn */}
      <DialogTitle
        sx={{
          m: 0,
          pt: 3, // Giữ khoảng cách trên cao (24px) cho thoáng
          px: 3, // Giữ khoảng cách 2 bên (24px)
          pb: 1, // GIẢM padding dưới xuống (8px) để đường gạch sát chữ
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "1.25rem",
            color: theme.palette.text.primary,
          }}
        >
          Xác nhận thực hiện hành động
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent sx={{ p: 3 }}>
        {/* 1. Khối thông tin chi tiết (Xám) */}
        <Box
          sx={{
            bgcolor: "#F8FAFC",
            p: 2.5,
            borderRadius: "12px",
            mb: 3,
            mt: 1, // Thêm margin top nhỏ để tách biệt rõ hơn với đường gạch header
          }}
        >
          {/* Tiêu đề hành động */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#334155",
              mb: 1,
              fontSize: "1.1rem",
            }}
          >
            {actionTitle}
          </Typography>

          {/* Mô tả tình trạng */}
          <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
            Mức DO giảm xuống 4.2 mg/L - dưới ngưỡng an toàn (5.5 mg/L)
          </Typography>

          {/* List thông số kỹ thuật */}
          <Stack spacing={1}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", minWidth: 100 }}>
                Phương pháp:
              </Typography>
              <Typography variant="body2" sx={{ color: "#334155" }}>
                Tăng công suất sục khí lên 100%
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", minWidth: 100 }}>
                Liều lượng:
              </Typography>
              <Typography variant="body2" sx={{ color: "#334155" }}>
                Ngay lập tức
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", minWidth: 100 }}>
                Mục tiêu:
              </Typography>
              <Typography variant="body2" sx={{ color: "#334155" }}>
                Đạt DO ≥ 5.5 mg/L trong 30 phút
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* 2. Khối Lưu ý (Vàng cam) */}
        <Box
          sx={{
            bgcolor: "#FFF7ED",
            p: 2,
            borderRadius: "12px",
            border: "1px solid #FFEDD5",
          }}
        >
          <Typography variant="body2" sx={{ color: "#9A3412", lineHeight: 1.6, fontSize: "0.85rem" }}>
            <Box component="span" sx={{ fontWeight: 700 }}>
              Lưu ý:{" "}
            </Box>
            Hành động này sẽ được ghi vào nhật ký bảo trì. Vui lòng đảm bảo đã chuẩn bị đầy đủ vật tư và thiết bị cần thiết.
          </Typography>
        </Box>
      </DialogContent>

      {/* FOOTER ACTIONS */}
      <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            height: 44,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            color: "#64748B",
            borderColor: "#E2E8F0",
            "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={<CheckCircleIcon />}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#10B981",
            boxShadow: "none",
            "&:hover": { bgcolor: "#059669", boxShadow: "none" },
          }}
        >
          Xác nhận thực hiện
        </Button>
      </DialogActions>
    </Dialog>
  );
};
