import LoginIcon from "@mui/icons-material/Login";
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addTokenListener,
  getAccessToken,
  getUserFromToken,
} from "../../../api/jwt";
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
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        borderBottom: "1px solid #D1D5DB",
        zIndex: 1201,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo góc trái */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          component={Link}
          to="/"
          sx={{ textDecoration: "none" }}
        >
          <Box
            component="img"
            src={logo}
            sx={{ height: 50, transition: "all 0.3s ease" }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, display: "flex", letterSpacing: 0.5 }}
          >
            <Box component="span" sx={{ color: "primary.main" }}>
              iRAS
            </Box>
            <Box component="span" sx={{ color: "text.primary", mx: 0.5 }}>
              -
            </Box>
            <Box component="span" sx={{ color: "success.main" }}>
              RAG
            </Box>
          </Typography>
        </Stack>

        {/* Navigation Bar - Thay đổi tùy theo trạng thái đăng nhập */}
        <Stack
          direction="row"
          spacing={3} /* Tăng khoảng cách giữa các chữ một chút cho thoáng */
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {!role ? (
            <>
              <Button
                href="#hero"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Trang chủ
              </Button>
              <Button
                href="#features"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Tính năng
              </Button>
              <Button
                href="#team"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Đội ngũ nghiên cứu
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Trang chủ
              </Button>
              <Button
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Hệ thống RAS
              </Button>
              <Button
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Dashboard sức khỏe
              </Button>
              <Button
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Hướng dẫn bảo trì
              </Button>
              <Button
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Vật tư/Kho
              </Button>
            </>
          )}
        </Stack>

        {/* Nút Call to Action */}
        {!role ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            component={Link}
            to="/auth/login"
            sx={{
              fontWeight: 600,
              borderRadius: "50px" /* ĐỒNG BỘ NÚT PILL-SHAPE VỚI HERO BANNER */,
              px: 3,
              boxShadow: "0 4px 14px 0 rgba(42, 133, 255, 0.39)",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 6px 20px rgba(42, 133, 255, 0.4)",
              },
            }}
          >
            Đăng nhập
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={dashboardPath(role)}
            sx={{ fontWeight: 600, borderRadius: "50px", px: 3 }}
          >
            Đi tới Dashboard
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
