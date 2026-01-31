import {
  Email,
  Lock,
  Login,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../../assets/backgrounds.png";

// 1. Tạo danh sách tài khoản mẫu cho 3 vai trò
const MOCK_USERS = {
  ADMIN: {
    email: "admin@iras.com",
    password: "123",
    role: "admin",
    path: "/admin/dashboard",
  },
  MANAGER: {
    email: "manager@iras.com",
    password: "123",
    role: "manager",
    path: "/manager/dashboard",
  },
  TECHNICIAN: {
    email: "tech@iras.com",
    password: "123",
    role: "technician",
    path: "/technician/dashboard",
  },
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    setError("");

    // Tìm kiếm user trong danh sách mock
    const user = Object.values(MOCK_USERS).find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      // Lưu thông tin role vào localStorage để các trang khác có thể sử dụng (tạm thời)
      localStorage.setItem("userRole", user.role);
      // Điều hướng đến đúng trang dựa trên vai trò
      navigate(user.path);
    } else {
      setError("Email hoặc mật khẩu không chính xác!");
    }
  };

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
        }}
      >
        <Stack spacing={3}>
          <Typography
            variant="h2"
            align="center"
            sx={{ fontSize: "1.7rem", fontWeight: 700 }}
          >
            Đăng nhập iRAS-RAG
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Địa chỉ email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
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
            onClick={handleLogin}
            sx={{ py: 1.8 }}
          >
            Đăng nhập
          </Button>

          <Typography variant="body2" align="center">
            Mẹo: Dùng <b>tech@iras.com</b> / <b>123</b>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
