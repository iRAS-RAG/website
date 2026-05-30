import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isSupervisor } from "../../api/auth";
import MetricsPanel from "../../components/supervisor/MetricsPanel";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import { useSupervisorDashboard } from "../../hooks/useSupervisorDashboard";
import FeedTypesTab from "./FeedTypesTab";
import SpeciesConfigsTab from "./SpeciesConfigsTab";

// --- COMPONENT TỔNG QUAN (OVERVIEW) ---
const OverviewSection: React.FC = () => {
  const { loading } = useSupervisorDashboard();

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}>
          Tổng quan hệ thống
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Chào mừng trở lại, Người giám sát! Dưới đây là tóm tắt hoạt động của hệ thống hôm nay.
        </Typography>
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
        <SupervisorHeader />

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
