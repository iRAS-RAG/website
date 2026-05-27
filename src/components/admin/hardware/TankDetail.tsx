// AddIcon intentionally removed: adding new masterboards per-tank disabled
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HeightIcon from "@mui/icons-material/Height";
import MemoryIcon from "@mui/icons-material/Memory";
import OpacityIcon from "@mui/icons-material/Opacity";
import ScienceIcon from "@mui/icons-material/Science";
import StraightenIcon from "@mui/icons-material/Straighten";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { Box, Button, Chip, Divider, Paper, Typography, alpha, useTheme } from "@mui/material";
import type { MasterBoard } from "../../../types/masterboard";
import type { Sensor } from "../../../types/sensor";
import type { Tank } from "../../../types/tank";

type Props = {
  tank: Tank;
  boards: MasterBoard[];
  sensors: Sensor[];
  onEdit: (t: Tank) => void;
  onDelete: (t: Tank) => void;
};

// Hàm helper tự động chọn Icon phù hợp dựa trên Tên loại cảm biến
const getSensorIcon = (typeName?: string) => {
  const t = typeName?.toLowerCase() || "";
  if (t.includes("nhiệt độ")) return <ThermostatIcon color="error" />;
  if (t.includes("ph")) return <ScienceIcon color="success" />;
  if (t.includes("oxy") || t.includes("tds")) return <OpacityIcon color="primary" />;
  return <ThermostatIcon color="action" />;
};

export default function TankDetail({ tank, boards, sensors, onEdit, onDelete }: Props) {
  const theme = useTheme();

  // Tính thể tích dựa trên bán kính (m) và mức nước (m): V = π * r^2 * h
  const volumeM3 = typeof tank.radius === "number" && typeof tank.height === "number" ? Math.PI * tank.radius * tank.radius * tank.height : undefined;

  // Lọc ra danh sách các cảm biến thuộc về bể cá này
  const tankSensors = sensors.filter((s) => boards.some((b) => b.id === s.masterBoardId));

  return (
    <Box>
      {/* Header: only action buttons (stats shown in THÔNG SỐ KỸ THUẬT below) */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1, mb: 2 }}>
        <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(tank)}>
          Sửa
        </Button>
        <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(tank)}>
          Xóa
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Grid Thông tin Bể: Phân lớp Identity và Tech Specs */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          mb: 3,
        }}
      >
        {/* Removed ĐỊNH DANH panel per request (no tank/farm name shown) */}

        {/* Nhóm 2: Thông số kỹ thuật */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2, gridColumn: "1 / -1" }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              letterSpacing: 0.5,
              mb: 2,
              display: "block",
            }}
          >
            THÔNG SỐ KỸ THUẬT
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(160px, 1fr))" },
              gap: 3,
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <HeightIcon fontSize="small" /> MỨC NƯỚC (m)
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
                {typeof tank.height === "number" ? `${tank.height} m` : "—"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <StraightenIcon fontSize="small" /> BÁN KÍNH (m)
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
                {typeof tank.radius === "number" ? `${tank.radius} m` : "—"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <OpacityIcon fontSize="small" /> THỂ TÍCH
              </Typography>
              {volumeM3 != null ? (
                <>
                  <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
                    {`${volumeM3.toFixed(3)} m³`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`(${Math.round(volumeM3 * 1000)} L)`}
                  </Typography>
                </>
              ) : (
                <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
                  —
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Layering: Danh sách cảm biến nhóm theo Bảng mạch */}
      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            Cảm biến liên kết ({tankSensors.length})
          </Typography>
        </Box>
        <Box sx={{ p: 0 }}>
          {boards.length === 0 ? (
            <Typography sx={{ p: 2 }} color="text.secondary">
              Bể này chưa có bảng mạch nào.
            </Typography>
          ) : (
            boards.map((board, index) => {
              const bSensors = tankSensors.filter((s) => s.masterBoardId === board.id);
              return (
                <Box
                  key={board.id}
                  sx={{
                    borderBottom: index < boards.length - 1 ? 1 : 0,
                    borderColor: "divider",
                    p: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <MemoryIcon fontSize="small" /> {board.name}
                  </Typography>

                  {bSensors.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 3.5 }}>
                      Chưa có cảm biến kết nối.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "grid", gap: 1, pl: { xs: 1, sm: 3 } }}>
                      {bSensors.map((s) => (
                        <Box
                          key={s.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1.5,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "background.paper",
                          }}
                        >
                          {/* Left: Icon + Text (ĐÃ ĐƯỢC CẬP NHẬT ƯU TIÊN LOẠI THIẾT BỊ) */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                p: 1,
                                borderRadius: 1,
                                bgcolor: "action.hover",
                              }}
                            >
                              {getSensorIcon(s.sensorTypeName)}
                            </Box>
                            <Box>
                              {/* Loại cảm biến được đẩy lên làm Text chính, in đậm */}
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "0.88rem",
                                  color: "text.primary",
                                }}
                              >
                                {s.sensorTypeName || "Cảm biến chưa phân loại"}
                              </Typography>
                              {/* Tên định danh bị hạ cấp xuống Text phụ */}
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                  fontWeight: 500,
                                }}
                              >
                                {s.name}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Right: Badge cho Pin (Giữ nguyên) */}
                          <Chip
                            label={`Pin: ${s.pinCode ?? "-"}`}
                            size="small"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 600,
                              bgcolor: "action.hover",
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Paper>
    </Box>
  );
}
