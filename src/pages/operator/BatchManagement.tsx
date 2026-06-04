import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

// Icons
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchIcon from "@mui/icons-material/Search";
import SetMealIcon from "@mui/icons-material/SetMeal";
import TimelineIcon from "@mui/icons-material/Timeline";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningIcon from "@mui/icons-material/Warning";
import WaterIcon from "@mui/icons-material/Water";
import { OperatorHeader } from "../../components/operator/OperatorHeader";

import { useToast } from "../../components/common/toastContext";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";

// API & HOOK
import { isApiError } from "../../api/client";
import { operatorBatchesApi } from "../../api/operatorBatchesApi";
import { useOperatorBatches } from "../../hooks/useOperatorBatches";
import type { PlannedStage } from "../../types/batch";
import type { IOperatorFarmingBatch } from "../../types/operatorBatch";

const isBatchActive = (status: unknown) =>
  status === 0 || String(status).toLowerCase() === "active";

const getStatusInfo = (
  status: unknown,
): { label: string; color: "success" | "default" | "warning" | "error" } => {
  const s = String(status).toLowerCase();
  if (s === "0" || s === "active")
    return { label: "Đang nuôi", color: "success" };
  if (s === "1" || s === "harvested")
    return { label: "Đã thu hoạch", color: "default" };
  if (s === "2" || s === "paused")
    return { label: "Tạm dừng", color: "warning" };
  return { label: "Đã hủy", color: "error" };
};

const formatStageDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

const BatchManagement = () => {
  const theme = useTheme();
  const toast = useToast();

  const {
    batches,
    selectedBatch,
    setSelectedBatch,
    feedingLogs,
    mortalityLogs,
    feedTypes,
    totalFeed,
    totalDead,
    loading,
    refetch,
    refetchDetails,
    availableFeedTypes,
    plannedStages,
    activeStage,
  } = useOperatorBatches();

  const [tabValue, setTabValue] = useState(0);

  // Left-panel filters
  const [searchText, setSearchText] = useState("");
  const [tankFilter, setTankFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("0"); // default: ACTIVE

  // Date range filters
  const [feedDateFrom, setFeedDateFrom] = useState<Dayjs | null>(null);
  const [feedDateTo, setFeedDateTo] = useState<Dayjs | null>(null);
  const [mortDateFrom, setMortDateFrom] = useState<Dayjs | null>(null);
  const [mortDateTo, setMortDateTo] = useState<Dayjs | null>(null);

  // Feed dialog
  const [openFeedDialog, setOpenFeedDialog] = useState(false);
  const [feedInput, setFeedInput] = useState("");
  const [feedTypeIdInput, setFeedTypeIdInput] = useState("");

  // Mortality dialog
  const [openDeathDialog, setOpenDeathDialog] = useState(false);
  const [deathInput, setDeathInput] = useState("");
  const [deathWeightInput, setDeathWeightInput] = useState("");
  const [mortalityWarning, setMortalityWarning] = useState<string | null>(null);
  const [isSavingMortality, setIsSavingMortality] = useState(false);
  const deathWeightAutoFilled = useRef(false);

  // Auto-validate on quantity change: fetch expectedLostKg and pre-fill weight.
  useEffect(() => {
    const qty = parseInt(deathInput, 10);
    if (!selectedBatch || isNaN(qty) || qty <= 0) return;
    const timer = setTimeout(async () => {
      try {
        const res = await operatorBatchesApi.validateMortality(
          selectedBatch.id,
          qty,
        );
        if (res.expectedLostKg != null && deathWeightAutoFilled.current) {
          setDeathWeightInput(
            Number(res.expectedLostKg.toFixed(10)).toString(),
          );
        }
      } catch {
        // silent — validation is best-effort for the auto-fill hint
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [deathInput, selectedBatch]);

  // Reset tab when batch changes
  useEffect(() => {
    setTabValue(0);
  }, [selectedBatch?.id]);

  // Clear disallowed feed type
  useEffect(() => {
    if (!feedTypeIdInput) return;
    const allowedIds = new Set(
      (availableFeedTypes || []).map((f) => String(f.id)),
    );
    if (!allowedIds.has(feedTypeIdInput)) setFeedTypeIdInput("");
  }, [availableFeedTypes, feedTypeIdInput]);

  // Unique tanks for filter dropdown
  const uniqueTanks = useMemo(() => {
    const seen = new Set<string>();
    return batches
      .filter((b) => {
        if (seen.has(b.fishTankId)) return false;
        seen.add(b.fishTankId);
        return true;
      })
      .map((b) => ({ id: b.fishTankId, name: b.fishTankName }));
  }, [batches]);

  // Normalize status to "0"/"1"/"2"/"3" regardless of API returning number or string
  const normalizeStatus = (s: unknown): string => {
    const v = String(s).toLowerCase();
    if (v === "0" || v === "active") return "0";
    if (v === "1" || v === "harvested") return "1";
    if (v === "2" || v === "paused") return "2";
    return "3";
  };

  // Filtered batch list — active batches always first
  const filteredBatches = useMemo(() => {
    const q = searchText.toLowerCase();
    return batches
      .filter((b) => {
        const matchSearch =
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.fishTankName.toLowerCase().includes(q);
        const matchTank = tankFilter === "all" || b.fishTankId === tankFilter;
        const matchStatus =
          statusFilter === "all" || normalizeStatus(b.status) === statusFilter;
        return matchSearch && matchTank && matchStatus;
      })
      .sort(
        (a, b) =>
          Number(normalizeStatus(a.status)) - Number(normalizeStatus(b.status)),
      );
  }, [batches, searchText, tankFilter, statusFilter]);

  // Date-filtered feeding logs
  const filteredFeedingLogs = useMemo(() => {
    return feedingLogs.filter((log) => {
      const d = dayjs(log.createdDate);
      if (feedDateFrom && d.isBefore(feedDateFrom, "day")) return false;
      if (feedDateTo && d.isAfter(feedDateTo, "day")) return false;
      return true;
    });
  }, [feedingLogs, feedDateFrom, feedDateTo]);

  // Date-filtered mortality logs
  const filteredMortalityLogs = useMemo(() => {
    return mortalityLogs.filter((log) => {
      const d = dayjs(log.date);
      if (mortDateFrom && d.isBefore(mortDateFrom, "day")) return false;
      if (mortDateTo && d.isAfter(mortDateTo, "day")) return false;
      return true;
    });
  }, [mortalityLogs, mortDateFrom, mortDateTo]);

  // Today's feeding guidance
  const feedingGuidance = useMemo(() => {
    const dailyTargetKg = activeStage?.estimatedDailyFeedKg;
    const dailyFrequency = activeStage?.frequencyPerDay;
    if (dailyTargetKg == null && dailyFrequency == null) return null;

    const todayStart = dayjs().startOf("day");
    const todayLogs = feedingLogs.filter((log) =>
      dayjs(log.createdDate).isAfter(todayStart),
    );
    const todayFeedCount = todayLogs.length;
    const todayFeedAmount = todayLogs.reduce((sum, log) => sum + log.amount, 0);

    const remainingFeedings =
      dailyFrequency != null
        ? Math.max(0, dailyFrequency - todayFeedCount)
        : null;
    const remainingAmount =
      dailyTargetKg != null ? dailyTargetKg - todayFeedAmount : null;
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

  // Harvested-state derived values (mirrors supervisor TabOverview logic)
  const isHarvested = selectedBatch
    ? normalizeStatus(selectedBatch.status) === "1"
    : false;
  const initialQty = selectedBatch?.initialQuantity ?? 0;
  const currentQty =
    selectedBatch?.currentQuantity ?? selectedBatch?.initialQuantity ?? 0;
  const netChange = currentQty - initialQty;
  const netPercent =
    initialQty > 0 ? (currentQty / initialQty - 1) * 100 : undefined;
  const estimatedSurvivalPct =
    selectedBatch?.estimatedHarvestCount != null && initialQty > 0
      ? (selectedBatch.estimatedHarvestCount / initialQty) * 100
      : undefined;
  const actualHarvestCount =
    selectedBatch?.actualHarvestCount ?? selectedBatch?.currentQuantity;
  const actualSurvivalPct =
    isHarvested && initialQty > 0 && actualHarvestCount != null
      ? (actualHarvestCount / initialQty) * 100
      : undefined;

  const handleSaveFeeding = async () => {
    if (!feedInput || !feedTypeIdInput) {
      toast.error("Vui lòng nhập khối lượng và chọn loại cám!");
      return;
    }
    if (!selectedBatch) return;
    try {
      await operatorBatchesApi.recordFeeding(
        selectedBatch.id,
        parseFloat(feedInput),
        feedTypeIdInput,
      );
      setOpenFeedDialog(false);
      setFeedInput("");
      setFeedTypeIdInput("");
      refetchDetails();
      toast.success("Ghi nhận cho ăn thành công!");
    } catch (err: unknown) {
      console.error(err);
      if (isApiError(err)) {
        const errorData = err.data as { message?: string };
        toast.error(
          errorData?.message || "Lỗi từ máy chủ khi ghi nhận cho ăn.",
        );
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Có lỗi không xác định xảy ra.");
      }
    }
  };

  const handleSaveMortality = async () => {
    if (!deathInput || !deathWeightInput) {
      toast.error("Vui lòng nhập đầy đủ số lượng (con) và khối lượng (kg)!");
      return;
    }
    if (!selectedBatch) return;

    const quantity = parseInt(deathInput, 10);
    const weight = parseFloat(deathWeightInput);

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Số lượng thiệt hại phải là số nguyên dương!");
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      toast.error("Khối lượng phải là số dương!");
      return;
    }

    setIsSavingMortality(true);
    const date = new Date().toISOString();

    if (mortalityWarning === null) {
      try {
        const validateRes = await operatorBatchesApi.validateMortality(
          selectedBatch.id,
          quantity,
          weight,
          date,
        );
        if (!validateRes.isWithinRange) {
          setMortalityWarning(
            validateRes.message || "Số liệu vượt ngưỡng cho phép.",
          );
          setIsSavingMortality(false);
          return;
        }
      } catch (validateErr) {
        console.warn(
          "Validate mortality bị lỗi, bỏ qua và tiếp tục ghi nhận:",
          validateErr,
        );
      }
    }

    try {
      await operatorBatchesApi.logMortality(
        selectedBatch.id,
        quantity,
        weight,
        date,
      );
      setOpenDeathDialog(false);
      setDeathInput("");
      setDeathWeightInput("");
      setMortalityWarning(null);
      deathWeightAutoFilled.current = false;
      await refetchDetails();
      await refetch();
      toast.success("Báo cáo hao hụt thành công!");
    } catch (err: unknown) {
      console.error(err);
      if (isApiError(err)) {
        const errorData = err.data as { message?: string };
        toast.error(
          errorData?.message || "Lỗi từ máy chủ khi ghi nhận hao hụt.",
        );
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Có lỗi không xác định xảy ra.");
      }
    } finally {
      setIsSavingMortality(false);
    }
  };

  if (loading && batches.length === 0)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <OperatorSidebar />
      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <OperatorHeader />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            p: 3,
            gap: 2,
            height: "100vh",
          }}
        >
          {/* Page heading */}
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Quản lý Vụ nuôi
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
            >
              Theo dõi sinh trưởng, dinh dưỡng và vận hành của từng vụ.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2.5, flexGrow: 1, minHeight: 0 }}>
            {/* LEFT — narrow list + filters */}
            <Box
              sx={{
                flex: "0 0 270px",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                minWidth: 0,
              }}
            >
              {/* Search + filters */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm vụ nuôi..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Bể nuôi</InputLabel>
                    <Select
                      value={tankFilter}
                      label="Bể nuôi"
                      onChange={(e) => setTankFilter(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả bể</MenuItem>
                      {uniqueTanks.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Trạng thái"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="0">Đang nuôi</MenuItem>
                      <MenuItem value="1">Đã thu hoạch</MenuItem>
                      <MenuItem value="2">Tạm dừng</MenuItem>
                      <MenuItem value="3">Đã hủy</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>

              {/* Batch list */}
              <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 0.5 }}>
                <Stack spacing={1}>
                  {filteredBatches.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Không có vụ nuôi nào.
                      </Typography>
                    </Box>
                  ) : (
                    filteredBatches.map((batch) => (
                      <BatchListItem
                        key={batch.id}
                        data={batch}
                        selected={selectedBatch?.id === batch.id}
                        onClick={() => setSelectedBatch(batch)}
                      />
                    ))
                  )}
                </Stack>
              </Box>
            </Box>

            {/* RIGHT — detail panel */}
            {!selectedBatch ? (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    flexGrow: 1,
                    borderRadius: "16px",
                    border: `1px dashed ${theme.palette.divider}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    p: 6,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Inventory2OutlinedIcon
                    sx={{
                      fontSize: 56,
                      color: theme.palette.text.secondary,
                      opacity: 0.4,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: theme.palette.text.primary }}
                  >
                    Chưa có vụ nuôi nào được chọn
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      textAlign: "center",
                      maxWidth: 360,
                    }}
                  >
                    Vui lòng chọn một vụ nuôi ở danh sách bên trái để xem chi
                    tiết, lịch sử cho ăn và ghi nhận hao hụt.
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    flexGrow: 1,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {/* ── Batch info header ── */}
                  <Box
                    sx={{
                      p: 2.5,
                      pb: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      mb={1.5}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        {selectedBatch.name}
                      </Typography>
                      {(() => {
                        const s = getStatusInfo(selectedBatch.status);
                        return (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={s.label}
                            color={s.color}
                            size="small"
                          />
                        );
                      })()}
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          Loài
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedBatch.speciesName || "—"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          Bể nuôi
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedBatch.fishTankName || "—"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          Số lượng hiện tại
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedBatch.currentQuantity ?? 0}{" "}
                          {selectedBatch.unitOfMeasure}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          Số ngày nuôi
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {dayjs().diff(dayjs(selectedBatch.startDate), "day")}{" "}
                          ngày
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          Ngày dự kiến thu hoạch
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedBatch.estimatedHarvestDate
                            ? dayjs(selectedBatch.estimatedHarvestDate).format(
                                "DD-MM-YYYY",
                              )
                            : "—"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* ── Tabs ── */}
                  <Box
                    sx={{
                      px: 2.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                      <Tab
                        label="Tổng quan"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      />
                      <Tab
                        label="Lịch sử cho ăn"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      />
                      <Tab
                        label="Ghi nhận hao hụt"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      />
                    </Tabs>
                  </Box>

                  {/* ── Tab content ── */}
                  <Box sx={{ p: 2.5, flexGrow: 1, overflowY: "auto" }}>
                    {/* TAB TỔNG QUAN */}
                    {tabValue === 0 && (
                      <Stack spacing={3}>
                        {/* Kế hoạch */}
                        {plannedStages && plannedStages.length > 0 && (
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              mb={2}
                              color="text.primary"
                            >
                              Kế hoạch
                            </Typography>
                            <Grid container spacing={2}>
                              {[...plannedStages]
                                .sort((a, b) => a.sequence - b.sequence)
                                .map((s) => {
                                  const now = new Date();
                                  const parseD = (d?: string | null) =>
                                    d ? new Date(d) : null;
                                  const start = parseD(
                                    s.actualStartDate ?? s.estimatedStartDate,
                                  );
                                  const end = parseD(
                                    s.actualEndDate ?? s.estimatedEndDate,
                                  );
                                  const isActive =
                                    !isHarvested &&
                                    !!start &&
                                    (end
                                      ? now >= start && now < end
                                      : now >= start);
                                  return (
                                    <Grid
                                      key={s.id}
                                      size={{ xs: 12, sm: 6, md: 4 }}
                                    >
                                      <StageCard
                                        stage={s}
                                        isActive={isActive}
                                      />
                                    </Grid>
                                  );
                                })}
                            </Grid>
                          </Box>
                        )}

                        {/* KPI cards */}
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            mb={2}
                            color="text.primary"
                          >
                            Chỉ số Sinh học & Hạ tầng
                          </Typography>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              gap: 2,
                            }}
                          >
                            <KPICard
                              icon={
                                <WaterIcon
                                  sx={{ color: theme.palette.primary.main }}
                                />
                              }
                              label="Dung tích bể"
                              value={
                                selectedBatch.tankVolume
                                  ? `${selectedBatch.tankVolume} m³`
                                  : "-- m³"
                              }
                              desc={selectedBatch.fishTankName}
                            />
                            <KPICard
                              icon={
                                <Inventory2OutlinedIcon
                                  sx={{ color: theme.palette.secondary.main }}
                                />
                              }
                              label="Số lượng ban đầu"
                              value={`${initialQty} con`}
                              desc="Số lượng lúc thả giống"
                            />
                            <KPICard
                              icon={
                                <TrendingDownIcon
                                  sx={{ color: theme.palette.error.main }}
                                />
                              }
                              label="Biến động"
                              value={`${netChange >= 0 ? "+" : ""}${netChange} con`}
                              desc={
                                netPercent != null
                                  ? `${netPercent >= 0 ? "+" : ""}${netPercent.toFixed(1)}% so với ban đầu`
                                  : "—"
                              }
                            />
                            <KPICard
                              icon={
                                <SetMealIcon
                                  sx={{ color: theme.palette.success.main }}
                                />
                              }
                              label={
                                isHarvested
                                  ? "Tỷ lệ sống thực tế"
                                  : "Tỷ lệ sống dự kiến (thu hoạch)"
                              }
                              value={
                                isHarvested
                                  ? actualSurvivalPct != null
                                    ? `${actualSurvivalPct.toFixed(1)}%`
                                    : "—"
                                  : estimatedSurvivalPct != null
                                    ? `${estimatedSurvivalPct.toFixed(1)}%`
                                    : "—"
                              }
                              desc={
                                isHarvested
                                  ? actualHarvestCount != null
                                    ? `Thực tế: ${actualHarvestCount} con`
                                    : ""
                                  : selectedBatch.estimatedHarvestCount != null
                                    ? `Dự kiến số: ${selectedBatch.estimatedHarvestCount} con`
                                    : ""
                              }
                            />
                            <KPICard
                              icon={
                                <SetMealIcon
                                  sx={{ color: theme.palette.success.main }}
                                />
                              }
                              label={
                                isHarvested
                                  ? "Kết quả thu hoạch"
                                  : "Dự kiến thu hoạch"
                              }
                              value={
                                isHarvested
                                  ? actualHarvestCount != null
                                    ? `${actualHarvestCount} con`
                                    : "—"
                                  : selectedBatch.estimatedHarvestCount != null
                                    ? `${selectedBatch.estimatedHarvestCount} con`
                                    : "—"
                              }
                              desc={
                                isHarvested
                                  ? selectedBatch.actualHarvestWeightKg != null
                                    ? `Tổng trọng lượng: ${selectedBatch.actualHarvestWeightKg.toFixed(2)} kg`
                                    : ""
                                  : selectedBatch.estimatedHarvestWeightKg !=
                                      null
                                    ? `Tổng trọng lượng: ${selectedBatch.estimatedHarvestWeightKg.toFixed(2)} kg`
                                    : ""
                              }
                            />
                            <KPICard
                              icon={
                                <SetMealIcon
                                  sx={{ color: theme.palette.primary.main }}
                                />
                              }
                              label="FCR"
                              value={
                                selectedBatch.fcr != null
                                  ? selectedBatch.fcr.toFixed(2)
                                  : "—"
                              }
                              desc="Hệ số chuyển đổi thức ăn"
                            />
                            <KPICard
                              icon={
                                <SetMealIcon
                                  sx={{ color: theme.palette.success.main }}
                                />
                              }
                              label="Tổng lượng cám tiêu thụ"
                              value={`${totalFeed.toFixed(1)} kg`}
                              desc="Hiệu suất tiêu thụ"
                            />
                            <KPICard
                              icon={
                                <TrendingDownIcon
                                  sx={{ color: theme.palette.error.main }}
                                />
                              }
                              label="Tổng hao hụt (Vật nuôi chết)"
                              value={`${totalDead} ${selectedBatch.unitOfMeasure}`}
                              desc="Số lượng"
                            />
                          </Box>
                        </Box>
                      </Stack>
                    )}

                    {/* TAB LỊCH SỬ CHO ĂN */}
                    {tabValue === 1 && (
                      <Stack spacing={2}>
                        {/* ── Feeding guidance summary ── */}
                        {feedingGuidance && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: "12px",
                              borderColor: feedingGuidance.isOverfed
                                ? theme.palette.error.main
                                : theme.palette.divider,
                              bgcolor: feedingGuidance.isOverfed
                                ? "#FEF2F2"
                                : theme.palette.background.paper,
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              mb={1.5}
                            >
                              <SetMealIcon
                                sx={{
                                  color: feedingGuidance.isOverfed
                                    ? theme.palette.error.main
                                    : theme.palette.primary.main,
                                }}
                              />
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={
                                  feedingGuidance.isOverfed
                                    ? "error"
                                    : "text.primary"
                                }
                              >
                                Hướng dẫn cho ăn hôm nay
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 2,
                                mb: feedingGuidance.isOverfed ? 1.5 : 0,
                              }}
                            >
                              {/* Target */}
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
                                <Typography variant="body2" fontWeight={600}>
                                  {feedingGuidance.dailyTargetKg != null
                                    ? `${feedingGuidance.dailyTargetKg.toFixed(2)} kg/ngày`
                                    : "—"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {feedingGuidance.dailyFrequency != null
                                    ? `${feedingGuidance.dailyFrequency} lần/ngày`
                                    : ""}
                                </Typography>
                              </Box>

                              {/* Today's progress */}
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
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color={
                                    feedingGuidance.isOverfed
                                      ? "error.main"
                                      : "text.primary"
                                  }
                                >
                                  {feedingGuidance.todayFeedAmount.toFixed(2)}{" "}
                                  kg
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {feedingGuidance.todayFeedCount} lần
                                </Typography>
                              </Box>

                              {/* Remaining */}
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
                                  variant="body2"
                                  fontWeight={600}
                                  color={
                                    feedingGuidance.remainingAmount != null &&
                                    feedingGuidance.remainingAmount < 0
                                      ? "error.main"
                                      : feedingGuidance.remainingAmount !=
                                            null &&
                                          feedingGuidance.remainingAmount > 0
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
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {feedingGuidance.remainingFeedings != null
                                    ? feedingGuidance.remainingFeedings > 0
                                      ? `Còn ${feedingGuidance.remainingFeedings} lần`
                                      : "Đã đủ số lần"
                                    : ""}
                                </Typography>
                              </Box>
                            </Box>

                            {feedingGuidance.isOverfed && (
                              <Alert
                                severity="error"
                                sx={{ fontSize: "0.8rem", mt: 1 }}
                              >
                                Vượt quá lượng cám khuyến nghị trong ngày! Vui
                                lòng giảm lượng cho ăn ở các lần tiếp theo để
                                tránh lãng phí thức ăn và ô nhiễm nước.
                              </Alert>
                            )}
                          </Paper>
                        )}

                        {/* Date range filter */}
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <DatePicker
                            label="Từ ngày"
                            value={feedDateFrom}
                            onChange={(v) => setFeedDateFrom(v)}
                            maxDate={feedDateTo ?? undefined}
                            slotProps={{ textField: { size: "small" } }}
                          />
                          <DatePicker
                            label="Đến ngày"
                            value={feedDateTo}
                            onChange={(v) => setFeedDateTo(v)}
                            minDate={feedDateFrom ?? undefined}
                            slotProps={{ textField: { size: "small" } }}
                          />
                          {(feedDateFrom || feedDateTo) && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setFeedDateFrom(null);
                                setFeedDateTo(null);
                              }}
                            >
                              Xóa lọc
                            </Button>
                          )}
                        </Stack>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="subtitle2" fontWeight={700}>
                            Lịch sử Dinh dưỡng
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenFeedDialog(true)}
                            sx={{ textTransform: "none", boxShadow: "none" }}
                            disabled={!isBatchActive(selectedBatch.status)}
                          >
                            Ghi nhận cho ăn
                          </Button>
                        </Stack>

                        <TableContainer
                          component={Paper}
                          variant="outlined"
                          sx={{ borderRadius: "8px" }}
                        >
                          <Table size="small">
                            <TableHead
                              sx={{ bgcolor: theme.palette.action.hover }}
                            >
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Thời gian
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Loại thức ăn
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Khối lượng
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredFeedingLogs.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={3}
                                    align="center"
                                    sx={{ py: 3, color: "text.secondary" }}
                                  >
                                    Chưa có dữ liệu.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                filteredFeedingLogs.map((log) => (
                                  <TableRow key={log.id}>
                                    <TableCell>
                                      {dayjs(log.createdDate).format(
                                        "DD/MM/YYYY HH:mm",
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={
                                          log.feedTypeName || "Đang cập nhật..."
                                        }
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
                                    <TableCell
                                      align="right"
                                      sx={{
                                        fontWeight: 600,
                                        color: theme.palette.success.main,
                                      }}
                                    >
                                      +{log.amount} kg
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    )}

                    {/* TAB GHI NHẬN HAO HỤT */}
                    {tabValue === 2 && (
                      <Stack spacing={2}>
                        {/* Date range filter */}
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <DatePicker
                            label="Từ ngày"
                            value={mortDateFrom}
                            onChange={(v) => setMortDateFrom(v)}
                            maxDate={mortDateTo ?? undefined}
                            slotProps={{ textField: { size: "small" } }}
                          />
                          <DatePicker
                            label="Đến ngày"
                            value={mortDateTo}
                            onChange={(v) => setMortDateTo(v)}
                            minDate={mortDateFrom ?? undefined}
                            slotProps={{ textField: { size: "small" } }}
                          />
                          {(mortDateFrom || mortDateTo) && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setMortDateFrom(null);
                                setMortDateTo(null);
                              }}
                            >
                              Xóa lọc
                            </Button>
                          )}
                        </Stack>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="subtitle2" fontWeight={700}>
                            Theo dõi Hao hụt
                          </Typography>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<WarningIcon />}
                            onClick={() => setOpenDeathDialog(true)}
                            sx={{ textTransform: "none", boxShadow: "none" }}
                            disabled={!isBatchActive(selectedBatch.status)}
                          >
                            Báo cáo vật nuôi chết
                          </Button>
                        </Stack>

                        <TableContainer
                          component={Paper}
                          variant="outlined"
                          sx={{ borderRadius: "8px" }}
                        >
                          <Table size="small">
                            <TableHead
                              sx={{ bgcolor: theme.palette.action.hover }}
                            >
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Ngày ghi nhận
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Số lượng (con)
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Khối lượng (kg)
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredMortalityLogs.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={3}
                                    align="center"
                                    sx={{ py: 3, color: "text.secondary" }}
                                  >
                                    Chưa có dữ liệu.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                filteredMortalityLogs.map((log) => (
                                  <TableRow key={log.id}>
                                    <TableCell>
                                      {dayjs(log.date).format(
                                        "DD/MM/YYYY HH:mm",
                                      )}
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{
                                        fontWeight: 600,
                                        color: theme.palette.error.main,
                                      }}
                                    >
                                      -{log.quantity} con
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{
                                        fontWeight: 600,
                                        color: theme.palette.error.main,
                                      }}
                                    >
                                      {log.lostWeightKg != null
                                        ? `${log.lostWeightKg} kg`
                                        : "—"}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    )}
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* DIALOG CHO ĂN */}
      <Dialog
        open={openFeedDialog}
        onClose={() => setOpenFeedDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Ghi nhận cho ăn</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}
        >
          <FormControl fullWidth size="small">
            <InputLabel>Loại cám</InputLabel>
            <Select
              value={feedTypeIdInput}
              label="Loại cám"
              onChange={(e) => setFeedTypeIdInput(e.target.value)}
            >
              {availableFeedTypes.length === 0 ? (
                feedTypes.length === 0 ? (
                  <MenuItem disabled value="">
                    Đang tải dữ liệu...
                  </MenuItem>
                ) : (
                  <MenuItem disabled value="">
                    Không có loại cám phù hợp cho giai đoạn hiện tại
                  </MenuItem>
                )
              ) : (
                availableFeedTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name} ({type.proteinPercentage}% Đạm)
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Khối lượng cám"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            value={feedInput}
            onChange={(e) => setFeedInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFeedDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSaveFeeding}
            sx={{ boxShadow: "none" }}
          >
            Lưu dữ liệu
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG CÁ CHẾT */}
      <Dialog
        open={openDeathDialog}
        onClose={() => {
          setOpenDeathDialog(false);
          setDeathInput("");
          setDeathWeightInput("");
          setMortalityWarning(null);
          deathWeightAutoFilled.current = false;
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.error.main }}>
          Báo cáo hao hụt (Thiệt hại)
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            label="Số lượng thiệt hại"
            type="number"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">con</InputAdornment>
                ),
              },
            }}
            value={deathInput}
            onChange={(e) => {
              setDeathInput(e.target.value);
              deathWeightAutoFilled.current = true;
              setMortalityWarning(null);
            }}
          />
          <TextField
            fullWidth
            size="small"
            label="Khối lượng thiệt hại"
            type="number"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">kg</InputAdornment>
                ),
              },
            }}
            value={deathWeightInput}
            onChange={(e) => {
              setDeathWeightInput(e.target.value);
              deathWeightAutoFilled.current = false;
              setMortalityWarning(null);
            }}
          />
          {mortalityWarning && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                p: 1.5,
                borderRadius: "8px",
                bgcolor: "#FFF7ED",
                border: "1px solid #FDBA74",
              }}
            >
              <ErrorOutlineIcon
                sx={{ color: "#F97316", fontSize: 20, flexShrink: 0, mt: 0.1 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#C2410C", display: "block" }}
                >
                  Cảnh báo vượt ngưỡng
                </Typography>
                <Typography variant="caption" sx={{ color: "#9A3412" }}>
                  {mortalityWarning}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#9A3412", display: "block", mt: 0.5 }}
                >
                  Bấm &quot;Xác nhận &amp; Lưu&quot; để tiếp tục ghi nhận.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenDeathDialog(false);
              setDeathInput("");
              setDeathWeightInput("");
              setMortalityWarning(null);
            }}
            sx={{ color: theme.palette.text.secondary }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSaveMortality}
            disabled={isSavingMortality}
            startIcon={mortalityWarning ? <WarningIcon /> : undefined}
            sx={{ boxShadow: "none" }}
          >
            {isSavingMortality
              ? "Đang xử lý..."
              : mortalityWarning
                ? "Xác nhận & Lưu"
                : "Lưu báo cáo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const StageCard = ({
  stage: s,
  isActive,
}: {
  stage: PlannedStage;
  isActive: boolean;
}) => {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        ...(isActive
          ? {
              border: `1px solid ${theme.palette.success.main}`,
              backgroundColor: theme.palette.success.light,
            }
          : {}),
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ color: isActive ? theme.palette.success.dark : undefined }}
            >
              {`${s.sequence}. ${s.stageName}`}
            </Typography>
            {isActive ? (
              <Chip label="Đang diễn ra" size="small" color="success" />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {s.expectedDurationDays ? `${s.expectedDurationDays} ngày` : ""}
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {`${formatStageDate(s.estimatedStartDate)} — ${formatStageDate(s.estimatedEndDate)}`}
        </Typography>

        {s.feedTypeNames && s.feedTypeNames.length > 0 ? (
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1, flexWrap: "wrap", alignItems: "center" }}
          >
            <Typography variant="caption" color="text.secondary">
              Loại cám:
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
              {s.feedTypeNames.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Stack>
          </Stack>
        ) : null}

        <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <Typography variant="caption" color="text.secondary">
              Dự kiến số lượng:{" "}
              <strong>
                {s.expectedCount != null ? `${s.expectedCount} con` : "—"}
              </strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tổng trọng lượng:{" "}
              <strong>
                {s.expectedTotalWeightKg != null
                  ? `${s.expectedTotalWeightKg.toFixed(2)} kg`
                  : "—"}
              </strong>
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <Typography variant="caption" color="text.secondary">
              Cám/ngày:{" "}
              <strong>
                {s.estimatedDailyFeedKg != null
                  ? `${s.estimatedDailyFeedKg.toFixed(2)} kg/ngày`
                  : "—"}
              </strong>
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
  );
};

const BatchListItem = ({
  data,
  selected,
  onClick,
}: {
  data: IOperatorFarmingBatch;
  selected: boolean;
  onClick: () => void;
}) => {
  const theme = useTheme();
  const { label, color } = getStatusInfo(data.status);

  const colorMap: Record<string, { bg: string; text: string }> = {
    success: {
      bg: theme.palette.success.light,
      text: theme.palette.success.main,
    },
    default: {
      bg: theme.palette.action.selected,
      text: theme.palette.text.secondary,
    },
    warning: {
      bg: theme.palette.warning.light,
      text: theme.palette.warning.main,
    },
    error: { bg: theme.palette.error.light, text: theme.palette.error.main },
  };
  const { bg: statusBg, text: statusColor } =
    colorMap[color] ?? colorMap["default"];

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: "10px",
        border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.08)
          : theme.palette.background.paper,
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": { borderColor: theme.palette.primary.main },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        mb={1}
        alignItems="flex-start"
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: "0.85rem",
            color: theme.palette.text.primary,
            lineHeight: 1.3,
            pr: 1,
          }}
        >
          {data.name}
        </Typography>
        <Chip
          label={label}
          size="small"
          sx={{
            bgcolor: statusBg,
            color: statusColor,
            fontWeight: 600,
            fontSize: "0.62rem",
            height: 18,
            borderRadius: "5px",
            flexShrink: 0,
          }}
        />
      </Stack>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontWeight: 600,
          display: "block",
          mb: 0.5,
        }}
      >
        {data.fishTankName}
      </Typography>
      <Stack spacing={0.25}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <SetMealIcon
            sx={{ fontSize: 13, color: theme.palette.text.secondary }}
          />
          <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
            {data.speciesName}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <TimelineIcon
            sx={{ fontSize: 13, color: theme.palette.text.secondary }}
          />
          <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
            {data.stageName}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

const KPICard = ({
  icon,
  label,
  value,
  desc,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  desc: string;
}) => {
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
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: theme.palette.text.primary }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
      >
        {desc}
      </Typography>
    </Paper>
  );
};

export default BatchManagement;
