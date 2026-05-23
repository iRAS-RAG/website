import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SetMealIcon from "@mui/icons-material/SetMeal";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WaterIcon from "@mui/icons-material/Water";
import { Box, Card, CardContent, Chip, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState, type ReactNode } from "react";
import { getBatchStages } from "../../../api/batches";
import { extractArray } from "../../../api/client";
import { operatorBatchesApi } from "../../../api/operatorBatchesApi";
import type { Batch, BatchPerformance, PlannedStage } from "../../../types/batch";
import type { IOperatorFeedingLog, IOperatorMortalityLog } from "../../../types/operatorBatch";

type Props = {
  batch: Batch;
  performance: BatchPerformance[];
  onLoadPerformance: (days: number) => void;
};

const TabOverview: React.FC<Props> = ({ batch, performance }) => {
  // Calculate some basic metrics
  const currentStock = batch.currentQuantity ?? batch.initialQuantity;
  // Note: Biomass requires weight data which is not currently available
  // const estimatedBiomass = (currentStock * avgWeight) / 1000;

  const [stages, setStages] = useState<PlannedStage[] | undefined>(batch.plannedStages);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getBatchStages(batch.id);
        if (!mounted) return;
        setStages(data && data.length > 0 ? data : batch.plannedStages);
      } catch (error) {
        console.error("Failed to load batch stages:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [batch.id, batch.plannedStages]);

  const theme = useTheme();

  // Date formatter (dd-mm-yyyy) and chart data
  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  // KPI data (fetch feeding/mortality logs similar to operator view)
  const [totalFeed, setTotalFeed] = useState<number>(0);
  const [totalDead, setTotalDead] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [feedRes, mortRes] = await Promise.all([operatorBatchesApi.getFeedingLogs(batch.id).catch(() => []), operatorBatchesApi.getMortalityLogs(batch.id).catch(() => [])]);
        if (!mounted) return;
        const feeds = extractArray(feedRes) as IOperatorFeedingLog[];
        const morts = extractArray(mortRes) as IOperatorMortalityLog[];
        const feedSum = feeds.reduce((s: number, f: IOperatorFeedingLog) => s + (Number(f.amount) || 0), 0);
        const mortSum = morts.reduce((s: number, m: IOperatorMortalityLog) => s + (Number(m.quantity) || 0), 0);
        setTotalFeed(Number(feedSum));
        setTotalDead(Number(mortSum));
      } catch (err) {
        console.error("Failed to load operator logs:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [batch.id]);

  const survivalRateDisplay = batch.survivalRate ? `${batch.survivalRate.toFixed(1)}%` : "—";

  return (
    <Box>
      {/* Planned stages timeline */}
      {stages && stages.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Kế hoạch giai đoạn
            </Typography>
            <Grid container spacing={2}>
              {[...stages]
                .sort((a, b) => a.sequence - b.sequence)
                .map((s) => (
                  <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={600}>
                            {`${s.sequence}. ${s.stageName}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.expectedDurationDays ? `${s.expectedDurationDays} ngày` : ""}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {`${formatDate(s.estimatedStartDate)} — ${formatDate(s.estimatedEndDate)}`}
                        </Typography>

                        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap" }}>
                          {s.feedTypeNames && s.feedTypeNames.length > 0 ? s.feedTypeNames.map((f) => <Chip key={f} label={f} size="small" sx={{ mr: 0.5, mb: 0.5 }} />) : null}
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 1, gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                          <Typography variant="caption" color="text.secondary">
                            Số lượng/100: <strong>{s.amountPer100Fish ?? "—"}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tần suất/ngày: <strong>{s.frequencyPerDay ?? "—"}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Mật độ tối đa: <strong>{s.maxStockingDensity ?? "—"}</strong>
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      )}
      {/* Chỉ số Sinh học & Hạ tầng */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
          Chỉ số Sinh học & Hạ tầng
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          <KPICard icon={<WaterIcon sx={{ color: theme.palette.primary.main }} />} label="Dung tích bể" value={batch.tankVolume ? `${batch.tankVolume} m³` : "-- m³"} desc={batch.fishTankName || ""} />
          <KPICard
            icon={<Inventory2OutlinedIcon sx={{ color: theme.palette.secondary.main }} />}
            label="Số lượng hiện tại / Ban đầu"
            value={`${currentStock} / ${batch.initialQuantity}`}
            desc={`Tỷ lệ sống: ${survivalRateDisplay}`}
          />
          <KPICard icon={<SetMealIcon sx={{ color: theme.palette.success.main }} />} label="Tổng lượng cám tiêu thụ" value={`${totalFeed.toFixed(1)} kg`} desc="Hiệu suất tiêu thụ" />
          <KPICard icon={<TrendingDownIcon sx={{ color: theme.palette.error.main }} />} label="Tổng hao hụt (Cá chết)" value={`${totalDead} ${batch.unitOfMeasure}`} desc="Số lượng" />
        </Box>
      </Box>
    </Box>
  );
};

const KPICard = ({ icon, label, value, desc }: { icon: ReactNode; label: string; value: string; desc: string }) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon}
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
        {desc}
      </Typography>
    </Paper>
  );
};

export default TabOverview;
