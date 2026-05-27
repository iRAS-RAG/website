import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PinDropIcon from "@mui/icons-material/PinDrop";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import type { Sensor } from "../../../types/sensor";

type Props = {
  sensor: Sensor;
  onEdit: (s: Sensor) => void;
  onDelete: (s: Sensor) => void;
};

export default function SensorDetail({ sensor, onEdit, onDelete }: Props) {
  return (
    <Box>
      {/* Header & Actions */}
      {/* Header & Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          {/* Đưa Loại cảm biến lên làm Tiêu đề chính */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}>
            {sensor.sensorTypeName || "Cảm biến chưa phân loại"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Nhãn Pin */}
            <Chip
              label={`Pin: ${sensor.pinCode ?? "-"}`}
              size="small"
              sx={{
                fontWeight: 600,
                fontFamily: "monospace",
                bgcolor: "action.hover",
              }}
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(sensor)}>
            Sửa
          </Button>
          <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(sensor)}>
            Xóa
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Main Content Grid */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        {/* Card 1: Thông số Cổng (Pin) */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 1,
              letterSpacing: 0.5,
            }}
          >
            <PinDropIcon fontSize="small" />
            CỔNG KẾT NỐI (PIN)
          </Typography>
          <Typography variant="h5" sx={{ fontFamily: "monospace", fontWeight: 600, mt: 1 }}>
            {sensor.pinCode ?? "—"}
          </Typography>
        </Paper>

        {/* Không gian trống dành cho Chart/Telemetry sau này */}
      </Box>
    </Box>
  );
}
