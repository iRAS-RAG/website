import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SettingsPowerIcon from "@mui/icons-material/SettingsPower";
import { Box, Button, Divider, Paper, Switch, Typography, alpha, useTheme } from "@mui/material";
import type { ControlDevice } from "../../../types/control-device";

type Props = {
  control: ControlDevice;
  onEdit: (c: ControlDevice) => void;
  onDelete: (c: ControlDevice) => void;
  onToggleState: (c: ControlDevice, newState: boolean) => void;
};

export default function ControlDeviceDetail({ control, onEdit, onDelete, onToggleState }: Props) {
  const theme = useTheme();
  const isOn = control.state ?? false;

  return (
    <Box>
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
          {/* Đưa Loại thiết bị lên làm Tiêu đề chính */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}>
            {control.controlDeviceTypeName || "Thiết bị chưa phân loại"}
          </Typography>

          {/* Pin badge removed from header */}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(control)}>
            Sửa
          </Button>
          <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(control)}>
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
        {/* Card 1: Trạng thái hoạt động (Nổi bật nhất) */}
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            bgcolor: isOn ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.action.disabled, 0.05),
            borderColor: isOn ? "success.light" : "divider",
            gridColumn: { xs: "1 / -1", sm: "1 / 3", md: "1 / 2" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <SettingsPowerIcon color={isOn ? "success" : "action"} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
              TRẠNG THÁI
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" color={isOn ? "success.main" : "text.secondary"} sx={{ fontWeight: 700 }}>
              {isOn ? "ĐANG BẬT" : "ĐANG TẮT"}
            </Typography>
            <Switch checked={isOn} onChange={(e) => onToggleState(control, e.target.checked)} color="success" sx={{ transform: "scale(1.2)" }} />
          </Box>
        </Paper>

        {/* Card 2: Thông số Cổng (Pin) */}
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
            {control.pinCode ?? "—"}
          </Typography>
        </Paper>

        {/* Card 3: Cấu hình Lệnh (Command) */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 0.5,
              }}
            >
              <PowerSettingsNewIcon fontSize="small" color="success" />
              LỆNH BẬT
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                bgcolor: "action.hover",
                p: 0.5,
                px: 1,
                borderRadius: 1,
                display: "inline-block",
                fontWeight: 500,
              }}
            >
              {control.commandOn || "—"}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 0.5,
              }}
            >
              <PowerSettingsNewIcon fontSize="small" color="error" />
              LỆNH TẮT
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                bgcolor: "action.hover",
                p: 0.5,
                px: 1,
                borderRadius: 1,
                display: "inline-block",
                fontWeight: 500,
              }}
            >
              {control.commandOff || "—"}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
