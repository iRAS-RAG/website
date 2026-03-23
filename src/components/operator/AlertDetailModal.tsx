import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Stack,
  IconButton,
  Chip,
  Avatar,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 1. CẬP NHẬT INTERFACE: Xóa level, sửa status
export interface AlertData {
  id: string | number;
  time: string;
  sensorCode: string;
  sensorName: string;
  value: string;
  limit: string;
  tank: string;
  staff: string;
  status: "Đang xử lý" | "Chờ xử lý" | "Đóng sự cố";
}

const shortTermData = [
  { time: "08:00", value: 6.5 },
  { time: "08:30", value: 6.2 },
  { time: "09:00", value: 5.9 },
  { time: "09:30", value: 5.4 },
  { time: "10:00", value: 4.8 },
  { time: "10:30", value: 4.2 },
];

interface AlertDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: AlertData | null;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const theme = useTheme();

  if (!data) return null;

  // Cố định một màu đỏ cho tất cả các cảnh báo (thay vì phụ thuộc vào Level)
  const alertTheme = {
    main: theme.palette.error.main,
    light: theme.palette.error.light,
    bg: "#FEF2F2",
  };

  return (
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
          {/* Đã xóa Chip Mức độ */}
        </Stack>

        {/* 2. CẬP NHẬT CÂU THÔNG BÁO: Dùng sensorName (Ví dụ: Độ pH, Nhiệt độ) thay vì ID */}
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
              GIÁ TRỊ HIỆN TẠI
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

        {/* Biểu đồ */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Xu hướng gần đây
        </Typography>
        <Box sx={{ height: 200, mb: 3 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={shortTermData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="time"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={alertTheme.main}
                strokeWidth={3}
                dot={{ r: 4, fill: alertTheme.main }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* AI Suggestion */}
        <Box
          sx={{
            p: 2,
            bgcolor: theme.palette.primary.light,
            borderRadius: "16px",
            display: "flex",
            gap: 2,
            mb: 3,
            border: `1px solid ${theme.palette.primary.main}33`,
          }}
        >
          <Avatar
            sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}
          >
            <SmartToyIcon />
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: theme.palette.primary.main }}
            >
              Hướng dẫn từ AI Advisor
            </Typography>
            <Typography variant="body2" sx={{ my: 0.5, lineHeight: 1.5 }}>
              Dựa trên dữ liệu cảm biến {data.sensorCode}, hệ thống đề xuất kiểm
              tra thiết bị và thực hiện quy trình SOP tương ứng.
            </Typography>
            <Button
              size="small"
              variant="text"
              sx={{ p: 0, minWidth: 0, fontWeight: 700 }}
            >
              Xem chi tiết SOP &rarr;
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 3. CẬP NHẬT NÚT HÀNH ĐỘNG: Ẩn nút nếu trạng thái là Đóng sự cố */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center"></Stack>

          <Stack direction="row" spacing={1.5}>
            {data.status !== "Đóng sự cố" ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.secondary,
                  }}
                >
                  Gửi hỗ trợ
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "none",
                  }}
                >
                  Đã xử lý
                </Button>
              </>
            ) : (
              <Chip
                label="Sự cố đã được đóng"
                color="success"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  borderRadius: "8px",
                  borderStyle: "dashed",
                  height: 36,
                }}
              />
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
