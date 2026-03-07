import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PinDropIcon from "@mui/icons-material/PinDrop";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import type { Sensor } from "../../../types/sensor";

type Props = {
  sensor: Sensor;
  onEdit: (s: Sensor) => void;
  onDelete: (s: Sensor) => void;
};

export default function SensorDetail({ sensor, onEdit, onDelete }: Props) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6">{sensor.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {sensor.sensorTypeName ?? "(Loại không xác định)"}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(sensor)}>
          Chỉnh sửa
        </Button>
      </Box>

      <Box sx={{ mt: 1 }}>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(sensor)}>
          Xóa cảm biến
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <PinDropIcon fontSize="small" />
              Pin
            </span>
          </Typography>
          <Typography sx={{ mt: 1 }}>{sensor.pinCode ?? "—"}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
