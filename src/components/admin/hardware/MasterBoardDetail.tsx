import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MemoryIcon from "@mui/icons-material/Memory";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import type { ControlDevice } from "../../../types/control-device";
import type { MasterBoard } from "../../../types/masterboard";
import type { Sensor } from "../../../types/sensor";

type Props = {
  board: MasterBoard;
  sensors: Sensor[];
  controls: ControlDevice[];
  onEdit: (b: MasterBoard) => void;
  onDelete: (b: MasterBoard) => void;
  onAddSensor: () => void;
  onAddControl: () => void;
};

export default function MasterBoardDetail({
  board,
  sensors,
  controls,
  onEdit,
  onDelete,
  onAddSensor,
  onAddControl,
}: Props) {
  return (
    <Box>
      {/* Header & Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {board.name}
          </Typography>
          <Chip
            icon={<MemoryIcon fontSize="small" />}
            label="Bảng mạch điều khiển"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={onAddSensor}
            sx={{ boxShadow: "none" }}
          >
            Thêm cảm biến
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddControl}
            sx={{ boxShadow: "none" }}
          >
            Thêm thiết bị ĐK
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(board)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(board)}
          >
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
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
        }}
      >
        {/* Card 1: MAC Address */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 2, height: "fit-content" }}
        >
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
            <SettingsEthernetIcon fontSize="small" />
            ĐỊA CHỈ MAC
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "monospace",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {board.macAddress ?? "—"}
          </Typography>
        </Paper>

        {/* Cột 2: Chứa 2 danh sách thiết bị con */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Card: Cảm biến */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
            >
              <ThermostatIcon color="warning" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Cảm biến liên kết ({sensors.length})
              </Typography>
            </Box>
            {sensors.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {sensors.map((s) => (
                  <Chip
                    key={s.id}
                    label={`${s.name} (Pin ${s.pinCode ?? "-"})`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có cảm biến nào.
              </Typography>
            )}
          </Paper>

          {/* Card: Thiết bị điều khiển */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
            >
              <PowerSettingsNewIcon color="success" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Thiết bị điều khiển ({controls.length})
              </Typography>
            </Box>
            {controls.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {controls.map((c) => (
                  <Chip
                    key={c.id}
                    label={`${c.name} (Pin ${c.pinCode ?? "-"})`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có thiết bị điều khiển nào.
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
