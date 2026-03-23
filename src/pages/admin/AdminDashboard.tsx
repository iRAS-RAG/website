import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PeopleIcon from "@mui/icons-material/People";
import RouterIcon from "@mui/icons-material/Router";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";

// --- MOCK DATA ---
const MOCK_ADMIN_METRICS = {
  totalUsers: 124,
  activeUsersToday: 37,
  knowledgeBaseArticles: 58,
  aiModels: 3,
  iotDevices: 42,
  devicesOnline: 39,
};

const RECENT_ACTIVITIES = [
  {
    id: 1,
    text: "Quản trị viên đã cập nhật mô hình AI nhận diện cá rô phi",
    time: "10 phút trước",
    icon: <AutoAwesomeIcon fontSize="small" />,
  },
  {
    id: 2,
    text: "Người dùng mới (operator_03) được thêm vào hệ thống",
    time: "2 giờ trước",
    icon: <PeopleIcon fontSize="small" />,
  },
  {
    id: 3,
    text: "Cảnh báo: Thiết bị cảm biến nhiệt độ Bể 02 mất kết nối",
    time: "3 giờ trước",
    icon: <RouterIcon fontSize="small" />,
  },
  {
    id: 4,
    text: "Đã thêm 15 bài viết mới vào CSDL tri thức",
    time: "1 ngày trước",
    icon: <LibraryBooksIcon fontSize="small" />,
  },
];

// --- STAT CARD ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgcolor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgcolor,
}) => (
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
    <Stack direction="row" justifyContent="space-between" alignItems="center">
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
          bgcolor: bgcolor,
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

const AdminDashboard: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <AdminSidebar />

      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AdminHeader />

        <Box component="main" sx={{ p: { xs: 3, md: 4 }, flexGrow: 1 }}>
          {/* HEADER */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E293B" }}>
              Bảng điều khiển quản trị
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Tổng quan các chỉ số quản trị hệ thống iRAS-RAG.
            </Typography>
          </Box>

          {/* METRIC CARDS – CHUYỂN GRID → BOX */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              mb: 4,
            }}
          >
            <Box sx={{ flex: "1 1 calc(33.33% - 24px)", minWidth: "260px" }}>
              <StatCard
                title="Tổng số người dùng"
                value={MOCK_ADMIN_METRICS.totalUsers}
                icon={PeopleIcon}
                color="#2A85FF"
                bgcolor="#EFF6FF"
              />
            </Box>

            <Box sx={{ flex: "1 1 calc(33.33% - 24px)", minWidth: "260px" }}>
              <StatCard
                title="Người dùng hoạt động hôm nay"
                value={MOCK_ADMIN_METRICS.activeUsersToday}
                icon={HowToRegIcon}
                color="#10B981"
                bgcolor="#ECFDF5"
              />
            </Box>

            <Box sx={{ flex: "1 1 calc(33.33% - 24px)", minWidth: "260px" }}>
              <StatCard
                title="Bài viết CSDL tri thức"
                value={MOCK_ADMIN_METRICS.knowledgeBaseArticles}
                icon={LibraryBooksIcon}
                color="#9333EA"
                bgcolor="#F3E8FF"
              />
            </Box>

            <Box sx={{ flex: "1 1 calc(33.33% - 24px)", minWidth: "260px" }}>
              <StatCard
                title="Mô hình AI"
                value={MOCK_ADMIN_METRICS.aiModels}
                icon={AutoAwesomeIcon}
                color="#EC4899"
                bgcolor="#FDF2F8"
              />
            </Box>

            <Box sx={{ flex: "1 1 calc(33.33% - 24px)", minWidth: "260px" }}>
              <StatCard
                title="Thiết bị IoT"
                value={MOCK_ADMIN_METRICS.iotDevices}
                icon={RouterIcon}
                color="#F59E0B"
                bgcolor="#FFFBEB"
              />
            </Box>

            <Box sx={{ flex: "1 1 calc(33.33% - 24px)", minWidth: "260px" }}>
              <StatCard
                title="Thiết bị trực tuyến"
                value={MOCK_ADMIN_METRICS.devicesOnline}
                icon={WifiTetheringIcon}
                color="#06B6D4"
                bgcolor="#ECFEFF"
              />
            </Box>
          </Box>

          {/* HOẠT ĐỘNG GẦN ĐÂY */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2.5,
                borderBottom: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Hoạt động hệ thống gần đây
              </Typography>
            </Box>

            <List sx={{ bgcolor: "#FFFFFF", p: 0 }}>
              {RECENT_ACTIVITIES.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: "#F1F5F9",
                          color: "#475569",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {activity.icon}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#0F172A",
                            fontSize: "0.95rem",
                          }}
                        >
                          {activity.text}
                        </Typography>
                      }
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748B",
                        minWidth: "100px",
                        textAlign: "right",
                      }}
                    >
                      {activity.time}
                    </Typography>
                  </ListItem>

                  {index < RECENT_ACTIVITIES.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
