import CodeIcon from "@mui/icons-material/Code";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PinDropIcon from "@mui/icons-material/PinDrop";
import ScaleIcon from "@mui/icons-material/Scale";
import StraightenIcon from "@mui/icons-material/Straighten";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { Box, Button, CircularProgress, Divider, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getSensorType } from "../../../api/sensor-types";
import type { Sensor } from "../../../types/sensor";
import type { SensorType } from "../../../types/sensor-type";

type Props = {
  sensor: Sensor;
  onEdit: (s: Sensor) => void;
  onDelete: (s: Sensor) => void;
};

export default function SensorDetail({ sensor, onEdit, onDelete }: Props) {
  const [sensorType, setSensorType] = useState<SensorType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sensor.sensorTypeId) {
      setSensorType(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const info = await getSensorType(sensor.sensorTypeId!);
        if (!cancelled) setSensorType(info);
      } catch {
        if (!cancelled) setSensorType(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sensor.sensorTypeId]);

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
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}>
            {sensor.sensorTypeName || "Cảm biến chưa phân loại"}
          </Typography>
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
          }}
        >
          {/* Pin */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mb: 1, letterSpacing: 0.5 }}>
              <PinDropIcon fontSize="small" />
              CỔNG KẾT NỐI (PIN)
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
              {sensor.pinCode ?? "—"}
            </Typography>
          </Paper>

          {/* measureType */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mb: 1, letterSpacing: 0.5 }}>
              <ScaleIcon fontSize="small" />
              LOẠI ĐO
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {sensorType?.measureType || "—"}
            </Typography>
          </Paper>

          {/* unitOfMeasure */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mb: 1, letterSpacing: 0.5 }}>
              <StraightenIcon fontSize="small" />
              ĐƠN VỊ ĐO
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {sensorType?.unitOfMeasure || "—"}
            </Typography>
          </Paper>

          {/* code */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mb: 1, letterSpacing: 0.5 }}>
              <CodeIcon fontSize="small" />
              MÃ CODE
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
              {sensorType?.code || "—"}
            </Typography>
          </Paper>

          {/* minPossibleValue / maxPossibleValue */}
          {sensorType?.unitOfMeasure === "0/1" ? (
            <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mb: 1, letterSpacing: 0.5 }}>
                <ToggleOffIcon fontSize="small" />
                NHỊ PHÂN (0 / 1)
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tắt (0) / Bật (1)
              </Typography>
            </Paper>
          ) : (
            <>
              <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mb: 1, letterSpacing: 0.5 }}>
                  <StraightenIcon fontSize="small" />
                  GIÁ TRỊ TỐI THIỂU
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {sensorType ? `${sensorType.minPossibleValue} ${sensorType.unitOfMeasure ?? ""}`.trim() : "—"}
                </Typography>
              </Paper>
              <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mb: 1, letterSpacing: 0.5 }}>
                  <StraightenIcon fontSize="small" />
                  GIÁ TRỊ TỐI ĐA
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {sensorType ? `${sensorType.maxPossibleValue} ${sensorType.unitOfMeasure ?? ""}`.trim() : "—"}
                </Typography>
              </Paper>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
