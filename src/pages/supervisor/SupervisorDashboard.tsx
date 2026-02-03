import { Box, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import { isSupervisor } from "../../mocks/auth";
import FeedsTab from "./FeedsTab";
import ScheduleTab from "./ScheduleTab";
import SpeciesTab from "./SpeciesTab";
import ThresholdsTab from "./ThresholdsTab";
// (data loaded via fetch* mocks)

const SupervisorDashboard: React.FC<{ section?: string }> = ({ section }) => {
  if (!isSupervisor()) return <Navigate to="/" replace />;

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <SupervisorSidebar />

      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <SupervisorHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Stack spacing={2}>
            <SectionRenderer section={section} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

const SectionRenderer: React.FC<{ section?: string }> = ({ section: propSection }) => {
  const { hash } = useLocation();
  const section = propSection || (hash || "").replace("#", "") || "overview";

  if (section === "species") return <SpeciesTab />;
  if (section === "feeds") return <FeedsTab />;
  if (section === "thresholds") return <ThresholdsTab />;
  if (section === "schedule") return <ScheduleTab />;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="body1">Chọn một mục từ menu bên trái để xem nội dung.</Typography>
    </Paper>
  );
};

export default SupervisorDashboard;
