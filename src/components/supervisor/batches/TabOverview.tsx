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

const TabOverview: React.FC<Props> = ({ batch }) => {
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

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

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

  const initialQty = batch.initialQuantity ?? 0;
  const currentQty = batch.currentQuantity ?? batch.initialQuantity;
  const netChange = (currentQty ?? 0) - (initialQty ?? 0);
  const netPercent = initialQty > 0 ? ((currentQty ?? 0) / initialQty - 1) * 100 : undefined;
  const estimatedSurvivalPct = batch.estimatedHarvestCount != null && initialQty > 0 ? (batch.estimatedHarvestCount / initialQty) * 100 : undefined;

  return (
    <Box>
      {/* Planned stages timeline */}
      {stages && stages.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Kế hoạch
            </Typography>

            <Grid container spacing={2}>
              {[...stages]
                .sort((a, b) => a.sequence - b.sequence)
                .map((s) => {
                  const now = new Date();
                  const parseDate = (d?: string | null) => (d ? new Date(d) : null);
                  const start = parseDate(s.actualStartDate ?? s.estimatedStartDate ?? undefined);
                  const end = parseDate(s.actualEndDate ?? s.estimatedEndDate ?? undefined);
                  const isActive = !!start && (end ? now >= start && now < end : now >= start);

                  return (
                    <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: "100%",
                          ...(isActive ? { border: `1px solid ${theme.palette.success.main}`, backgroundColor: theme.palette.success.light } : {}),
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ color: isActive ? theme.palette.success.dark : undefined }}>
                                {`${s.sequence}. ${s.stageName}`}
                              </Typography>
                              {isActive ? <Chip label="Đang diễn ra" size="small" color="success" /> : null}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {s.expectedDurationDays ? `${s.expectedDurationDays} ngày` : ""}
                            </Typography>
                          </Stack>

                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {`${formatDate(s.estimatedStartDate)} — ${formatDate(s.estimatedEndDate)}`}
                          </Typography>

                          {s.feedTypeNames && s.feedTypeNames.length > 0 ? (
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", alignItems: "center" }}>
                              <Typography variant="caption" color="text.secondary">
                                Loại cám:
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                                {s.feedTypeNames.map((f) => (
                                  <Chip key={f} label={f} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                ))}
                              </Stack>
                            </Stack>
                          ) : null}

                          <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
                            <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                              <Typography variant="caption" color="text.secondary">
                                Dự kiến số lượng: <strong>{s.expectedCount != null ? `${s.expectedCount} con` : "—"}</strong>
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tổng trọng lượng: <strong>{s.expectedTotalWeightKg != null ? `${s.expectedTotalWeightKg.toFixed(2)} kg` : "—"}</strong>
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                              <Typography variant="caption" color="text.secondary">
                                Cám/ngày: <strong>{s.estimatedDailyFeedKg != null ? `${s.estimatedDailyFeedKg.toFixed(2)} kg/ngày` : "—"}</strong>
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tần suất/ngày: <strong>{s.frequencyPerDay ?? "—"} lần</strong>
                              </Typography>
                              {s.amountPer100Fish != null ? (
                                <Typography variant="caption" color="text.secondary">
                                  Số lượng/100: <strong>{s.amountPer100Fish}</strong>
                                </Typography>
                              ) : null}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Chỉ số Sinh học & Hạ tầng */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
          Chỉ số Sinh học & Hạ tầng
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          <KPICard icon={<WaterIcon sx={{ color: theme.palette.primary.main }} />} label="Dung tích bể" value={batch.tankVolume ? `${batch.tankVolume} m³` : "-- m³"} desc={batch.fishTankName || ""} />
          <KPICard icon={<Inventory2OutlinedIcon sx={{ color: theme.palette.secondary.main }} />} label="Số lượng ban đầu" value={`${initialQty} con`} desc="Số lượng lúc thả giống" />
          <KPICard
            icon={<TrendingDownIcon sx={{ color: theme.palette.error.main }} />}
            label="Biến động"
            value={`${netChange >= 0 ? "+" : ""}${netChange} con`}
            desc={netPercent != null ? `${netPercent >= 0 ? "+" : ""}${netPercent.toFixed(1)}% so với ban đầu` : "—"}
          />
          <KPICard
            icon={<SetMealIcon sx={{ color: theme.palette.success.main }} />}
            label="Tỷ lệ sống dự kiến (thu hoạch)"
            value={estimatedSurvivalPct != null ? `${estimatedSurvivalPct.toFixed(1)}%` : "—"}
            desc={batch.estimatedHarvestCount != null ? `Dự kiến số: ${batch.estimatedHarvestCount} con` : ""}
          />
          <KPICard
            icon={<SetMealIcon sx={{ color: theme.palette.success.main }} />}
            label="Dự kiến thu hoạch"
            value={batch.estimatedHarvestCount != null ? `${batch.estimatedHarvestCount} con` : "—"}
            desc={batch.estimatedHarvestWeightKg != null ? `Tổng trọng lượng: ${batch.estimatedHarvestWeightKg.toFixed(2)} kg` : ""}
          />

          <KPICard icon={<SetMealIcon sx={{ color: theme.palette.primary.main }} />} label="FCR" value={batch.fcr != null ? batch.fcr.toFixed(2) : "—"} desc="Hệ số chuyển đổi thức ăn" />
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
