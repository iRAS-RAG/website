import { Avatar, Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom"; // Hook để nhận diện trang hiện tại
import logo from "../../assets/logo.png";
import LogoutButton from "../common/LogoutButton";

import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SensorsIcon from "@mui/icons-material/Sensors";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningIcon from "@mui/icons-material/Warning";
import WaterIcon from "@mui/icons-material/Water";
import type { JSX } from "react";

interface MenuItemType {
  text: string;
  icon: JSX.Element;
  path: string; // Đường dẫn điều hướng bắt buộc
}

const menuItems: MenuItemType[] = [
  {
    text: "Bảng điều khiển",
    icon: <DashboardIcon />,
    path: "/operator/dashboard",
  },
  {
    text: "Bể nuôi",
    icon: <WaterIcon />,
    path: "/operator/tanks", // Đã cập nhật đường dẫn đến TankManagement
  },
  {
    text: "Cảm biến",
    icon: <SensorsIcon />,
    path: "/operator/sensors",
  },
  {
    text: "Cảnh báo",
    icon: <WarningIcon />,
    path: "/operator/alerts",
  },
  {
    text: "Tư vấn AI",
    icon: <PsychologyIcon />,
    path: "/operator/ai-advisory",
  },
  {
    text: "Nhật ký bảo trì",
    icon: <AssignmentIcon />,
    path: "/operator/maintenance",
  },
  {
    text: "Cài đặt",
    icon: <SettingsIcon />,
    path: "/operator/settings",
  },
];

export const OperatorSidebar = () => {
  const theme = useTheme();
  const location = useLocation(); // Lấy URL hiện tại để kiểm tra trạng thái Active

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
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: "24px 20px" }}>
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
          // Tự động kích hoạt trạng thái sáng màu khi URL khớp với path
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link} // Tích hợp React Router Link
                to={item.path}
                sx={{
                  borderRadius: "10px",
                  py: 1.2,
                  bgcolor: isActive ? theme.palette.primary.light : "transparent",
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: isActive ? theme.palette.primary.light : "#F8FAFC",
                  },
                  "& .MuiListItemIcon-root": {
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
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
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Nguyễn Văn A</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>Kỹ thuật viên</Typography>
          </Box>
          <LogoutButton />
        </Stack>
      </Box>
    </Box>
  );
};
