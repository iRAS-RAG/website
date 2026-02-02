import { Paper, Box, Typography, Chip, Stack, useTheme } from "@mui/material";
import type { SvgIconProps } from "@mui/material";

interface SensorCardProps {
  label: string;
  value: string;
  unit: string;
  trend: string;
  status: string;
  statusColor: "success" | "warning" | "error";
  icon?: React.ElementType<SvgIconProps>;
  optimalRange?: string;
}

export const SensorCard = ({
  label,
  value,
  unit,
  trend,
  status,
  statusColor,
  icon: Icon,
  optimalRange,
}: SensorCardProps) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: "16px", // Bo góc đồng nhất 16px
        border: `1px solid ${theme.palette.divider}`,
        position: "relative",
        bgcolor: "background.paper",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" mb={1.5}>
        <Box
          sx={{
            p: 1,
            borderRadius: "10px",
            bgcolor: theme.palette.background.default,
            color: `${statusColor}.main`,
            display: "flex",
          }}
        >
          {Icon && <Icon sx={{ fontSize: 22 }} />}
        </Box>
        <Chip
          label={status}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "7px",
            bgcolor: `${statusColor}.light`,
            color: `${statusColor}.main`,
            borderRadius: "6px",
          }}
        />
      </Stack>

      <Typography
        variant="caption"
        sx={{
          color: "#94A3B8",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "baseline", my: 0.5 }}>
        <Typography
          sx={{ fontWeight: 800, fontSize: "2rem", color: "#1E293B" }}
        >
          {value}
        </Typography>
        <Typography
          sx={{ ml: 0.5, fontSize: "14px", fontWeight: 600, color: "#94A3B8" }}
        >
          {unit}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{ display: "block", color: "#64748B", mb: 1.5, fontWeight: 500 }}
      >
        {trend}
      </Typography>

      {optimalRange && (
        <Box sx={{ pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Typography
            variant="caption"
            sx={{ color: "#94A3B8", fontStyle: "italic", fontSize: "11px" }}
          >
            Ngưỡng tối ưu: {optimalRange}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
