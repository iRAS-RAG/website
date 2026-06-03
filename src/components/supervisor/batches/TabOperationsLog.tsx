import SetMealIcon from "@mui/icons-material/SetMeal";
import { Alert, Box, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { getBatchStages } from "../../../api/batches";
import { extractArray } from "../../../api/client";
import { operatorBatchesApi } from "../../../api/operatorBatchesApi";
import type { Batch, BatchOperationLog, PlannedStage } from "../../../types/batch";
import type { IOperatorFeedingLog, IOperatorMortalityLog } from "../../../types/operatorBatch";
import { getActiveStage } from "../../../utils/stageUtils";

type Props = {
  batch: Batch;
  logs: BatchOperationLog[];
  onCreateLog: (log: Omit<BatchOperationLog, "id" | "batchId" | "createdAt">) => Promise<BatchOperationLog | null>;
};

const TabOperationsLog: React.FC<Props> = ({ batch }) => {
  const [feedingLogs, setFeedingLogs] = useState<IOperatorFeedingLog[]>([]);
  const [mortalityLogs, setMortalityLogs] = useState<IOperatorMortalityLog[]>([]);
  const [plannedStages, setPlannedStages] = useState<PlannedStage[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!batch?.id) return;
      try {
        const [feedRes, mortRes, stagesRes] = await Promise.all([
          operatorBatchesApi.getFeedingLogs(batch.id).catch(() => []),
          operatorBatchesApi.getMortalityLogs(batch.id).catch(() => []),
          getBatchStages(batch.id).catch(() => [] as PlannedStage[]),
        ]);
        if (!mounted) return;
        setFeedingLogs(extractArray(feedRes) as IOperatorFeedingLog[]);
        setMortalityLogs(extractArray(mortRes) as IOperatorMortalityLog[]);
        setPlannedStages(stagesRes);
      } catch (err) {
        console.error("Failed to load operator logs:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [batch?.id]);

  const activeStage = useMemo(() => getActiveStage(plannedStages, batch.stageName), [plannedStages, batch.stageName]);

  // Feeding guidance for the active stage
  const feedingGuidance = useMemo(() => {
    const dailyTargetKg = activeStage?.estimatedDailyFeedKg;
    const dailyFrequency = activeStage?.frequencyPerDay;
    if (dailyTargetKg == null && dailyFrequency == null) return null;

    const todayStart = dayjs().startOf("day");
    const todayLogs = feedingLogs.filter((log) => dayjs(log.createdDate).isAfter(todayStart));
    const todayFeedCount = todayLogs.length;
    const todayFeedAmount = todayLogs.reduce((sum, log) => sum + log.amount, 0);

    const remainingFeedings = dailyFrequency != null ? Math.max(0, dailyFrequency - todayFeedCount) : null;
    const remainingAmount = dailyTargetKg != null ? dailyTargetKg - todayFeedAmount : null;
    const isOverfed = dailyTargetKg != null && todayFeedAmount > dailyTargetKg;

    return { dailyTargetKg, dailyFrequency, todayFeedCount, todayFeedAmount, remainingFeedings, remainingAmount, isOverfed };
  }, [activeStage, feedingLogs]);

  return (
    <Box>
      {/* ── Feeding guidance summary (supervisor view — read-only) ── */}
      {feedingGuidance && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "12px",
            borderColor: feedingGuidance.isOverfed ? "error.main" : "divider",
            bgcolor: feedingGuidance.isOverfed ? "#FEF2F2" : "background.paper",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <SetMealIcon sx={{ color: feedingGuidance.isOverfed ? "error.main" : "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={700} color={feedingGuidance.isOverfed ? "error" : "text.primary"}>
              Hướng dẫn cho ăn hôm nay
            </Typography>
            <Chip label="Giám sát" size="small" variant="outlined" sx={{ ml: 1, fontWeight: 600, fontSize: "0.7rem" }} />
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                Mục tiêu
              </Typography>
              <Typography fontWeight={600}>{feedingGuidance.dailyTargetKg != null ? `${feedingGuidance.dailyTargetKg.toFixed(2)} kg/ngày` : "—"}</Typography>
              <Typography variant="caption" color="text.secondary">
                {feedingGuidance.dailyFrequency != null ? `${feedingGuidance.dailyFrequency} lần/ngày` : ""}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                Đã cho ăn hôm nay
              </Typography>
              <Typography fontWeight={600} color={feedingGuidance.isOverfed ? "error.main" : "text.primary"}>
                {feedingGuidance.todayFeedAmount.toFixed(2)} kg
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {feedingGuidance.todayFeedCount} lần
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>
                Còn lại
              </Typography>
              <Typography
                fontWeight={600}
                color={
                  feedingGuidance.remainingAmount != null && feedingGuidance.remainingAmount < 0
                    ? "error.main"
                    : feedingGuidance.remainingAmount != null && feedingGuidance.remainingAmount > 0
                      ? "success.main"
                      : "text.primary"
                }
              >
                {feedingGuidance.remainingAmount != null
                  ? feedingGuidance.remainingAmount > 0
                    ? `${feedingGuidance.remainingAmount.toFixed(2)} kg`
                    : feedingGuidance.remainingAmount < 0
                      ? `${Math.abs(feedingGuidance.remainingAmount).toFixed(2)} kg vượt mức`
                      : "Đã đạt mục tiêu"
                  : "—"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {feedingGuidance.remainingFeedings != null ? (feedingGuidance.remainingFeedings > 0 ? `Còn ${feedingGuidance.remainingFeedings} lần` : "Đã đủ số lần") : ""}
              </Typography>
            </Box>
          </Box>

          {feedingGuidance.isOverfed && (
            <Alert severity="error" sx={{ mt: 2, fontSize: "0.8rem" }}>
              Vượt quá lượng cám khuyến nghị trong ngày! Cần thông báo cho kỹ thuật viên giảm lượng cho ăn để tránh lãng phí thức ăn và ô nhiễm nước.
            </Alert>
          )}
        </Paper>
      )}

      {/* Feeding History (operator logs) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Lịch sử Dinh dưỡng
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại cám</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Khối lượng
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedingLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    Chưa có dữ liệu.
                  </TableCell>
                </TableRow>
              ) : (
                feedingLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{dayjs(log.createdDate).format("DD/MM/YYYY HH:mm")}</TableCell>
                    <TableCell>
                      <Chip label={log.feedTypeName || "Đang cập nhật..."} size="small" sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.7rem", borderRadius: "6px" }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "success.main" }}>
                      +{log.amount} kg
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mortality History */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Theo dõi Hao hụt
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ngày ghi nhận</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Số lượng chết
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mortalityLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    Chưa có dữ liệu.
                  </TableCell>
                </TableRow>
              ) : (
                mortalityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{dayjs(log.date).format("DD/MM/YYYY HH:mm")}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "error.main" }}>
                      - {log.quantity} {batch.unitOfMeasure}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default TabOperationsLog;
