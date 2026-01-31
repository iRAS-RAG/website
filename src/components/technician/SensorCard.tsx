import { Paper, Box, Typography, Chip, Stack, useTheme } from "@mui/material";
import type { SvgIconProps } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface SensorCardProps {
  label: string;
  value: string;
  unit: string;
  trend: string;
  status: string;
  statusColor: "success" | "warning" | "error"; // Khớp với key trong theme palette
  icon?: React.ElementType<SvgIconProps>;
}

export const SensorCard = ({
  label,
  value,
  unit,
  trend,
  status,
  statusColor,
  icon: Icon,
}: SensorCardProps) => {
  const theme = useTheme();
  const isUp = trend.startsWith("+");

  return (
    <Paper
      sx={{
        p: "16px",
        borderRadius: "16px",
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 20px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 1.5 }}
      >
        <Box
          sx={{
            p: 1,
            borderRadius: "10px",
            bgcolor: "background.default",
            color: "primary.main",
            display: "flex",
          }}
        >
          {Icon && <Icon sx={{ fontSize: 20 }} />}
        </Box>
        <Chip
          label={status}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "10px",
            // Cập nhật quan trọng: MUI sx tự hiểu shorthand "success.light"
            bgcolor: `${statusColor}.light`,
            color: `${statusColor}.main`,
            borderRadius: "8px",
            border: "none",
          }}
        />
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography
        variant="h2"
        sx={{
          color: "text.primary",
          my: 0.5,
          fontSize: "1.8rem",
          fontWeight: 800,
        }}
      >
        {value}
        <Box
          component="span"
          sx={{
            fontSize: "1rem",
            ml: 0.5,
            fontWeight: 500,
            color: "text.secondary",
          }}
        >
          {unit}
        </Box>
      </Typography>

      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: isUp ? "success.main" : "error.main",
          }}
        >
          {isUp ? (
            <TrendingUpIcon sx={{ fontSize: 14 }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 14 }} />
          )}
          <Typography variant="caption" sx={{ fontWeight: 700, ml: 0.2 }}>
            {trend}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          vs hôm qua
        </Typography>
      </Stack>
    </Paper>
  );
};
