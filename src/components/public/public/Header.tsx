import LoginIcon from "@mui/icons-material/Login";
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addTokenListener, getAccessToken, getUserFromToken } from "../../../api/jwt";
import logo from "../../../assets/logo.png";

export const Header = () => {
  const getInitialRole = () => {
    const access = getAccessToken();
    if (!access) return null;
    return getUserFromToken(access).role as string | null;
  };

  const [role, setRole] = useState<string | null>(getInitialRole);

  useEffect(() => {
    const unsub = addTokenListener((access) => {
      if (!access) return setRole(null);
      setRole(getUserFromToken(access).role as string | null);
    });
    return unsub;
  }, []);

  const dashboardPath = (r: string | null) => {
    if (r === "Admin") return "/admin/dashboard";
    if (r === "Supervisor") return "/supervisor/dashboard";
    return "/operator/dashboard";
  };

  return (
    <AppBar position="fixed" color="inherit" sx={{ borderBottom: "1px solid #D1D5DB", zIndex: 1201 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo góc trái */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.1} // Tăng khoảng cách một chút cho cân đối với logo to
          component={Link}
          to="/"
          sx={{ textDecoration: "none" }}
        >
          {/* Logo cho to lên (tăng từ 45 lên 60 hoặc tùy chỉnh theo ý bạn) */}
          <Box component="img" src={logo} sx={{ height: 65, transition: "all 0.3s ease" }} />

          <Typography variant="h6" sx={{ fontWeight: 800, display: "flex" }}>
            {/* Chữ iRAS màu primary */}
            <Box component="span" sx={{ color: "primary.main" }}>
              iRAS
            </Box>
            {/* Dấu gạch ngang màu trung tính hoặc tùy chọn */}
            <Box component="span" sx={{ color: "text.primary" }}>
              -
            </Box>
            {/* Chữ RAG màu success */}
            <Box component="span" sx={{ color: "success.main" }}>
              RAG
            </Box>
          </Typography>
        </Stack>

        {/* Navigation Bar */}
        <Stack direction="row" spacing={1}>
          <Button color="inherit" component={Link} to="/">
            Trang chủ
          </Button>
          <Button color="inherit">Hệ thống RAS</Button>
          <Button color="inherit">Dashboard sức khỏe</Button>
          <Button color="inherit">Hướng dẫn bảo trì</Button>
          <Button color="inherit">Vật tư/Kho</Button>
        </Stack>

        {/* Nút Đăng nhập hoặc chuyển tới Dashboard nếu đã đăng nhập */}
        {!role ? (
          <Button variant="contained" color="primary" startIcon={<LoginIcon />} component={Link} to="/auth/login" sx={{ fontWeight: 700 }}>
            Đăng nhập
          </Button>
        ) : (
          <Button variant="contained" color="primary" component={Link} to={dashboardPath(role)} sx={{ fontWeight: 700 }}>
            Đi tới dashboard
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
