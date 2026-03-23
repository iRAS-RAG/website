import AgricultureIcon from "@mui/icons-material/Agriculture";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import PeopleIcon from "@mui/icons-material/People";
import PetsIcon from "@mui/icons-material/Pets";
import {
  Avatar,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isSupervisor } from "../../api/auth";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import FeedTypesTab from "./FeedTypesTab";
import SpeciesConfigsTab from "./SpeciesConfigsTab";
import { useSupervisorDashboard } from "../../hooks/useSupervisorDashboard";

// --- COMPONENT TỔNG QUAN (OVERVIEW) ---
const OverviewSection: React.FC = () => {
  // Gắn Hook gọi API vào đây (Đã bỏ recentBatches vì không dùng bảng nữa)
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
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
        >
          Tổng quan hệ thống
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Chào mừng trở lại, Supervisor! Dưới đây là tóm tắt hoạt động của hệ
          thống hôm nay.
        </Typography>
      </Box>

      {/* TOP METRIC CARDS */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {/* Card 1: Nhân viên */}
        <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "260px" }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              transition: "0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
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
                  Tổng nhân viên
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#0F172A", mb: 0 }}
                >
                  {stats.totalEmployees}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#2A85FF",
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                }}
              >
                <PeopleIcon />
              </Avatar>
            </Stack>
          </Paper>
        </Box>

        {/* Card 2: Vụ nuôi */}
        <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "260px" }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              transition: "0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
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
                  Vụ nuôi hoạt động
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#0F172A", mb: 0 }}
                >
                  {stats.activeBatches}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: "#ECFDF5",
                  color: "#10B981",
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                }}
              >
                <AgricultureIcon />
              </Avatar>
            </Stack>
          </Paper>
        </Box>

        {/* Card 3: Loại thức ăn */}
        <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "260px" }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              transition: "0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
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
                  Loại thức ăn
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#0F172A", mb: 0 }}
                >
                  {stats.totalFeedTypes}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: "#FFFBEB",
                  color: "#F59E0B",
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                }}
              >
                <FastfoodIcon />
              </Avatar>
            </Stack>
          </Paper>
        </Box>

        {/* Card 4: Cấu hình loài */}
        <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "260px" }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              transition: "0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
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
                  Cấu hình loài
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#0F172A", mb: 0 }}
                >
                  {stats.totalSpecies}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: "#F3E8FF",
                  color: "#9333EA",
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                }}
              >
                <PetsIcon />
              </Avatar>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

// --- TAB RENDERER ---
const SectionRenderer: React.FC<{ section?: string }> = ({
  section: propSection,
}) => {
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

        <Box
          component="main"
          sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, width: "100%" }}
        >
          <Stack spacing={2}>
            <SectionRenderer section={section} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default SupervisorDashboard;
