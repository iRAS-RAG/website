import { alpha, Avatar, Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { SxProps, SystemStyleObject } from "@mui/system";
import type { JSX } from "react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import LogoutButton from "./LogoutButton";

export interface MenuItemType {
  text: string;
  icon: JSX.Element;
  path: string;
}

interface SidebarProps {
  menu: MenuItemType[];
  activeStyle?: "primary" | "leftBorder" | "simple";
  userName?: string;
  userRole?: string;
  userInitials?: string;
  width?: number;
  zIndex?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ menu, activeStyle = "simple", userName = "User", userRole = "", userInitials = "U", width = 240, zIndex = 1100 }) => {
  const theme = useTheme();
  const location = useLocation();

  return (
    <Box
      sx={{
        width,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        zIndex,
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
          const isActive = location.pathname === m.path;

          const baseSxInitial: SxProps<Theme> = {
            borderRadius: "10px",
            py: 1.2,
            "& .MuiListItemIcon-root": {
              minWidth: 38,
              color: theme.palette.text.secondary,
            },
          };

          let baseSx: SxProps<Theme> = { ...baseSxInitial };

          if (activeStyle === "primary") {
            baseSx = {
              ...baseSx,
              bgcolor: isActive ? theme.palette.primary.light : "transparent",
              color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
              "&:hover": { bgcolor: isActive ? theme.palette.primary.light : "#F8FAFC" },
              "& .MuiListItemIcon-root": {
                ...(baseSxInitial["& .MuiListItemIcon-root"] as SystemStyleObject<Theme>),
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
              },
            };
          } else if (activeStyle === "leftBorder") {
            baseSx = {
              ...baseSx,
              bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent",
              borderLeft: `4px solid ${isActive ? theme.palette.primary.main : "transparent"}`,
              "& .MuiListItemIcon-root": {
                ...(baseSxInitial["& .MuiListItemIcon-root"] as SystemStyleObject<Theme>),
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
              },
            };
          } else {
            baseSx = {
              ...baseSx,
              "&:hover": { bgcolor: "#F8FAFC" },
              "& .MuiListItemIcon-root": {
                ...(baseSxInitial["& .MuiListItemIcon-root"] as SystemStyleObject<Theme>),
                color: theme.palette.text.secondary,
              },
            };
          }

          return (
            <ListItem key={m.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton component={Link} to={m.path} sx={baseSx}>
                <ListItemIcon>{m.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                      }}
                    >
                      {m.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, mt: "auto" }}>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, color: "#fff", fontSize: "14px" }}>{userInitials}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>{userName}</Typography>
            {userRole && <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>{userRole}</Typography>}
          </Box>
          <LogoutButton />
        </Stack>
      </Box>
    </Box>
  );
};

export default Sidebar;
