import ArticleIcon from "@mui/icons-material/Article";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import { Avatar, Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import LogoutButton from "../common/LogoutButton";

const menu = [
  { text: "Bảng điều khiển", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "Quản lý người dùng", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "AI & Cơ sở tri thức", icon: <ArticleIcon />, path: "/admin/ai" },
  { text: "Phần cứng & Cảm biến", icon: <SettingsIcon />, path: "/admin/hardware" },
];

export const AdminSidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

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
        {menu.map((m) => (
          <ListItem key={m.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton sx={{ borderRadius: "10px", py: 1.2 }} onClick={() => navigate(m.path)}>
              <ListItemIcon>{m.icon}</ListItemIcon>
              <ListItemText primary={m.text} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, mt: "auto" }}>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, color: "#fff", fontSize: "14px" }}>A</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Admin</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>Quản trị viên</Typography>
          </Box>
          <LogoutButton />
        </Stack>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
