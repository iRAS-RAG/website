import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom"; // QUAN TRỌNG: Thêm các import này
import logo from "../../assets/logo.png";

import DashboardIcon from "@mui/icons-material/Dashboard";
import WaterIcon from "@mui/icons-material/Water";
import SensorsIcon from "@mui/icons-material/Sensors";
import WarningIcon from "@mui/icons-material/Warning";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AssignmentIcon from "@mui/icons-material/Assignment";
import InventoryIcon from "@mui/icons-material/Inventory";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SettingsIcon from "@mui/icons-material/Settings";
import type { JSX } from "react";

interface MenuItemType {
  text: string;
  icon: JSX.Element;
  path: string; // Bắt buộc có path để điều hướng
}

const menuItems: MenuItemType[] = [
  {
    text: "Bảng điều khiển",
    icon: <DashboardIcon />,
    path: "/technician/dashboard",
  },
  {
    text: "Bể nuôi",
    icon: <WaterIcon />,
    path: "/technician/tanks",
  },
  {
    text: "Cảm biến",
    icon: <SensorsIcon />,
    path: "/technician/sensors",
  },
  {
    text: "Cảnh báo",
    icon: <WarningIcon />,
    path: "/technician/alerts",
  },
  {
    text: "Tư vấn AI",
    icon: <PsychologyIcon />,
    path: "/technician/ai-advisory",
  },
  {
    text: "Nhật ký bảo trì",
    icon: <AssignmentIcon />,
    path: "/technician/maintenance",
  },
  {
    text: "Kho phụ tùng",
    icon: <InventoryIcon />,
    path: "/technician/inventory",
  },
  {
    text: "Quản trị hệ thống",
    icon: <AdminPanelSettingsIcon />,
    path: "/technician/admin",
  },
  {
    text: "Cài đặt",
    icon: <SettingsIcon />,
    path: "/technician/settings",
  },
];

export const TechnicianSidebar = () => {
  const theme = useTheme();
  const location = useLocation(); // Hook lấy thông tin đường dẫn hiện tại

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bgcolor: "#FFFFFF",
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 1200,
      }}
    >
      {/* LOGO SECTION */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ p: "24px 20px" }}
      >
        <Box component="img" src={logo} sx={{ height: 32 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: theme.palette.primary.main,
            letterSpacing: "-0.5px",
          }}
        >
          iRAS-RAG
        </Typography>
      </Stack>

      {/* MENU ITEMS */}
      <List sx={{ flexGrow: 1, px: 1.5 }}>
        {menuItems.map((item) => {
          // Kiểm tra xem item này có đang được chọn không dựa trên URL
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link} // Biến button thành thẻ Link của React Router
                to={item.path} // Đường dẫn đích
                sx={{
                  borderRadius: "10px",
                  py: 1.2,
                  bgcolor: isActive
                    ? theme.palette.primary.light
                    : "transparent",
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: isActive ? theme.palette.primary.light : "#F8FAFC",
                  },
                  "& .MuiListItemIcon-root": {
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    minWidth: 38,
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.85rem",
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* USER INFO */}
      <Box sx={{ p: 2, mt: "auto" }}>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              fontSize: "14px",
            }}
          >
            A
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
              Nguyễn Văn A
            </Typography>
            <Typography
              sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
            >
              Kỹ thuật viên
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
