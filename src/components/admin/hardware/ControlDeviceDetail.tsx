import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import type { ControlDevice } from "../../../types/control-device";

type Props = {
  control: ControlDevice;
  onEdit: (c: ControlDevice) => void;
  onDelete: (c: ControlDevice) => void;
};

export default function ControlDeviceDetail({ control, onEdit, onDelete }: Props) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6">{control.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {control.controlDeviceTypeName ?? "(Loại không xác định)"}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(control)}>
          Chỉnh sửa
        </Button>
      </Box>

      <Box sx={{ mt: 1 }}>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(control)}>
          Xóa thiết bị điều khiển
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <PinDropIcon fontSize="small" />
              Pin
            </span>
          </Typography>
          <Typography sx={{ mt: 1 }}>{control.pinCode ?? "—"}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <PowerSettingsNewIcon fontSize="small" />
              Lệnh bật
            </span>
          </Typography>
          <Typography sx={{ mt: 1, fontFamily: "Monospace" }}>{control.commandOn ?? "—"}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <PowerSettingsNewIcon fontSize="small" />
              Lệnh tắt
            </span>
          </Typography>
          <Typography sx={{ mt: 0.5, fontFamily: "Monospace" }}>{control.commandOff ?? "—"}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <ToggleOnIcon fontSize="small" />
              Trạng thái
            </span>
          </Typography>
          <Typography sx={{ mt: 1 }}>{control.state ? "Bật" : "Tắt"}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
