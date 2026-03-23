import React from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Paper,
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

// Import Custom Hook
import { useOperatorDashboard } from "../../hooks/useOperatorDashboard";

// Interface Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

// Component Thẻ Thống Kê (Đã thiết kế lại theo chuẩn Enterprise SaaS)
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
            bgcolor: `${color}15`, // Tạo nền màu pastel dựa trên mã hex
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

const OperatorDashboard = () => {
  // Logic API được giữ nguyên tuyệt đối
  const { stats, loading } = useOperatorDashboard();

  if (loading) {
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
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
            >
              Tổng quan hệ thống giám sát
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Chào mừng trở lại! Dưới đây là tóm tắt tài sản và tình trạng vận
              hành từ iRAS-RAG.
            </Typography>
          </Box>

          {/* Thống kê tổng quan hệ thống (Sử dụng Grid thay vì Flexbox để đều cột) */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
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
                title="Tổng lô nuôi"
                value={stats.totalBatches}
                icon={InventoryIcon}
                color="#10B981"
              />
            </Box>

            <Box sx={{ flex: "1 1 calc(33.333% - 24px)", minWidth: "260px" }}>
              <StatCard
                title="Tổng cảm biến"
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
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorDashboard;
