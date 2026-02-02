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

// 1. Định nghĩa Interface cho dữ liệu cảnh báo để thay thế 'any'
interface AlertData {
  time: string;
  sensor: string;
  type: string;
  value: string;
  limit: string;
  level: "Nghiêm trọng" | "Cao" | "Trung bình" | "Thấp";
  tank: string;
  staff: string;
  status: string;
  levelColor: "error" | "warning" | "info" | "success" | "primary";
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
  data: AlertData | null; // Sử dụng AlertData thay vì any
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const theme = useTheme();

  if (!data) return null;

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
          <Typography variant="caption" color="text.secondary">
            Mã: ALT-2024-001
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} mb={2}>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
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
              border: "1px solid #E2E8F0",
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
              {data.sensor}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.type}
            </Typography>
          </Box>
          <Chip
            label={data.level}
            color={data.levelColor} // Sử dụng levelColor từ theme
            sx={{ fontWeight: 700, borderRadius: "8px" }}
          />
        </Stack>

        <Typography
          variant="body2"
          sx={{
            p: 2,
            bgcolor: theme.palette.error.light,
            borderRadius: "12px",
            color: theme.palette.error.main,
            mb: 3,
            fontWeight: 500,
          }}
        >
          Mức DO giảm mạnh xuống dưới ngưỡng an toàn. Nguy cơ thiếu oxy cho tôm.
          Cần can thiệp khẩn cấp.
        </Typography>

        <Stack direction="row" spacing={2} mb={3}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              border: `1px solid ${theme.palette.error.light}`,
              borderRadius: "16px",
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
              sx={{ fontWeight: 800, color: theme.palette.error.main }}
            >
              {data.value}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: theme.palette.error.main }}
            >
              <TrendingDownIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Giảm 35% trong 2 giờ
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
              Mức tối ưu cho nuôi trồng
            </Typography>
          </Box>
        </Stack>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Xu hướng 3 giờ gần đây
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
                domain={[0, 8]}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.error.main}
                strokeWidth={3}
                dot={{ r: 4, fill: theme.palette.error.main }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

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
              Tăng công suất sục khí lên 100% ngay lập tức. Kiểm tra hệ thống
              đầu sục và máy thổi khí.
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: theme.palette.primary.main }}
            >
              Mục tiêu: Đạt DO ≥ 5.5 mg/L trong 30 phút.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {data.staff.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, display: "block", fontSize: "9px" }}
              >
                KỸ THUẬT VIÊN PHỤ TRÁCH
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {data.staff}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
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
              }}
            >
              Đã xử lý
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
