import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Divider, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import type { ControlDevice } from "../../../types/control-device";
import type { MasterBoard } from "../../../types/masterboard";
import type { Sensor } from "../../../types/sensor";

type Props = {
  board: MasterBoard;
  sensors: Sensor[];
  controls: ControlDevice[];
  onEdit: (b: MasterBoard) => void;
  onAddSensor: () => void;
  onAddControl: () => void;
};

export default function MasterBoardDetail({ board, sensors, controls, onEdit, onAddSensor, onAddControl }: Props) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6">{board.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {board.fishTankName ? `Bể: ${board.fishTankName}` : "(Không liên kết bể)"}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(board)}>
          Chỉnh sửa
        </Button>
      </Box>
      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
        <Button variant="contained" color="success" onClick={onAddSensor}>
          Thêm cảm biến
        </Button>
        <Button variant="contained" color="primary" onClick={onAddControl}>
          Thêm thiết bị điều khiển
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" } }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2">MAC Address</Typography>
          <Typography sx={{ mt: 1 }}>{board.macAddress ?? "—"}</Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Cảm biến ({sensors.length})</Typography>
        <List>
          {sensors.map((s) => (
            <ListItem key={s.id}>
              <ListItemText primary={s.name} secondary={s.sensorTypeName ?? ""} />
            </ListItem>
          ))}
          {sensors.length === 0 && (
            <ListItem>
              <ListItemText primary="Không có" />
            </ListItem>
          )}
        </List>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Thiết bị điều khiển ({controls.length})</Typography>
        <List>
          {controls.map((c) => (
            <ListItem key={c.id}>
              <ListItemText primary={c.name} secondary={c.controlDeviceTypeName ?? ""} />
            </ListItem>
          ))}
          {controls.length === 0 && (
            <ListItem>
              <ListItemText primary="Không có" />
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );
}
