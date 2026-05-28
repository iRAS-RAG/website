import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

// Components & Icons
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";

// Material UI Icons
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import InventoryIcon from "@mui/icons-material/Inventory";
import SensorsIcon from "@mui/icons-material/Sensors";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import WaterIcon from "@mui/icons-material/Water";

// Import Custom Hook & API
import { useOperatorDashboard } from "../../hooks/useOperatorDashboard";
import { apiFetch } from "../../api/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

interface FishTank {
  id: string;
  name: string;
}

interface TankListResponse {
  items?: FishTank[];
  meta?: { totalItems: number };
}

// ─── StatCard ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        transition: "transform 0.2s",
        height: "100%",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ height: "100%" }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#64748B",
              mb: 1,
              textTransform: "uppercase",
            }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A" }}>
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}15`,
            color: color,
            width: 48,
            height: 48,
            borderRadius: "12px",
          }}
        >
          <Icon />
        </Avatar>
      </Stack>
    </Paper>
  );
};

// ─── OperatorDashboard ───────────────────────────────────────────────────────

const OperatorDashboard = () => {
  const [selectedTankId, setSelectedTankId] = useState<string>("");
  const [tanks, setTanks] = useState<FishTank[]>([]);
  const [tanksLoading, setTanksLoading] = useState(true);

  // Fetch danh sách bể để dùng trong dropdown
  useEffect(() => {
    const fetchTanks = async () => {
      try {
        const res = await apiFetch<TankListResponse | FishTank[]>(
          "/fish-tanks?page=1&pageSize=100",
        );
        if (Array.isArray(res)) {
          setTanks(res);
        } else if (res && "items" in res && Array.isArray(res.items)) {
          setTanks(res.items);
        }
      } catch (err) {
        console.error("Không thể tải danh sách bể:", err);
      } finally {
        setTanksLoading(false);
      }
    };
    fetchTanks();
  }, []);

  // Truyền tankId vào hook để lọc stats — undefined nghĩa là "tất cả bể"
  const { stats, loading } = useOperatorDashboard(
    selectedTankId || undefined,
  );

  const selectedTank = tanks.find((t) => t.id === selectedTankId);

  if (loading && !tanks.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#F8FAFC",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
        width: "100%",
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
          component="main"
          sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, width: "100%" }}
        >
          {/* ── Header Section ── */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-end"
            flexWrap="wrap"
            gap={2}
            sx={{ mb: 4 }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
              >
                Tổng quan hệ thống giám sát
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                {selectedTank
                  ? `Đang xem dữ liệu riêng của bể: ${selectedTank.name}`
                  : "Chào mừng trở lại! Dưới đây là tóm tắt tài sản và tình trạng vận hành từ iRAS-RAG."}
              </Typography>
            </Box>

            {/* ── Tank Selector ── */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Chọn bể</InputLabel>
              <Select
                value={selectedTankId}
                label="Chọn bể"
                onChange={(e) => setSelectedTankId(e.target.value)}
                disabled={tanksLoading}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E2E8F0",
                  },
                }}
              >
                <MenuItem value="">
                  <em>Tất cả bể</em>
                </MenuItem>
                {tanks.map((tank) => (
                  <MenuItem key={tank.id} value={tank.id}>
                    {tank.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* ── Stats Cards ── */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ flex: "1 1 calc(33.333% - 24px)", minWidth: "260px" }}>
                <StatCard
                  title="Tổng số bể"
                  value={stats.totalTanks}
                  icon={WaterIcon}
                  color="#2A85FF"
                />
              </Box>

              <Box sx={{ flex: "1 1 calc(33.333% - 24px)", minWidth: "260px" }}>
                <StatCard
                  title={selectedTank ? `Lô nuôi — ${selectedTank.name}` : "Tổng lô nuôi"}
                  value={stats.totalBatches}
                  icon={InventoryIcon}
                  color="#10B981"
                />
              </Box>

              <Box sx={{ flex: "1 1 calc(33.333% - 24px)", minWidth: "260px" }}>
                <StatCard
                  title={selectedTank ? `Cảm biến — ${selectedTank.name}` : "Tổng cảm biến"}
                  value={stats.totalSensors}
                  icon={SensorsIcon}
                  color="#9333EA"
                />
              </Box>

              <Box sx={{ flex: "1 1 calc(33.333% - 24px)", minWidth: "260px" }}>
                <StatCard
                  title="Tổng thiết bị"
                  value={stats.totalDevices}
                  icon={SettingsSuggestIcon}
                  color="#F59E0B"
                />
              </Box>

              <Box sx={{ flex: "1 1 calc(33.333% - 24px)", minWidth: "260px" }}>
                <StatCard
                  title="Nhật ký bảo trì"
                  value={stats.totalMaintenance}
                  icon={AssignmentTurnedInIcon}
                  color="#EC4899"
                />
              </Box>
            </Box>
          )}

          {/* ── Chú thích khi đang lọc theo bể ── */}
          {selectedTankId && (
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 2, color: "#94A3B8", fontStyle: "italic" }}
            >
              * Lô nuôi và Cảm biến được lọc theo bể đã chọn. Thiết bị &amp; Bảo trì hiển thị toàn hệ thống.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorDashboard;
