// src/components/operator/SensorCard.tsx
import React from "react";
import { Paper, Box, Typography, Chip, Stack, useTheme } from "@mui/material";

interface SensorCardProps {
  label: string;
  value: string;
  unit: string;
  trend: string;
  status: string;
  statusColor: "success" | "warning" | "error";
  icon: React.ElementType;
  // Đã xóa optimalRange
}

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit,
  trend,
  status,
  statusColor,
  icon: Icon,
  // Đã xóa optimalRange
}) => {
  const theme = useTheme();

  const colorMap = {
    success: { bg: "#ECFDF5", text: "#10B981", iconBg: "#D1FAE5" },
    warning: { bg: "#FFF7ED", text: "#F97316", iconBg: "#FFEDD5" },
    error: { bg: "#FEF2F2", text: "#EF4444", iconBg: "#FEE2E2" },
  };

  const colors = colorMap[statusColor];
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
        // Đã bỏ justifyContent: "space-between" để nội dung tự đẩy lên trên cho đẹp
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
            bgcolor: colors.iconBg,
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
      <Box>
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
      {/* Đã xóa hoàn toàn Footer chứa Ngưỡng */}
    </Paper>
  );
};
