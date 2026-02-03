import React, { useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Typography,
  Stack,
  Paper,
  Menu,
  Divider,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";

// --- Interface cho từng notification ---
interface NotificationItemProps {
  type: "error" | "warning" | "success";
  title: string;
  time: string;
}

// --- Sub-component thông báo dùng màu từ theme ---
const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  time,
}) => {
  const theme = useTheme();

  const colors = {
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    success: theme.palette.success.main,
  };

  return (
    <Box
      sx={{
        p: 1.5,
        "&:hover": { bgcolor: theme.palette.background.default },
        cursor: "pointer",
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: colors[type],
            mt: 0.8,
          }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
          >
            {time}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export const TechnicianHeader: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleSeeAll = () => {
    setAnchorEl(null); // Đóng menu trước khi chuyển trang
    navigate("/technician/alerts"); // Điều hướng đến AlertCenter
  };
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
      {/* SEARCH */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          width: 400,
          bgcolor: theme.palette.background.default,
          borderRadius: "12px",
          px: 1.5,
          py: 0.5,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <SearchIcon
          sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }}
        />
        <InputBase
          placeholder="Tìm nhanh mã bể, cảm biến..."
          sx={{ flex: 1, fontSize: "0.875rem" }}
        />
      </Paper>

      {/* NOTIF + USER */}
      <Stack direction="row" spacing={3} alignItems="center">
        {/* NOTIFICATION BUTTON */}
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            bgcolor: open
              ? theme.palette.primary.light
              : theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Badge badgeContent={3} color="error">
            <NotificationsIcon
              sx={{
                color: open
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              }}
            />
          </Badge>
        </IconButton>

        {/* MENU NOTIFICATION */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              width: 320,
              mt: 1.5,
              borderRadius: "12px",
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Cảnh báo mới nhất
            </Typography>
            <Typography
              onClick={handleSeeAll} //
              sx={{
                fontSize: "0.75rem",
                color: theme.palette.primary.main,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Xem tất cả
            </Typography>
          </Box>

          <Divider />

          <NotificationItem
            type="error"
            title="Bể A-03: Ammonia vượt ngưỡng"
            time="2 phút trước"
          />
          <NotificationItem
            type="warning"
            title="Bể B-01: Oxy hòa tan thấp"
            time="15 phút trước"
          />
          <NotificationItem
            type="success"
            title="Bể A-01: Đã ổn định trở lại"
            time="1 giờ trước"
          />

          <Divider />
          <Box sx={{ p: 1, textAlign: "center" }}>
            <Typography
              sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
            >
              Bạn có 3 thông báo chưa đọc
            </Typography>
          </Box>
        </Menu>

        {/* USER INFO */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
              Nguyễn Văn A
            </Typography>
            <Typography
              sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
            >
              Kỹ thuật viên
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          >
            A
          </Avatar>
        </Stack>
      </Stack>
    </Box>
  );
};
