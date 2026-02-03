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

// 1. Cập nhật Interface khớp với AlertCenter.tsx
export interface AlertData {
  id: number;
  time: string;
  sensorCode: string;
  sensorName: string;
  value: string;
  limit: string;
  level: "Nghiêm trọng" | "Cao" | "Trung bình" | "Thấp";
  tank: string;
  staff: string;
  status: "Đang xử lý" | "Chờ xử lý" | "Đã xử lý";
}

// Dữ liệu biểu đồ giả lập (Trong thực tế sẽ lấy từ API dựa trên id cảnh báo)
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

  // Helper để lấy màu dựa trên mức độ cảnh báo
  const getLevelColorInfo = (level: string) => {
    switch (level) {
      case "Nghiêm trọng":
        return {
          main: theme.palette.error.main,
          light: theme.palette.error.light,
          bg: "#FEF2F2",
        };
      case "Cao":
        return {
          main: theme.palette.warning.main,
          light: theme.palette.warning.light,
          bg: "#FFF7ED",
        };
      case "Trung bình":
        return {
          main: theme.palette.warning.main,
          light: theme.palette.warning.light,
          bg: "#FFFBEB",
        };
      default:
        return {
          main: theme.palette.text.secondary,
          light: theme.palette.action.hover,
          bg: "#F3F4F6",
        };
    }
  };

  const levelColor = getLevelColorInfo(data.level);

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
            Mã: ALT-{new Date().getFullYear()}-
            {data.id.toString().padStart(3, "0")}
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
            <Typography variant="caption" color="text.secondary">
              {data.sensorName}
            </Typography>
          </Box>

          <Chip
            label={data.level}
            sx={{
              fontWeight: 700,
              borderRadius: "8px",
              bgcolor: levelColor.bg,
              color: levelColor.main,
              border: `1px solid ${levelColor.light}`,
            }}
          />
        </Stack>

        {/* Thông báo phân tích */}
        <Typography
          variant="body2"
          sx={{
            p: 2,
            bgcolor: levelColor.bg,
            borderRadius: "12px",
            color: levelColor.main,
            mb: 3,
            fontWeight: 500,
            border: `1px solid ${levelColor.light}`,
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
              border: `1px solid ${levelColor.light}`,
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
              sx={{ fontWeight: 800, color: levelColor.main }}
            >
              {data.value}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: levelColor.main }}
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
                stroke={levelColor.main}
                strokeWidth={3}
                dot={{ r: 4, fill: levelColor.main }}
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

        {/* Footer Actions */}
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
              {data.staff ? data.staff.charAt(0) : "?"}
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
                {data.staff || "Chưa phân công"}
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
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
