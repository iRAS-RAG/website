import React from "react";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";

// Components & Icons
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";

// Material UI Icons
import WaterIcon from "@mui/icons-material/Water";
import InventoryIcon from "@mui/icons-material/Inventory";
import SensorsIcon from "@mui/icons-material/Sensors";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

// Import Custom Hook vừa tạo
import { useOperatorDashboard } from "../../hooks/useOperatorDashboard";

// Interface Component (Giữ nguyên)
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

// Component Thẻ Thống Kê (Giữ nguyên)
const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        flex: "1 1 200px",
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: "12px",
          bgcolor: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon fontSize="medium" />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

const OperatorDashboard = () => {
  const theme = useTheme();

  // Toàn bộ logic API phức tạp đã được "giấu" vào hook này
  const { stats, loading } = useOperatorDashboard();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", bgcolor: "#F8FAFC", minHeight: "100vh" }}>
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

        <Box component="main" sx={{ p: 4 }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#1E293B" }}>
              Bảng điều khiển
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
            >
              Tổng quan tài sản và vận hành từ hệ thống giám sát iRAS-RAG
            </Typography>
          </Box>

          {/* Thống kê tổng quan hệ thống */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Tài sản & Vận hành
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 6 }}>
            <StatCard
              title="Tổng số bể"
              value={stats.totalTanks}
              icon={WaterIcon}
              color="#3B82F6"
            />
            <StatCard
              title="Tổng lô nuôi"
              value={stats.totalBatches}
              icon={InventoryIcon}
              color="#10B981"
            />
            <StatCard
              title="Tổng cảm biến"
              value={stats.totalSensors}
              icon={SensorsIcon}
              color="#8B5CF6"
            />
            <StatCard
              title="Tổng thiết bị"
              value={stats.totalDevices}
              icon={SettingsSuggestIcon}
              color="#F59E0B"
            />
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
  );
};

export default OperatorDashboard;
