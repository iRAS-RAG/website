import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  IconButton,
  Chip,
  Button,
  Divider,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { alertApi } from "../../api/alerts";
import CloseIcon from "@mui/icons-material/Close";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";

// 1. CẬP NHẬT INTERFACE: Xóa level, sửa status
export interface AlertData {
  id: string | number;
  time: string;
  sensorCode: string;
  sensorName: string;
  value: string;
  limit: string;
  tank: string;
  tankId: string;
  staff: string;
  status: "Đang xử lý" | "Chờ xử lý" | "Đóng sự cố" | "Đã bỏ qua";
  hasCorrectiveAction: boolean;
}

interface AlertDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: AlertData | null;
  onStatusChange?: () => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  open,
  onClose,
  data,
  onStatusChange,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [pendingStatus, setPendingStatus] = useState<"Acknowledged" | "Dismissed" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Task 1: chuyển sang trang AI Advisor với prompt mở đầu điền sẵn
  const handleConsultAI = () => {
    if (!data) return;
    const prompt =
      `${data.tank} đang có chỉ số ${data.sensorName} là ${data.value} ` +
      `(vượt ngưỡng an toàn ${data.limit}). ` +
      `Hãy hướng dẫn tôi quy trình xử lý SOP khẩn cấp cho tình huống này.`;
    navigate("/operator/ai-advisory", {
      state: {
        tankId: data.tankId,
        tankName: data.tank,
        prefillPrompt: prompt,
      },
    });
    onClose();
  };

  const handleGoToCorrectiveAction = () => {
    if (!data) return;
    navigate("/operator/maintenance", {
      state: { openCreate: true, alertId: String(data.id) },
    });
    onClose();
  };

  const handleStatusConfirm = async () => {
    if (!data || !pendingStatus) return;
    setSubmitting(true);
    try {
      await alertApi.updateStatus(String(data.id), pendingStatus);
      onStatusChange?.();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
    } finally {
      setSubmitting(false);
      setPendingStatus(null);
    }
  };

  if (!data) return null;

  // Cố định một màu đỏ cho tất cả các cảnh báo (thay vì phụ thuộc vào Level)
  const alertTheme = {
    main: theme.palette.error.main,
    light: theme.palette.error.light,
    bg: "#FEF2F2",
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Chi tiết cảnh báo
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* Thông tin cơ bản */}
        <Stack direction="row" spacing={2} mb={2}>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                fontSize: "10px",
                textTransform: "uppercase",
              }}
            >
              Thời gian
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {data.time}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                fontSize: "10px",
                textTransform: "uppercase",
              }}
            >
              Bể ảnh hưởng
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {data.tank}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                fontSize: "10px",
                textTransform: "uppercase",
              }}
            >
              Cảm biến
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {data.sensorCode}
            </Typography>
          </Box>
        </Stack>

        {/* CÂU THÔNG BÁO: Dùng sensorName */}
        <Typography
          variant="body2"
          sx={{
            p: 2,
            bgcolor: alertTheme.bg,
            borderRadius: "12px",
            color: alertTheme.main,
            mb: 3,
            fontWeight: 500,
            border: `1px solid ${alertTheme.light}`,
          }}
        >
          Giá trị <strong>{data.sensorName}</strong> đang ở mức {data.value},
          vượt ngưỡng an toàn ({data.limit}). Cần kiểm tra và xử lý ngay.
        </Typography>

        {/* So sánh giá trị */}
        <Stack direction="row" spacing={2} mb={3}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              border: `1px solid ${alertTheme.light}`,
              borderRadius: "16px",
              bgcolor: "#fff",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              GIÁ TRỊ VƯỢT NGƯỠNG BAN ĐẦU
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: alertTheme.main }}
            >
              {data.value}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: alertTheme.main }}
            >
              <TrendingDownIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Bất thường
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              border: `1px solid ${theme.palette.success.light}`,
              borderRadius: "16px",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              NGƯỠNG AN TOÀN
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: theme.palette.success.main }}
            >
              {data.limit}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.success.main, fontWeight: 600 }}
            >
              Mức tối ưu
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* NÚT HÀNH ĐỘNG */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {/* Status transition buttons */}
          <Stack direction="row" spacing={1}>
            {data.status === "Chờ xử lý" && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setPendingStatus("Acknowledged")}
                  sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, boxShadow: "none" }}
                >
                  Tiếp nhận
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => setPendingStatus("Dismissed")}
                  sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                >
                  Bỏ qua
                </Button>
              </>
            )}
            {data.status === "Đang xử lý" && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setPendingStatus("Dismissed")}
                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
              >
                Bỏ qua
              </Button>
            )}
            {(data.status === "Đóng sự cố" || data.status === "Đã bỏ qua") && (
              <Chip
                label={data.status === "Đóng sự cố" ? "Sự cố đã được đóng" : "Đã bỏ qua"}
                color={data.status === "Đóng sự cố" ? "success" : "default"}
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: "8px", borderStyle: "dashed", height: 36 }}
              />
            )}
          </Stack>

          {/* Action buttons */}
          {data.status !== "Đã bỏ qua" && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<BuildOutlinedIcon />}
                onClick={handleGoToCorrectiveAction}
                disabled={data.hasCorrectiveAction}
                sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
              >
                Hành động khắc phục
              </Button>
              {data.status !== "Đóng sự cố" && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SmartToyOutlinedIcon />}
                  onClick={handleConsultAI}
                  sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                >
                  Tham vấn AI Advisor
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>

    {/* Confirmation dialog */}
    <Dialog open={pendingStatus !== null} onClose={() => setPendingStatus(null)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận thay đổi trạng thái</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {pendingStatus === "Acknowledged"
            ? "Bạn có chắc muốn tiếp nhận cảnh báo này? Trạng thái sẽ chuyển sang Đang xử lý."
            : "Bạn có chắc muốn bỏ qua cảnh báo này? Đây là thao tác không thể hoàn tác."}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => setPendingStatus(null)}
          disabled={submitting}
          sx={{ textTransform: "none" }}
        >
          Huỷ
        </Button>
        <Button
          variant="contained"
          color={pendingStatus === "Dismissed" ? "error" : "primary"}
          disabled={submitting}
          onClick={handleStatusConfirm}
          startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none" }}
        >
          {submitting ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};
