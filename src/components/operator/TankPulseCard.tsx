import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import WaterIcon from "@mui/icons-material/Water";
import InventoryIcon from "@mui/icons-material/Inventory";
import { getTankLatestData } from "../../api/tanks";
import type { ILatestSensorData } from "../../types/realtime";
import type { Batch } from "../../types/batch";

interface TankPulseCardProps {
  tankId: string;
  tankName: string;
  batch?: Batch;
  onClick?: () => void;
}

type HealthLevel = "ok" | "warning" | "unknown";

const healthMeta: Record<HealthLevel, { color: string; label: string }> = {
  ok: { color: "#10B981", label: "Bình thường" },
  warning: { color: "#F59E0B", label: "Cần chú ý" },
  unknown: { color: "#94A3B8", label: "Chưa có dữ liệu" },
};

function calcHealth(data: ILatestSensorData[]): HealthLevel {
  if (!data || data.length === 0) return "unknown";
  const anyWarn = data.some((s) => s.latestData?.isWarning === true);
  if (anyWarn) return "warning";
  const anyData = data.some((s) => s.latestData);
  return anyData ? "ok" : "unknown";
}

function daysBetween(from: string, to: Date = new Date()): number {
  if (!from) return 0;
  const start = new Date(from).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((to.getTime() - start) / (1000 * 60 * 60 * 24)));
}

export const TankPulseCard = ({
  tankId,
  tankName,
  batch,
  onClick,
}: TankPulseCardProps) => {
  const [sensors, setSensors] = useState<ILatestSensorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await getTankLatestData(tankId);
        if (!mounted) return;
        setSensors(Array.isArray(res) ? res : []);
      } catch {
        if (mounted) setSensors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [tankId]);

  const health = calcHealth(sensors);
  const meta = healthMeta[health];
  const visibleSensors = sensors.slice(0, 4);
  const ageDays = batch?.startDate ? daysBetween(batch.startDate) : null;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: "14px",
        border: "1px solid #E2E8F0",
        borderLeft: `4px solid ${meta.color}`,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        height: "100%",
        bgcolor: "#fff",
        "&:hover": onClick
          ? { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }
          : undefined,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <WaterIcon sx={{ color: "#2A85FF", fontSize: 20 }} />
          <Typography fontWeight={700} sx={{ color: "#0F172A" }}>
            {tankName}
          </Typography>
        </Stack>
        <Chip
          size="small"
          label={meta.label}
          sx={{
            bgcolor: `${meta.color}15`,
            color: meta.color,
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 22,
          }}
        />
      </Stack>

      {batch ? (
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <InventoryIcon sx={{ color: "#10B981", fontSize: 16 }} />
          <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>
            {batch.name}
          </Typography>
          {ageDays !== null && (
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              • Ngày {ageDays}
            </Typography>
          )}
        </Stack>
      ) : (
        <Typography variant="caption" sx={{ color: "#94A3B8", display: "block", mb: 1.5 }}>
          Chưa có lứa nuôi đang hoạt động
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <CircularProgress size={18} />
        </Box>
      ) : visibleSensors.length === 0 ? (
        <Typography variant="caption" sx={{ color: "#94A3B8" }}>
          Chưa có dữ liệu cảm biến
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
          }}
        >
          {visibleSensors.map((s) => {
            const v = s.latestData?.latestAvg;
            const warn = s.latestData?.isWarning;
            return (
              <Box
                key={s.sensorId}
                sx={{
                  p: 1,
                  borderRadius: "8px",
                  bgcolor: warn ? "#FEF3C7" : "#F8FAFC",
                  border: warn ? "1px solid #FCD34D" : "1px solid transparent",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#64748B", display: "block", fontSize: "0.65rem" }}
                >
                  {s.sensorTypeName || s.sensorName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: warn ? "#B45309" : "#0F172A",
                  }}
                >
                  {typeof v === "number" ? v.toFixed(1) : "—"}{" "}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ color: "#94A3B8", fontWeight: 500 }}
                  >
                    {s.unitOfMeasure}
                  </Typography>
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default TankPulseCard;
