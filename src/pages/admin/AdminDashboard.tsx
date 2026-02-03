import ArticleIcon from "@mui/icons-material/Article";
import DevicesIcon from "@mui/icons-material/Devices";
import InsightsIcon from "@mui/icons-material/Insights";
import PeopleIcon from "@mui/icons-material/People";
import { Box, Paper, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

const MOCK_ADMIN_METRICS = {
  totalUsers: 124,
  activeUsersToday: 37,
  knowledgeBaseArticles: 58,
  aiModels: 3,
  iotDevices: 42,
  devicesOnline: 39,
};

const StatCard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode }> = ({ title, value, icon }) => {
  const theme = useTheme();
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", alignItems: "center", gap: 2 }}>
      <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", bgcolor: theme.palette.action.hover, borderRadius: 1.5 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", bgcolor: theme.palette.background.default, minHeight: "100vh", width: "100%" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader />

        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Tabs
                value={location.pathname === "/admin" ? "/admin/dashboard" : location.pathname.startsWith("/admin") ? location.pathname : "/admin/dashboard"}
                variant="standard"
                aria-label="admin tabs"
              >
                <Tab label="Bảng điều khiển" value="/admin/dashboard" component={Link} to="/admin/dashboard" />
                <Tab label="Quản lý người dùng" value="/admin/users" component={Link} to="/admin/users" />
                <Tab label="AI & Cơ sở tri thức" value="/admin/ai" component={Link} to="/admin/ai" />
                <Tab label="Phần cứng & Cảm biến" value="/admin/hardware" component={Link} to="/admin/hardware" />
              </Tabs>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Bảng điều khiển quản trị
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5, mb: 2 }}>
              Tổng quan các chỉ số quản trị hệ thống
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 4 }}>
            <StatCard title="Tổng số người dùng" value={MOCK_ADMIN_METRICS.totalUsers} icon={<PeopleIcon />} />
            <StatCard title="Người dùng hoạt động hôm nay" value={MOCK_ADMIN_METRICS.activeUsersToday} icon={<InsightsIcon />} />
            <StatCard title="Bài viết CSDL tri thức" value={MOCK_ADMIN_METRICS.knowledgeBaseArticles} icon={<ArticleIcon />} />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 6 }}>
            <StatCard title="Mô hình AI" value={MOCK_ADMIN_METRICS.aiModels} icon={<InsightsIcon />} />
            <StatCard title="Thiết bị IoT" value={MOCK_ADMIN_METRICS.iotDevices} icon={<DevicesIcon />} />
            <StatCard title="Thiết bị trực tuyến" value={MOCK_ADMIN_METRICS.devicesOnline} icon={<DevicesIcon />} />
          </Box>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
              Hoạt động gần đây
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Các thay đổi và hành động quản trị gần đây sẽ xuất hiện ở đây (mẫu).
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
