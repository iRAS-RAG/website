import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ConfirmActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionTitle?: string;
}

export const ConfirmActionModal = ({
  open,
  onClose,
  onConfirm,
  actionTitle = "Xử lý khẩn cấp DO thấp",
}: ConfirmActionModalProps) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: "20px", width: "100%", maxWidth: "500px", p: 1 },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          Xác nhận thực hiện hành động
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: theme.palette.text.secondary }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* Khối nội dung chính (Xám nhạt) */}
        <Box
          sx={{
            bgcolor: "#F8FAFC",
            p: 2.5,
            borderRadius: "16px",
            mb: 2,
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.error.main,
              mb: 1,
              fontSize: "1.15rem",
            }}
          >
            {actionTitle}
          </Typography>

          <Typography
            variant="body2"
            sx={{ mb: 2, color: theme.palette.text.primary }}
          >
            <strong>Lý do can thiệp:</strong> Mức DO giảm xuống{" "}
            <span style={{ color: theme.palette.error.main, fontWeight: 600 }}>
              4.2 mg/L
            </span>{" "}
            - dưới ngưỡng an toàn (5.5 mg/L).
          </Typography>

          <Divider sx={{ my: 1.5, opacity: 0.5 }} />

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
            }}
          >
            Thông số kỹ thuật
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>• Phương pháp:</strong> Tăng công suất sục khí lên 100%.
            </Typography>
            <Typography variant="body2">
              <strong>• Liều lượng:</strong> Ngay lập tức.
            </Typography>
            <Typography variant="body2">
              <strong>• Mục tiêu:</strong> Đạt DO ≥ 5.5 mg/L trong 30 phút.
            </Typography>
          </Stack>
        </Box>

        {/* Khối cảnh báo ghi nhật ký (Vàng nhạt) */}
        <Box
          sx={{
            bgcolor: theme.palette.warning.light,
            p: 2,
            borderRadius: "12px",
            border: `1px solid ${theme.palette.warning.main}`,
            display: "flex",
            gap: 1.5,
          }}
        >
          <ErrorOutlineIcon
            sx={{ color: theme.palette.warning.main, mt: 0.2 }}
          />
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Hệ thống sẽ ghi tự động vào Nhật ký bảo trì.
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              Yêu cầu người vận hành đảm bảo đã sẵn sàng đầy đủ vật tư và thiết
              bị cần thiết trước khi nhấn xác nhận.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: "10px",
            py: 1,
            fontWeight: 600,
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={<CheckCircleIcon />}
          sx={{
            flex: 1,
            borderRadius: "10px",
            py: 1,
            fontWeight: 600,
            bgcolor: theme.palette.success.main,
            "&:hover": { bgcolor: theme.palette.success.dark },
          }}
        >
          Xác nhận thực hiện
        </Button>
      </DialogActions>
    </Dialog>
  );
};
