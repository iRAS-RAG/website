import { Avatar, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isSupervisor } from "../../api/auth";
import MetricsPanel from "../../components/supervisor/MetricsPanel";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import { useSupervisorDashboard } from "../../hooks/useSupervisorDashboard";
import FeedTypesTab from "./FeedTypesTab";
import SpeciesConfigsTab from "./SpeciesConfigsTab";

// Icons
import AgricultureIcon from "@mui/icons-material/Agriculture";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import PeopleIcon from "@mui/icons-material/People";
import PetsIcon from "@mui/icons-material/Pets";

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon: Icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: "14px",
      border: "1px solid #E2E8F0",
      borderTop: `4px solid ${color}`,
      bgcolor: "#fff",
      height: "100%",
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: "#94A3B8", mt: 0.5, display: "block" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Avatar sx={{ bgcolor: `${color}15`, color, width: 48, height: 48, borderRadius: "12px" }}>
        <Icon />
      </Avatar>
    </Stack>
  </Paper>
);

// --- COMPONENT TỔNG QUAN (OVERVIEW) ---
const OverviewSection: React.FC = () => {
  const { stats, loading } = useSupervisorDashboard();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}>
          Tổng quan hệ thống
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Tổng quan tình trạng hoạt động của toàn trang trại iRAS-RAG
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2.5,
          mb: 3,
        }}
      >
        <KpiCard title="Nhân viên" value={stats.totalEmployees} subtitle="Tổng số nhân viên" icon={PeopleIcon} color="#9333EA" />
        <KpiCard title="Vụ nuôi đang hoạt động" value={stats.activeBatches} subtitle="Đang nuôi" icon={AgricultureIcon} color="#2A85FF" />
        <KpiCard title="Loại cám" value={stats.totalFeedTypes} subtitle="Tổng loại cám" icon={FastfoodIcon} color="#F59E0B" />
        <KpiCard title="Loài thủy sản" value={stats.totalSpecies} subtitle="Tổng loài" icon={PetsIcon} color="#10B981" />
      </Box>

      <MetricsPanel />
    </Box>
  );
};

// --- TAB RENDERER ---
const SectionRenderer: React.FC<{ section?: string }> = ({ section: propSection }) => {
  const { hash } = useLocation();
  const section = propSection || (hash || "").replace("#", "") || "overview";

  if (section === "feed-types") return <FeedTypesTab />;
  if (section === "species-configs") return <SpeciesConfigsTab />;

  return <OverviewSection />;
};

// --- MAIN DASHBOARD COMPONENT ---
const SupervisorDashboard: React.FC<{ section?: string }> = ({ section }) => {
  if (!isSupervisor()) return <Navigate to="/" replace />;

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <SupervisorSidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Box component="main" sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SectionRenderer section={section} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SupervisorDashboard;
