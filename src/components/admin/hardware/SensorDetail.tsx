import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import type { Sensor } from "../../../types/sensor";

type Props = {
  sensor: Sensor;
  onEdit: (s: Sensor) => void;
};

export default function SensorDetail({ sensor, onEdit }: Props) {
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

      <Divider sx={{ my: 2 }} />

      <Box>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">Board</Typography>
          <Typography sx={{ mt: 1 }}>{sensor.masterBoardName ?? "—"}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2">Pin</Typography>
          <Typography sx={{ mt: 1 }}>{sensor.pinCode ?? "—"}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
