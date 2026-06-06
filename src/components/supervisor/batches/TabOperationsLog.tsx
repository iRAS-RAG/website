import PsychologyIcon from "@mui/icons-material/Psychology";
import SetMealIcon from "@mui/icons-material/SetMeal";
import { Alert, Box, Button, Chip, CircularProgress, Collapse, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { advisoryApi, type MortalityDiagnosisResponse } from "../../../api/advisory";
import { getBatchStages } from "../../../api/batches";
import { extractArray } from "../../../api/client";
import { operatorBatchesApi } from "../../../api/operatorBatchesApi";
import type { Batch, BatchOperationLog, PlannedStage } from "../../../types/batch";
import type { IOperatorFeedingLog, IOperatorMortalityLog } from "../../../types/operatorBatch";
import { getActiveStage } from "../../../utils/stageUtils";

// --- Định dạng câu trả lời AI ---
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const RAW_URL_RE = /https?:\/\/[^\s)]+/g;

const formatDisplayUrl = (url: string): string => {
  try {
    const lastSegment = url.split("/").pop() || url;
    const filename = lastSegment.split("?")[0].split("#")[0];
    const cleaned = filename.replace(/_[a-z0-9]{6,}(\.[a-z]+)$/i, "$1");
    return decodeURIComponent(cleaned);
  } catch {
    return url;
  }
};

/** Chuyển câu trả lời AI (markdown links, raw URLs, **bold**) thành HTML an toàn */
function formatDiagnosisAnswer(text: string): string {
  if (!text) return "";

  // Bước 1: đánh dấu markdown links [text](url) → placeholder
  const links: Array<{ placeholder: string; display: string; url: string }> = [];
  let counter = 0;
  let processed = text.replace(MD_LINK_RE, (_match, display, url) => {
    const ph = `%%LINK_${counter++}%%`;
    links.push({ placeholder: ph, display, url });
    return ph;
  });

  // Bước 2: escape HTML
  processed = processed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Bước 3: **bold**
  processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Bước 4: bullet
  processed = processed.replace(/^- (.+)$/gm, "• $1");

  // Bước 5: raw URLs còn sót
  processed = processed.replace(RAW_URL_RE, (rawUrl) => {
    if (rawUrl.includes("%%")) return rawUrl;
    const display = formatDisplayUrl(rawUrl);
    return `<a href="${rawUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563EB; font-weight: 500;">${display}</a>`;
  });

  // Bước 6: khôi phục placeholder → <a>
  for (const link of links) {
    processed = processed.replace(link.placeholder, `<a href="${link.url}" target="_blank" rel="noopener noreferrer" style="color: #2563EB; font-weight: 500;">${link.display}</a>`);
  }

  return processed;
}

type Props = {
  batch: Batch;
  logs: BatchOperationLog[];
  onCreateLog: (log: Omit<BatchOperationLog, "id" | "batchId" | "createdAt">) => Promise<BatchOperationLog | null>;
};

// Module-level cache: giữa liệu khi component unmount/remount
const _diagnosisCache = new Map<string, { result: MortalityDiagnosisResponse | null; error: string | null }>();

const TabOperationsLog: React.FC<Props> = ({ batch }) => {
  const [feedingLogs, setFeedingLogs] = useState<IOperatorFeedingLog[]>([]);
  const [mortalityLogs, setMortalityLogs] = useState<IOperatorMortalityLog[]>([]);
  const [plannedStages, setPlannedStages] = useState<PlannedStage[]>([]);

  // ── AI Mortality Diagnosis state ──
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<MortalityDiagnosisResponse | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [diagnosisExpanded, setDiagnosisExpanded] = useState(false);

  const fetchDiagnosis = useCallback(async (tankId: string, batchId: string, cacheResult: boolean) => {
    setDiagnosisLoading(true);
    setDiagnosisError(null);
    setDiagnosisResult(null);
    setDiagnosisExpanded(true);
    try {
      const result = await advisoryApi.diagnoseMortality(tankId, batchId, "last_7d");
      if (cacheResult) {
        _diagnosisCache.set(batchId, { result, error: null });
      }
      setDiagnosisResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể kết nối đến hệ thống AI.";
      if (cacheResult) {
        _diagnosisCache.set(batchId, { result: null, error: msg });
      }
      setDiagnosisError(msg);
    } finally {
      setDiagnosisLoading(false);
    }
  }, []);

  // Tự động chẩn đoán AI khi mở batch mới (dùng cache nếu có)
  useEffect(() => {
    if (!batch?.fishTankId || !batch?.id) return;
    const cached = _diagnosisCache.get(batch.id);
    if (cached) {
      setDiagnosisResult(cached.result);
      setDiagnosisError(cached.error);
      setDiagnosisLoading(false);
      setDiagnosisExpanded(true);
      return;
    }
    fetchDiagnosis(batch.fishTankId, batch.id, true);
  }, [batch?.id, batch?.fishTankId, fetchDiagnosis]);

  const handleDiagnoseMortality = useCallback(async () => {
    if (!batch?.fishTankId || !batch?.id) return;
    // Regenerate: xoá cache cũ, fetch mới, lưu lại cache
    _diagnosisCache.delete(batch.id);
    await fetchDiagnosis(batch.fishTankId, batch.id, true);
  }, [batch.fishTankId, batch.id, fetchDiagnosis]);

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

    return {
      dailyTargetKg,
      dailyFrequency,
      todayFeedCount,
      todayFeedAmount,
      remainingFeedings,
      remainingAmount,
      isOverfed,
    };
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
            <SetMealIcon
              sx={{
                color: feedingGuidance.isOverfed ? "error.main" : "primary.main",
              }}
            />
            <Typography variant="subtitle1" fontWeight={700} color={feedingGuidance.isOverfed ? "error" : "text.primary"}>
              Hướng dẫn cho ăn hôm nay
            </Typography>
            <Chip label="Giám sát" size="small" variant="outlined" sx={{ ml: 1, fontWeight: 600, fontSize: "0.7rem" }} />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "10px",
                }}
              >
                Mục tiêu
              </Typography>
              <Typography fontWeight={600}>{feedingGuidance.dailyTargetKg != null ? `${feedingGuidance.dailyTargetKg.toFixed(2)} kg/ngày` : "—"}</Typography>
              <Typography variant="caption" color="text.secondary">
                {feedingGuidance.dailyFrequency != null ? `${feedingGuidance.dailyFrequency} lần/ngày` : ""}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "10px",
                }}
              >
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
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "10px",
                }}
              >
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
                      <Chip
                        label={log.feedTypeName || "Đang cập nhật..."}
                        size="small"
                        sx={{
                          bgcolor: "#F1F5F9",
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          borderRadius: "6px",
                        }}
                      />
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

      {/* ── AI Mortality Diagnosis ── */}
      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: "12px",
          borderColor: diagnosisResult ? "primary.light" : "divider",
          bgcolor: diagnosisResult ? "#F5F3FF" : "background.paper",
          transition: "background-color 0.2s, border-color 0.2s",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={diagnosisExpanded ? 2 : 0}>
          <PsychologyIcon sx={{ color: "primary.main" }} />
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            AI Chẩn đoán
          </Typography>
          <Chip label="AI" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: "0.7rem" }} />

          <Box sx={{ flexGrow: 1 }} />

          {!diagnosisLoading && !diagnosisExpanded && (
            <Tooltip title={mortalityLogs.length === 0 ? "Chưa có dữ liệu hao hụt để phân tích" : ""}>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PsychologyIcon />}
                  onClick={handleDiagnoseMortality}
                  disabled={mortalityLogs.length === 0}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    px: 2,
                  }}
                >
                  Phân tích nguyên nhân vật nuôi chết
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>

        {/* Collapsed state — show the trigger button below the header */}
        {!diagnosisExpanded && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Yêu cầu AI phân tích dữ liệu cảm biến, lịch sử cho ăn và hao hụt để chẩn đoán nguyên nhân vật nuôi chết.
          </Typography>
        )}

        <Collapse in={diagnosisExpanded}>
          {/* Loading state */}
          {diagnosisLoading && (
            <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                AI đang phân tích dữ liệu cảm biến, lịch sử cho ăn và hao hụt...
              </Typography>
            </Stack>
          )}

          {/* Error state */}
          {diagnosisError && !diagnosisLoading && (
            <Alert
              severity="error"
              sx={{ mt: 1, fontSize: "0.8rem" }}
              action={
                <Button size="small" color="inherit" onClick={handleDiagnoseMortality}>
                  Thử lại
                </Button>
              }
            >
              {diagnosisError}
            </Alert>
          )}

          {/* Result */}
          {diagnosisResult && !diagnosisLoading && (
            <Box>
              <Box
                sx={{
                  maxHeight: 420,
                  overflowY: "auto",
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  fontSize: "0.82rem",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  "& strong": { fontWeight: 700 },
                }}
                dangerouslySetInnerHTML={{
                  __html: formatDiagnosisAnswer(diagnosisResult.answer),
                }}
              />

              {/* Meta footer */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 0.5 }}>
                {diagnosisResult.confidence != null && (
                  <Chip
                    label={`Độ tin cậy: ${Math.round(diagnosisResult.confidence * 100)}%`}
                    size="small"
                    color={diagnosisResult.confidence >= 0.7 ? "success" : diagnosisResult.confidence >= 0.4 ? "warning" : "error"}
                    variant="outlined"
                    sx={{ fontSize: "0.7rem" }}
                  />
                )}
                {diagnosisResult.citations && diagnosisResult.citations.length > 0 && (
                  <Tooltip title={diagnosisResult.citations.join(" • ")} arrow>
                    <Chip
                      label={`${diagnosisResult.citations.length} tài liệu tham khảo`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: "0.7rem",
                        color: "primary.main",
                        cursor: "help",
                      }}
                    />
                  </Tooltip>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <Button size="small" variant="text" onClick={handleDiagnoseMortality} disabled={diagnosisLoading} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                  Phân tích lại
                </Button>
                <IconButton
                  size="small"
                  onClick={() => {
                    setDiagnosisExpanded(false);
                    setDiagnosisResult(null);
                    setDiagnosisError(null);
                  }}
                  sx={{ fontSize: "0.75rem" }}
                >
                  ✕
                </IconButton>
              </Stack>
            </Box>
          )}

          {/* Nothing yet — initial prompt */}
          {!diagnosisResult && !diagnosisLoading && !diagnosisError && diagnosisExpanded && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <PsychologyIcon sx={{ fontSize: 40, color: "action.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                AI sẽ phân tích toàn diện dữ liệu để tìm nguyên nhân vật nuôi chết.
                <br />
                Không cần nhập câu hỏi — chỉ cần nhấn nút bên dưới.
              </Typography>
              <Tooltip title={mortalityLogs.length === 0 ? "Chưa có dữ liệu hao hụt để phân tích" : ""}>
                <span>
                  <Button
                    variant="contained"
                    startIcon={<PsychologyIcon />}
                    onClick={handleDiagnoseMortality}
                    disabled={diagnosisLoading || mortalityLogs.length === 0}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Phân tích nguyên nhân vật nuôi chết
                  </Button>
                </span>
              </Tooltip>
            </Box>
          )}
        </Collapse>
      </Paper>
    </Box>
  );
};

export default TabOperationsLog;
