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
import { useNavigate } from "react-router-dom";

import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";
import { TankPulseCard } from "../../components/operator/TankPulseCard";
import { RecentAlertsList } from "../../components/operator/RecentAlertsList";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";

import { useOperatorDashboard } from "../../hooks/useOperatorDashboard";
import { getTanks } from "../../api/tanks";
import type { Tank } from "../../types/tank";

// ─── Types ───────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

const KpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  onClick,
}: KpiCardProps) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: "14px",
      border: "1px solid #E2E8F0",
      borderTop: `4px solid ${color}`,
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.15s, box-shadow 0.15s",
      bgcolor: "#fff",
      "&:hover": onClick
        ? {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }
        : undefined,
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#64748B",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1 }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{ color: "#94A3B8", mt: 0.5, display: "block" }}
          >
            {subtitle}
          </Typography>
        )}
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

// ─── OperatorDashboard ───────────────────────────────────────────────────────

const OperatorDashboard = () => {
  const [selectedTankId, setSelectedTankId] = useState<string>("");
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [tanksLoading, setTanksLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTanks = async () => {
      try {
        const list = await getTanks();
        setTanks(list);
      } catch (err) {
        console.error("Không thể tải danh sách bể:", err);
      } finally {
        setTanksLoading(false);
      }
    };
    fetchTanks();
  }, []);

  const { stats, batches, loading } = useOperatorDashboard(
    selectedTankId || undefined,
  );
  const selectedTank = tanks.find((t) => t.id === selectedTankId);

  const visibleTanks = selectedTankId
    ? tanks.filter((t) => t.id === selectedTankId)
    : tanks;

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
          sx={{ p: { xs: 2.5, md: 3.5 }, flexGrow: 1, width: "100%" }}
        >
          {/* ── Header + Tank Selector ── */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-end"
            flexWrap="wrap"
            gap={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
              >
                Tổng quan hệ thống iRAS-RAG
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                {selectedTank
                  ? `Đang theo dõi bể: ${selectedTank.name}`
                  : "Tổng quan tình trạng vận hành toàn hệ thống iRAS-RAG"}
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Lọc theo bể</InputLabel>
              <Select
                value={selectedTankId}
                label="Lọc theo bể"
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

          {/* ── ZONE 1: KPI Bar ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2.5,
              mb: 3,
            }}
          >
            <KpiCard
              title="Cảnh báo chờ xử lý"
              value={stats.openAlerts}
              subtitle={
                stats.openAlerts > 0 ? "Cần xử lý ngay" : "Không có cảnh báo mở"
              }
              icon={NotificationsActiveIcon}
              color="#EF4444"
              onClick={() => navigate("/operator/alerts")}
            />
            <KpiCard
              title="Lô nuôi đang hoạt động"
              value={stats.activeBatches}
              subtitle={
                selectedTank ? `Trong bể ${selectedTank.name}` : "Toàn hệ thống"
              }
              icon={InventoryIcon}
              color="#2A85FF"
              onClick={() => navigate("/operator/tanks")}
            />
            <KpiCard
              title="Thiết bị đang chạy"
              value={`${stats.runningDevices}/${stats.totalDevices}`}
              subtitle="Máy bơm, sục khí, đèn..."
              icon={SettingsSuggestIcon}
              color="#10B981"
            />
          </Box>

          {/* ── ZONE 2 + 3: Main Layout (Tank Grid + Side Panel) ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
              gap: 2.5,
              alignItems: "start",
            }}
          >
            {/* ZONE 2 — Tank Grid */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1.5}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1E293B" }}
                >
                  Trạng thái các bể
                </Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                  {visibleTanks.length} bể được hiển thị
                </Typography>
              </Stack>

              {visibleTanks.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: "14px",
                    border: "1px dashed #CBD5E1",
                    textAlign: "center",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    Chưa có bể nào được cấu hình
                  </Typography>
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      visibleTanks.length === 1
                        ? "1fr"
                        : { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  {visibleTanks.map((tank) => {
                    const tankBatch = batches.find(
                      (b) => b.fishTankId === tank.id,
                    );
                    return (
                      <TankPulseCard
                        key={tank.id}
                        tankId={tank.id}
                        tankName={tank.name}
                        batch={tankBatch}
                        onClick={() => navigate("/operator/sensors")}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* ZONE 3 — Action Queue */}
            <Stack spacing={2.5}>
              <RecentAlertsList
                tankId={selectedTankId || undefined}
                limit={5}
              />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorDashboard;
