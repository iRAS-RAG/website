import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
import dayjs from "dayjs";
import { useState, type ReactNode } from "react";

// Icons
import AddIcon from "@mui/icons-material/Add";
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
import type { IOperatorFarmingBatch } from "../../types/operatorBatch";

const isBatchActive = (status: unknown) => {
  return status === 0 || String(status).toLowerCase() === "active";
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
  } = useOperatorBatches();

  const [tabValue, setTabValue] = useState(0);

  const [openFeedDialog, setOpenFeedDialog] = useState(false);
  const [feedInput, setFeedInput] = useState("");
  const [feedTypeIdInput, setFeedTypeIdInput] = useState("");

  const [openDeathDialog, setOpenDeathDialog] = useState(false);
  const [deathInput, setDeathInput] = useState("");
  const [deathWeightInput, setDeathWeightInput] = useState("");
  // null = chưa validate; string = có cảnh báo vượt ngưỡng
  const [mortalityWarning, setMortalityWarning] = useState<string | null>(null);
  const [isSavingMortality, setIsSavingMortality] = useState(false);

  const handleSaveFeeding = async () => {
    if (!feedInput || !feedTypeIdInput) {
      toast.error("Vui lòng nhập khối lượng và chọn loại thức ăn!");
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

  /**
   * Bước 1: validate rồi cảnh báo (nếu vượt ngưỡng).
   * Bước 2: nếu đã xác nhận cảnh báo (mortalityWarning !== null), ghi thẳng.
   */
  const handleSaveMortality = async () => {
    if (!deathInput || !deathWeightInput) {
      toast.error("Vui lòng nhập đầy đủ số lượng (con) và khối lượng (kg)!");
      return;
    }
    if (!selectedBatch) return;

    const quantity = parseInt(deathInput, 10);
    const weight = parseFloat(deathWeightInput);

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Số lượng cá chết phải là số nguyên dương!");
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      toast.error("Khối lượng phải là số dương!");
      return;
    }

    setIsSavingMortality(true);
    const date = new Date().toISOString();

    // ── Bước 1: Validate (best-effort) ───────────────────────────────────────
    // Nếu chưa có cảnh báo đang chờ xác nhận → thử validate trước.
    // Nếu validate gặp lỗi (400, 500, network…), bỏ qua và ghi nhận bình thường.
    if (mortalityWarning === null) {
      try {
        const validateRes = await operatorBatchesApi.validateMortality(
          selectedBatch.id,
          quantity,
          weight,
          date,
        );

        if (!validateRes.isWithinRange) {
          // Lưu cảnh báo → operator thấy, bấm lần 2 để xác nhận
          setMortalityWarning(
            validateRes.message || "Số liệu vượt ngưỡng cho phép.",
          );
          setIsSavingMortality(false);
          return; // dừng lại, chờ người dùng xác nhận
        }
        // isWithinRange=true → tiếp tục ghi nhận bình thường bên dưới
      } catch (validateErr) {
        // Validate thất bại (400/500/network) → coi như không có ngưỡng cần kiểm tra,
        // vẫn cho phép ghi nhận. Log để debug nhưng KHÔNG hiện toast lỗi ở đây.
        console.warn(
          "Validate mortality bị lỗi, bỏ qua và tiếp tục ghi nhận:",
          validateErr,
        );
      }
    }

    // ── Bước 2: Ghi nhận thực tế ─────────────────────────────────────────────
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
            gap: 3,
            height: "100vh",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                Quản lý Lô nuôi
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
              >
                Theo dõi sinh trưởng, dinh dưỡng và vận hành của từng lô.
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: "flex", gap: 3, flexGrow: 1, minHeight: 0 }}>
            {/* CỘT DANH SÁCH BÊN TRÁI */}
            <Box
              sx={{
                flex: 3.5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 320,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm lô nuôi..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Paper>
              <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
                <Stack spacing={2}>
                  {batches.map((batch) => (
                    <BatchListItem
                      key={batch.id}
                      data={batch}
                      selected={selectedBatch?.id === batch.id}
                      onClick={() => setSelectedBatch(batch)}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* CỘT CHI TIẾT BÊN PHẢI — placeholder khi chưa chọn lô */}
            {!selectedBatch && (
              <Box
                sx={{
                  flex: 6.5,
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
                    Chưa có lô nào được chọn
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      textAlign: "center",
                      maxWidth: 360,
                    }}
                  >
                    Vui lòng chọn một lô nuôi ở danh sách bên trái để xem chi
                    tiết, lịch sử cho ăn và ghi nhận hao hụt.
                  </Typography>
                </Paper>
              </Box>
            )}
            {selectedBatch && (
              <Box sx={{ flex: 6.5, display: "flex", flexDirection: "column" }}>
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
                  <Box
                    sx={{
                      p: 3,
                      pb: 0,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {selectedBatch.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          Ngày thả giống:{" "}
                          {dayjs(selectedBatch.startDate).format("DD/MM/YYYY")}
                        </Typography>
                      </Box>
                    </Stack>

                    <Tabs
                      value={tabValue}
                      onChange={(_, v) => setTabValue(v)}
                      sx={{ mt: 2 }}
                    >
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

                  <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto" }}>
                    {/* TAB TỔNG QUAN */}
                    {tabValue === 0 && (
                      <Stack spacing={4}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              mb: 2,
                              color: theme.palette.text.primary,
                            }}
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
                            {/* Initial / Current / Net / Estimated Survival */}
                            <KPICard
                              icon={
                                <Inventory2OutlinedIcon
                                  sx={{ color: theme.palette.secondary.main }}
                                />
                              }
                              label="Số lượng ban đầu"
                              value={`${selectedBatch.initialQuantity ?? 0}`}
                              desc="Số lượng lúc thả giống"
                            />
                            <KPICard
                              icon={
                                <Inventory2OutlinedIcon
                                  sx={{ color: theme.palette.secondary.main }}
                                />
                              }
                              label="Số lượng hiện tại"
                              value={`${selectedBatch.currentQuantity ?? 0}`}
                              desc={`Đơn vị: ${selectedBatch.unitOfMeasure}`}
                            />
                            <KPICard
                              icon={
                                <TrendingDownIcon
                                  sx={{ color: theme.palette.error.main }}
                                />
                              }
                              label="Biến động"
                              value={`${(selectedBatch.currentQuantity ?? 0) - (selectedBatch.initialQuantity ?? 0) >= 0 ? "+" : ""}${(selectedBatch.currentQuantity ?? 0) - (selectedBatch.initialQuantity ?? 0)}`}
                              desc={
                                selectedBatch.initialQuantity &&
                                selectedBatch.initialQuantity > 0
                                  ? `${(((selectedBatch.currentQuantity ?? 0) / selectedBatch.initialQuantity - 1) * 100).toFixed(1)}% so với ban đầu`
                                  : "—"
                              }
                            />
                            <KPICard
                              icon={
                                <SetMealIcon
                                  sx={{ color: theme.palette.success.main }}
                                />
                              }
                              label="Tỷ lệ sống dự kiến (thu hoạch)"
                              value={
                                selectedBatch.estimatedHarvestCount != null &&
                                selectedBatch.initialQuantity
                                  ? `${((selectedBatch.estimatedHarvestCount / selectedBatch.initialQuantity) * 100).toFixed(1)}%`
                                  : "—"
                              }
                              desc={
                                selectedBatch.estimatedHarvestCount != null
                                  ? `Dự kiến số: ${selectedBatch.estimatedHarvestCount}`
                                  : ""
                              }
                            />
                            <KPICard
                              icon={
                                <SetMealIcon
                                  sx={{ color: theme.palette.success.main }}
                                />
                              }
                              label="Dự kiến thu hoạch"
                              value={
                                selectedBatch.estimatedHarvestCount != null
                                  ? `${selectedBatch.estimatedHarvestCount}`
                                  : "—"
                              }
                              desc={
                                selectedBatch.estimatedHarvestWeightKg != null
                                  ? `Tổng trọng lượng: ${selectedBatch.estimatedHarvestWeightKg.toFixed(2)} kg`
                                  : ""
                              }
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
                              label="Tổng hao hụt (Cá chết)"
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
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
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
                              {feedingLogs.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    align="center"
                                    sx={{ py: 3, color: "text.secondary" }}
                                  >
                                    Chưa có dữ liệu.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                feedingLogs.map((log) => (
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
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
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
                            Báo cáo cá chết
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
                              {mortalityLogs.length === 0 ? (
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
                                mortalityLogs.map((log) => (
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
            <InputLabel>Loại thức ăn</InputLabel>
            <Select
              value={feedTypeIdInput}
              label="Loại thức ăn"
              onChange={(e) => setFeedTypeIdInput(e.target.value)}
            >
              {feedTypes.length === 0 ? (
                <MenuItem disabled value="">
                  Đang tải dữ liệu...
                </MenuItem>
              ) : (
                feedTypes.map((type) => (
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
            label="Khối lượng thức ăn"
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
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.error.main }}>
          Báo cáo hao hụt (Cá chết)
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            label="Số lượng cá chết"
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
              setMortalityWarning(null); // reset cảnh báo khi thay đổi input
            }}
          />
          <TextField
            fullWidth
            size="small"
            label="Khối lượng cá chết"
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
              setMortalityWarning(null);
            }}
          />

          {/* CẢNH BÁO VƯỢT NGƯỠNG — hiện sau khi validate trả về isWithinRange=false */}
          {mortalityWarning && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                p: 1.5,
                borderRadius: "8px",
                bgcolor: "#FFF7ED",
                border: `1px solid #FDBA74`,
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

// --- CÁC COMPONENT PHỤ ---
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
  let statusLabel = "";
  let statusColor = "";
  let statusBg = "";

  const currentStatus = String(data.status).toLowerCase();

  if (currentStatus === "0" || currentStatus === "active") {
    statusLabel = "Đang nuôi";
    statusColor = theme.palette.success.main;
    statusBg = theme.palette.success.light;
  } else if (currentStatus === "1" || currentStatus === "harvested") {
    statusLabel = "Đã thu hoạch";
    statusColor = theme.palette.text.secondary;
    statusBg = theme.palette.action.selected;
  } else if (currentStatus === "2" || currentStatus === "paused") {
    statusLabel = "Tạm dừng";
    statusColor = theme.palette.warning.main;
    statusBg = theme.palette.warning.light;
  } else {
    statusLabel = "Đã hủy";
    statusColor = theme.palette.error.main;
    statusBg = theme.palette.error.light;
  }

  const borderColor = selected
    ? theme.palette.primary.main
    : theme.palette.divider;
  const bgColor = selected
    ? alpha(theme.palette.primary.main, 0.08)
    : theme.palette.background.paper;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: "12px",
        border: `1px solid ${borderColor}`,
        bgcolor: bgColor,
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": { borderColor: theme.palette.primary.main },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        mb={1.5}
        alignItems="flex-start"
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: theme.palette.text.primary,
              lineHeight: 1.2,
            }}
          >
            {data.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              display: "block",
              mt: 0.5,
            }}
          >
            {data.fishTankName}
          </Typography>
        </Box>
        <Chip
          label={statusLabel}
          size="small"
          sx={{
            bgcolor: statusBg,
            color: statusColor,
            fontWeight: 600,
            fontSize: "0.65rem",
            height: 20,
            borderRadius: "6px",
          }}
        />
      </Stack>
      <Stack spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SetMealIcon
            sx={{ fontSize: 16, color: theme.palette.text.secondary }}
          />
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            Loài: {data.speciesName}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TimelineIcon
            sx={{ fontSize: 16, color: theme.palette.text.secondary }}
          />
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            Giai đoạn: {data.stageName}
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
