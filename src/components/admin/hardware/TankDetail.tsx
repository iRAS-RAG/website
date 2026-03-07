import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CodeIcon from "@mui/icons-material/Code";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HeightIcon from "@mui/icons-material/Height";
import StraightenIcon from "@mui/icons-material/Straighten";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import type { MasterBoard } from "../../../types/masterboard";
import type { Sensor } from "../../../types/sensor";
import type { Tank } from "../../../types/tank";

type Props = {
  tank: Tank;
  boards: MasterBoard[];
  sensors: Sensor[];
  onEdit: (t: Tank) => void;
  onAddBoard: () => void;
  onDelete: (t: Tank) => void;
};

export default function TankDetail({ tank, boards, sensors, onEdit, onAddBoard, onDelete }: Props) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">{tank.name}</Typography>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(tank)}>
          Chỉnh sửa
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)", lg: "repeat(4,1fr)" } }}>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <CameraAltIcon fontSize="small" />
                CAMERA URL
              </span>
            </Typography>
            {tank.cameraUrl ? (
              <Typography component="a" href={tank.cameraUrl} target="_blank" rel="noreferrer" color="primary" sx={{ mt: 1, display: "block", wordBreak: "break-all" }}>
                {tank.cameraUrl}
              </Typography>
            ) : (
              <Typography sx={{ mt: 1, display: "block" }}>—</Typography>
            )}
          </Box>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <CodeIcon fontSize="small" />
              MÃ CHỦ ĐỀ
            </span>
          </Typography>
          <Typography sx={{ mt: 1 }}>{tank.topicCode ?? "—"}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <HeightIcon fontSize="small" />
              CHIỀU CAO (cm)
            </span>
          </Typography>
          <Typography sx={{ mt: 1 }}>{typeof tank.height === "number" ? tank.height : "—"}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <StraightenIcon fontSize="small" />
              BÁN KÍNH (cm)
            </span>
          </Typography>
          <Typography sx={{ mt: 1 }}>{typeof tank.radius === "number" ? tank.radius : "—"}</Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1">Cảm biến liên kết ({sensors.filter((x) => boards.map((b) => b.id).includes(x.masterBoardId ?? "")).length})</Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            {sensors
              .filter((x) => boards.map((b) => b.id).includes(x.masterBoardId ?? ""))
              .map((s) => (
                <Paper key={s.id} sx={{ p: 1, mb: 1 }}>
                  <Typography variant="subtitle2">{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.sensorTypeName} · {s.pinCode} · {s.masterBoardName}
                  </Typography>
                </Paper>
              ))}
            {sensors.filter((x) => boards.map((b) => b.id).includes(x.masterBoardId ?? "")).length === 0 && <Typography color="text.secondary">Không có cảm biến liên kết</Typography>}
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
        <Button variant="contained" color="primary" onClick={onAddBoard}>
          Thêm bảng mạch
        </Button>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(tank)}>
          Xóa bể
        </Button>
      </Box>
    </Box>
  );
}
