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
  isSelected?: boolean;
  onClick?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit,
  trend,
  status,
  statusColor,
  icon: Icon,
  isSelected = false,
  onClick,
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
      onClick={onClick}
      variant="outlined"
      sx={{
        p: 2,
        minHeight: 140,
        borderRadius: "16px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        // Chuyển đổi màu viền và background khi được chọn
        borderColor: isSelected
          ? theme.palette.primary.main
          : theme.palette.divider,
        borderWidth: isSelected ? 2 : 1,
        bgcolor: isSelected
          ? `${theme.palette.primary.light}15`
          : "background.paper",
        boxShadow: isSelected
          ? `0 0 0 4px ${theme.palette.primary.light}40`
          : "none",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor:
            !isSelected && onClick ? theme.palette.primary.light : undefined,
        },
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
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: colors.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.text,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
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
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.secondary,
            mb: 0.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={label}
        >
          {label}
        </Typography>
        <Stack
          direction="row"
          alignItems="baseline"
          spacing={0.5}
          sx={{ flexWrap: "wrap" }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: "1.75rem",
              color: theme.palette.text.primary,
              lineHeight: 1.2,
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
    </Paper>
  );
};
