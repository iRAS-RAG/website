import { Email, Lock, Login, Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, IconButton, InputAdornment, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import bg from "../../assets/backgrounds.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px)",
          transform: "scale(1.1)",
          zIndex: -1,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0, 0, 0, 0.4)",
          zIndex: -1,
        }}
      />

      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 480,
          borderRadius: 4,
          bgcolor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <Stack justifyContent="center" alignItems="center" sx={{ mb: 5, textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              display: "flex",
              gap: 0.5,
              fontSize: "1.6rem",
            }}
          ></Typography>

          <Typography variant="h2" sx={{ fontSize: "1.7rem", fontWeight: 700, mt: 1 }}>
            Đăng nhập
          </Typography>
        </Stack>

        {/* FORM */}
        <Stack spacing={3.5}>
          <TextField
            fullWidth
            label="Địa chỉ email"
            placeholder="example@gmail.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: "primary.main" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "primary.main" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<Login />}
            sx={{
              py: 1.8,
              fontSize: "1rem",
              boxShadow: "0 8px 16px rgba(42,133,255,0.3)",
            }}
          >
            Đăng nhập
          </Button>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ fontSize: "1rem" }}>
            Bạn chưa có tài khoản?{" "}
            <Link component={RouterLink} to="/auth/register" underline="hover" sx={{ fontWeight: 800, color: "primary.main" }}>
              Đăng ký ngay
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
