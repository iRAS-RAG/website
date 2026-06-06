import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Badge, Box, Fade, IconButton, Menu, MenuItem, Paper, Typography, useTheme } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

type Notification = { id?: string; type: "error" | "warning" | "success"; title: string; time: string };

export type AlertPopup = { key: number; type: "error" | "warning" | "success"; title: string; alertId?: string };

interface DashboardHeaderProps {
  title?: string;
  badgeCount?: number;
  notifications?: Notification[];
  seeAllRoute?: string;
  showNotifications?: boolean;
  alertPopup?: AlertPopup | null;
  onAlertPopupDismiss?: (alertId?: string) => void;
  onNotificationClick?: (id?: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, badgeCount = 0, notifications = [], seeAllRoute, showNotifications = true, alertPopup, onAlertPopupDismiss, onNotificationClick }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Title centered if provided */}
      <Box sx={{ flex: 1, textAlign: "center" }}>
        {title && (
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        )}
      </Box>

      {/* Right: notifications */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {showNotifications && (
          <Box sx={{ position: "relative" }}>
            <IconButton onClick={handleOpen} size="large" aria-label="notifications">
              <Badge badgeContent={badgeCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {alertPopup && (
              <Fade key={alertPopup.key} in timeout={300}>
                <Paper
                  elevation={4}
                  onClick={() => onAlertPopupDismiss?.(alertPopup.alertId)}
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 300,
                    p: 1.5,
                    zIndex: 1400,
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: `1px solid ${
                      alertPopup.type === "error"
                        ? theme.palette.error.light
                        : alertPopup.type === "warning"
                          ? theme.palette.warning.light
                          : theme.palette.success.light
                    }`,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    {alertPopup.type === "error" ? (
                      <ErrorIcon fontSize="small" color="error" sx={{ mt: 0.25 }} />
                    ) : alertPopup.type === "warning" ? (
                      <WarningAmberIcon fontSize="small" color="warning" sx={{ mt: 0.25 }} />
                    ) : (
                      <CheckCircleIcon fontSize="small" color="success" sx={{ mt: 0.25 }} />
                    )}
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                      {alertPopup.title}
                    </Typography>
                    <CloseIcon fontSize="small" sx={{ color: "text.secondary", mt: 0.25 }} />
                  </Box>
                </Paper>
              </Fade>
            )}
          </Box>
        )}

        {showNotifications && <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx: { width: 320 } }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((n, i) => (
              <MenuItem key={i} onClick={() => { handleClose(); onNotificationClick?.(n.id); }} sx={{ alignItems: "flex-start", cursor: onNotificationClick && n.id ? "pointer" : "default" }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {n.type === "error" ? (
                    <ErrorIcon fontSize="small" color="error" />
                  ) : n.type === "warning" ? (
                    <WarningAmberIcon fontSize="small" color="warning" />
                  ) : (
                    <CheckCircleIcon fontSize="small" color="success" />
                  )}
                  <Box>
                    <Typography variant="body2">{n.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.time}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Không có thông báo</MenuItem>
          )}
          {seeAllRoute && (
            <MenuItem
              onClick={() => {
                handleClose();
                navigate(seeAllRoute);
              }}
              sx={{ justifyContent: "center" }}
            >
              Xem tất cả
            </MenuItem>
          )}
        </Menu>}
      </Box>
    </Box>
  );
};

export default DashboardHeader;
