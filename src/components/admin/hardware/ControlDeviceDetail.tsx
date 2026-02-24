import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import type { ControlDevice } from "../../../types/hardware";

type Props = {
  control: ControlDevice;
  onEdit: (c: ControlDevice) => void;
};

export default function ControlDeviceDetail({ control, onEdit }: Props) {
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

      <Divider sx={{ my: 2 }} />

      <Box>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">Board</Typography>
          <Typography sx={{ mt: 1 }}>{control.masterBoardName ?? "—"}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">Pin</Typography>
          <Typography sx={{ mt: 1 }}>{control.pinCode ?? "—"}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2">Trạng thái</Typography>
          <Typography sx={{ mt: 1 }}>{control.state ? "Bật" : "Tắt"}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
