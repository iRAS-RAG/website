import React from "react";
import {
  Paper,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  useTheme,
} from "@mui/material";

interface SensorCardProps {
  label: string;
  value: string;
  unit: string;
  trend: string;
  status: string;
  statusColor: "success" | "warning" | "error";
  icon: React.ElementType;
  optimalRange: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit,
  trend,
  status,
  statusColor,
  icon: Icon,
  optimalRange,
}) => {
  const theme = useTheme();

  // Map màu sắc nền và text cho trạng thái
  const colorMap = {
    success: { bg: "#ECFDF5", text: "#10B981", iconBg: "#D1FAE5" }, // Xanh lá
    warning: { bg: "#FFF7ED", text: "#F97316", iconBg: "#FFEDD5" }, // Cam
    error: { bg: "#FEF2F2", text: "#EF4444", iconBg: "#FEE2E2" }, // Đỏ
  };

  const colors = colorMap[statusColor];

  // Xác định màu xu hướng (Trend color)
  // Nếu là warning/error -> trend thường là màu đỏ/cam. Nếu success -> xanh.
  // Ở đây ta đơn giản hóa: Nếu status là error/warning thì trend màu đỏ, ngược lại xanh.
  const trendColor =
    statusColor === "success"
      ? theme.palette.success.main
      : theme.palette.error.main;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: "16px",
        border: `1px solid ${theme.palette.divider}`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      {/* Header: Icon & Status Chip */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            bgcolor: colors.iconBg, // Nền icon theo trạng thái
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.text,
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Box>
        <Chip
          label={status}
          size="small"
          sx={{
            bgcolor: colors.bg,
            color: colors.text,
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 24,
            border: "none",
          }}
        />
      </Stack>

      {/* Content: Label & Value */}
      <Box mb={2}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 0.5 }}
        >
          {label}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.5}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: "2rem",
              color: theme.palette.text.primary,
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
          >
            {unit}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: trendColor, fontWeight: 600, mt: 0.5, display: "block" }}
        >
          {trend}
        </Typography>
      </Box>

      {/* Footer: Optimal Range */}
      <Box>
        <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary }}
        >
          Ngưỡng:{" "}
          <Box component="span" sx={{ fontWeight: 600 }}>
            {optimalRange}
          </Box>
        </Typography>
      </Box>
    </Paper>
  );
};
