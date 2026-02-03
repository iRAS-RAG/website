import DashboardIcon from "@mui/icons-material/Dashboard";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PetsIcon from "@mui/icons-material/Pets";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { alpha, Avatar, Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import LogoutButton from "../common/LogoutButton";

const menu = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/manager/dashboard" },
  { text: "Loài", icon: <PetsIcon />, path: "/manager/species" },
  { text: "Thức ăn", icon: <FastfoodIcon />, path: "/manager/feeds" },
  { text: "Ngưỡng cảm biến", icon: <NotificationsActiveIcon />, path: "/manager/thresholds" },
  { text: "Lịch cho ăn", icon: <ScheduleIcon />, path: "/manager/schedule" },
];

export const ManagerSidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        position: "fixed",
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 1100,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: "24px 20px" }}>
        <Box component="img" src={logo} sx={{ height: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
          iRAS-RAG
        </Typography>
      </Stack>

      <List sx={{ flexGrow: 1, px: 1.5 }}>
        {menu.map((m) => {
          const isSelected = m.path === location.pathname;
          return (
            <ListItem key={m.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  py: 1.2,
                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                  borderLeft: `4px solid ${isSelected ? theme.palette.primary.main : "transparent"}`,
                }}
                onClick={() => navigate(m.path)}
              >
                <ListItemIcon sx={{ color: isSelected ? theme.palette.primary.main : "inherit" }}>{m.icon}</ListItemIcon>
                <ListItemText primary={m.text} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, mt: "auto" }}>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, color: "#fff", fontSize: "14px" }}>M</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Manager</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>Quản lý</Typography>
          </Box>
          <LogoutButton />
        </Stack>
      </Box>
    </Box>
  );
};

export default ManagerSidebar;
