import {
  alpha,
  Box,
  Button,
  Chip,
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
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";

// --- ICONS ---
import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchIcon from "@mui/icons-material/Search";
import SetMealIcon from "@mui/icons-material/SetMeal";
import TimelineIcon from "@mui/icons-material/Timeline";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningIcon from "@mui/icons-material/Warning";
import WaterIcon from "@mui/icons-material/Water";

import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";

// --- INTERFACES ---
interface FeedingLog {
  id: string;
  date: string;
  feedType: string;
  quantity: number; // kg
}

interface MortalityLog {
  id: string;
  date: string;
  quantity: number; // con
  reason: string;
}

interface Batch {
  id: string; // Mã lô (e.g. BATCH-001)
  name: string; // Tên hiển thị (e.g. Lô nuôi cá rô phi 2024-01)
  tankName: string;
  tankVolume: number; // m3
  speciesName: string;
  stageName: string;
  status: "active" | "harvested" | "paused";
  initialQuantity: number;
  currentQuantity: number;
  totalFeed: number;
  totalDead: number;
  feedingLogs: FeedingLog[];
  mortalityLogs: MortalityLog[];
}

// --- MOCK DATA ---
const initialBatches: Batch[] = [
  {
    id: "BATCH-001",
    name: "Lô nuôi cá rô phi 2024-01",
    tankName: "Bể nuôi số 01",
    tankVolume: 120,
    speciesName: "Cá Rô Phi",
    stageName: "Giai đoạn phát triển",
    status: "active",
    initialQuantity: 1000,
    currentQuantity: 950,
    totalFeed: 120.5,
    totalDead: 50,
    feedingLogs: [
      {
        id: "F1",
        date: "2026-03-19 08:00",
        feedType: "Thức ăn hỗn hợp (Cám viên)",
        quantity: 5.5,
      },
      {
        id: "F2",
        date: "2026-03-18 16:30",
        feedType: "Thức ăn tăng trưởng",
        quantity: 6.0,
      },
    ],
    mortalityLogs: [
      {
        id: "M1",
        date: "2026-03-15 09:00",
        quantity: 20,
        reason: "Sốc nhiệt do cúp điện",
      },
      {
        id: "M2",
        date: "2026-03-10 14:00",
        quantity: 30,
        reason: "Chưa rõ nguyên nhân",
      },
    ],
  },
  {
    id: "BATCH-002",
    name: "Lô tôm thẻ 2024-02",
    tankName: "Bể nuôi số 02",
    tankVolume: 200,
    speciesName: "Tôm Thẻ Chân Trắng",
    stageName: "Về đích",
    status: "active",
    initialQuantity: 50000,
    currentQuantity: 45000,
    totalFeed: 350.0,
    totalDead: 5000,
    feedingLogs: [],
    mortalityLogs: [],
  },
  {
    id: "BATCH-003",
    name: "Lô cá chẽm 2023-11",
    tankName: "Bể nuôi số 03",
    tankVolume: 150,
    speciesName: "Cá Chẽm",
    stageName: "Đã thu hoạch",
    status: "harvested",
    initialQuantity: 800,
    currentQuantity: 0,
    totalFeed: 800.5,
    totalDead: 45,
    feedingLogs: [],
    mortalityLogs: [],
  },
];

const BatchManagement = () => {
  const theme = useTheme();

  // State quản lý danh sách lô (để cập nhật real-time khi thêm log)
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatches[0].id,
  );
  const [tabValue, setTabValue] = useState(0);

  const selectedBatch =
    batches.find((b) => b.id === selectedBatchId) || batches[0];

  // --- POPUP STATES ---
  // 1. Pop-up Cho ăn
  const [openFeedDialog, setOpenFeedDialog] = useState(false);
  const [feedInput, setFeedInput] = useState({ type: "", amount: "" });

  // 2. Pop-up Cá chết
  const [openDeathDialog, setOpenDeathDialog] = useState(false);
  const [deathInput, setDeathInput] = useState({ amount: "", reason: "" });

  // --- HANDLERS ---
  const handleSaveFeeding = () => {
    if (!feedInput.type || !feedInput.amount) return;

    const newLog: FeedingLog = {
      id: `F-${Date.now()}`,
      date: new Date().toLocaleString("vi-VN", { hour12: false }), // Lấy giờ hiện tại
      feedType: feedInput.type,
      quantity: parseFloat(feedInput.amount),
    };

    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === selectedBatch.id) {
          return {
            ...b,
            totalFeed: b.totalFeed + newLog.quantity, // Cộng dồn cám
            feedingLogs: [newLog, ...b.feedingLogs], // Thêm lên đầu danh sách
          };
        }
        return b;
      }),
    );

    setOpenFeedDialog(false);
    setFeedInput({ type: "", amount: "" });
  };

  const handleSaveMortality = () => {
    if (!deathInput.amount) return;

    const deathCount = parseInt(deathInput.amount);

    const newLog: MortalityLog = {
      id: `M-${Date.now()}`,
      date: new Date().toLocaleString("vi-VN", { hour12: false }),
      quantity: deathCount,
      reason: deathInput.reason || "Không có ghi chú",
    };

    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === selectedBatch.id) {
          return {
            ...b,
            totalDead: b.totalDead + deathCount, // Cộng dồn cá chết
            currentQuantity: Math.max(0, b.currentQuantity - deathCount), // Trừ cá tồn (không để số âm)
            mortalityLogs: [newLog, ...b.mortalityLogs],
          };
        }
        return b;
      }),
    );

    setOpenDeathDialog(false);
    setDeathInput({ amount: "", reason: "" });
  };

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

        {/* MAIN CONTENT AREA */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            p: 3,
            gap: 3,
            height: "calc(100vh - 80px)",
          }}
        >
          {/* HEADER */}
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
                Theo dõi sinh trưởng, dinh dưỡng và môi trường của từng lô nuôi
                để tối ưu hiệu quả và kịp thời điều chỉnh.
              </Typography>
            </Box>
          </Stack>

          {/* CONTENT 2 COLUMNS */}
          <Box sx={{ display: "flex", gap: 3, flexGrow: 1, minHeight: 0 }}>
            {/* ================= COL 1: DANH SÁCH LÔ NUÔI (35%) ================= */}
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
                  placeholder="Tìm kiếm lô nuôi, tên bể..."
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
                      selected={selectedBatchId === batch.id}
                      onClick={() => setSelectedBatchId(batch.id)}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* ================= COL 2: CHI TIẾT LÔ NUÔI (65%) ================= */}
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
                {/* Header Details */}
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
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        Mã lô: {selectedBatch.id} • Nằm tại:{" "}
                        <Chip
                          label={selectedBatch.tankName}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        />
                      </Typography>
                    </Box>
                  </Stack>

                  <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{ mt: 2 }}
                  >
                    <Tab
                      label="Tổng quan "
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    />
                    <Tab
                      label="Quản lý cho ăn "
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    />
                    <Tab
                      label="Ghi nhận cá chết"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    />
                  </Tabs>
                </Box>

                {/* Body Content */}
                <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto" }}>
                  {/* --- TAB 1: TỔNG QUAN --- */}
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
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 2,
                          }}
                        >
                          <KPICard
                            icon={
                              <WaterIcon
                                sx={{ color: theme.palette.info.main }}
                              />
                            }
                            label="Dung tích bể chứa"
                            value={`${selectedBatch.tankVolume} m³`}
                            desc="Thông tin hạ tầng"
                          />
                          <KPICard
                            icon={
                              <Inventory2OutlinedIcon
                                sx={{ color: theme.palette.primary.main }}
                              />
                            }
                            label="Số lượng hiện tại / Ban đầu"
                            value={`${selectedBatch.currentQuantity.toLocaleString()} / ${selectedBatch.initialQuantity.toLocaleString()}`}
                            desc="Con giống"
                          />
                          <KPICard
                            icon={
                              <SetMealIcon
                                sx={{ color: theme.palette.success.main }}
                              />
                            }
                            label="Tổng lượng cám tiêu thụ"
                            value={`${selectedBatch.totalFeed.toFixed(1)} kg`}
                            desc="Hiệu suất tiêu thụ"
                          />
                          <KPICard
                            icon={
                              <TrendingDownIcon
                                sx={{ color: theme.palette.error.main }}
                              />
                            }
                            label="Tỷ lệ hao hụt (Cá chết)"
                            value={`${selectedBatch.totalDead.toLocaleString()} con`}
                            desc={`~ ${((selectedBatch.totalDead / selectedBatch.initialQuantity) * 100).toFixed(2)}% tổng đàn`}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  )}

                  {/* --- TAB 2: QUẢN LÝ CHO ĂN --- */}
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
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                Khối lượng (kg)
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedBatch.feedingLogs.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  align="center"
                                  sx={{ py: 3, color: "text.secondary" }}
                                >
                                  Chưa có dữ liệu cho ăn.
                                </TableCell>
                              </TableRow>
                            ) : (
                              selectedBatch.feedingLogs.map((log) => (
                                <TableRow
                                  key={log.id}
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <TableCell>{log.date}</TableCell>
                                  <TableCell>{log.feedType}</TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      fontWeight: 600,
                                      color: theme.palette.success.main,
                                    }}
                                  >
                                    +{log.quantity} kg
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Stack>
                  )}

                  {/* --- TAB 3: QUẢN LÝ CÁ CHẾT --- */}
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
                          Theo dõi Tỷ lệ sống
                        </Typography>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<WarningIcon />}
                          onClick={() => setOpenDeathDialog(true)}
                          sx={{ textTransform: "none", boxShadow: "none" }}
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
                              <TableCell sx={{ fontWeight: 600 }}>
                                Ghi chú / Nguyên nhân
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                Số lượng (Con)
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedBatch.mortalityLogs.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  align="center"
                                  sx={{ py: 3, color: "text.secondary" }}
                                >
                                  Chưa có dữ liệu cá chết.
                                </TableCell>
                              </TableRow>
                            ) : (
                              selectedBatch.mortalityLogs.map((log) => (
                                <TableRow
                                  key={log.id}
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <TableCell>{log.date}</TableCell>
                                  <TableCell>{log.reason}</TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      fontWeight: 600,
                                      color: theme.palette.error.main,
                                    }}
                                  >
                                    - {log.quantity}
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
          </Box>
        </Box>
      </Box>

      {/* ================= DIALOGS ================= */}

      {/* Dialog Ghi nhận cho ăn */}
      <Dialog
        open={openFeedDialog}
        onClose={() => setOpenFeedDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Ghi nhận cho ăn</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <FormControl fullWidth size="small">
            <InputLabel>Loại thức ăn</InputLabel>
            <Select
              label="Loại thức ăn"
              value={feedInput.type}
              onChange={(e) =>
                setFeedInput({ ...feedInput, type: e.target.value })
              }
            >
              <MenuItem value="Thức ăn hỗn hợp (Cám viên)">
                Thức ăn hỗn hợp (Cám viên)
              </MenuItem>
              <MenuItem value="Thức ăn sinh học">Thức ăn sinh học</MenuItem>
              <MenuItem value="Thức ăn tăng trưởng">
                Thức ăn tăng trưởng
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Khối lượng"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            value={feedInput.amount}
            onChange={(e) =>
              setFeedInput({ ...feedInput, amount: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenFeedDialog(false)}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveFeeding}
            sx={{ textTransform: "none", boxShadow: "none" }}
          >
            Lưu dữ liệu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Báo cáo cá chết */}
      <Dialog
        open={openDeathDialog}
        onClose={() => setOpenDeathDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.error.main }}>
          Báo cáo cá chết
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            label="Số lượng chết"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">Con</InputAdornment>,
            }}
            value={deathInput.amount}
            onChange={(e) =>
              setDeathInput({ ...deathInput, amount: e.target.value })
            }
          />
          <TextField
            fullWidth
            size="small"
            label="Lý do / Triệu chứng"
            multiline
            rows={3}
            placeholder="Ví dụ: Cá lờ đờ, bỏ ăn, nổi đầu..."
            value={deathInput.reason}
            onChange={(e) =>
              setDeathInput({ ...deathInput, reason: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDeathDialog(false)}
            sx={{ textTransform: "none", color: theme.palette.text.secondary }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSaveMortality}
            sx={{ textTransform: "none", boxShadow: "none" }}
          >
            Lưu báo cáo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// --- SUB COMPONENTS ---

const BatchListItem = ({
  data,
  selected,
  onClick,
}: {
  data: Batch;
  selected: boolean;
  onClick: () => void;
}) => {
  const theme = useTheme();

  // Xác định màu sắc theo Status
  let statusLabel = "";
  let statusColor = "";
  let statusBg = "";

  switch (data.status) {
    case "active":
      statusLabel = "Đang nuôi";
      statusColor = theme.palette.success.main;
      statusBg = theme.palette.success.light;
      break;
    case "harvested":
      statusLabel = "Đã thu hoạch";
      statusColor = theme.palette.text.secondary;
      statusBg = theme.palette.action.selected;
      break;
    case "paused":
      statusLabel = "Tạm dừng";
      statusColor = theme.palette.warning.main;
      statusBg = theme.palette.warning.light;
      break;
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
            {data.tankName}
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
            sx={{
              fontSize: "0.8rem",
              color: theme.palette.text.primary,
              fontWeight: 500,
            }}
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
            sx={{
              fontSize: "0.8rem",
              color: theme.palette.text.primary,
              fontWeight: 500,
            }}
          >
            GĐ: {data.stageName}
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
  icon: React.ReactNode;
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
