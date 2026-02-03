import { Email, Lock, Login, Visibility, VisibilityOff } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../../assets/backgrounds.png";
import type { Role } from "../../mocks/auth";
import { clearCurrentUser, currentUser, setCurrentUser } from "../../mocks/auth";

// Mock accounts (single source of truth for login stubs)
const MOCK_USERS = [
  { email: "admin@iras.com", password: "123", role: "Admin", path: "/admin/dashboard", id: "u-admin", name: "System Admin" },
  { email: "manager@iras.com", password: "123", role: "Manager", path: "/manager/dashboard", id: "u-manager", name: "Manager" },
  { email: "op@iras.com", password: "123", role: "Operator", path: "/operator/dashboard", id: "u-op", name: "Operator" },
];

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isLoggedIn = Boolean(currentUser.id);

  const handleLogin = () => {
    setError("");

    // Find user in mock list
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);

    if (user) {
      // Update mock current user so guarded routes work in-app
      setCurrentUser({ id: user.id, name: user.name, role: user.role as Role });
      // keep role in localStorage for other pages that inspect it
      localStorage.setItem("userRole", user.role);
      navigate(user.path);
    } else {
      setError("Email hoặc mật khẩu không chính xác!");
    }
  };

  function handleLogout() {
    clearCurrentUser();
    localStorage.removeItem("userRole");
    navigate("/");
  }

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
          <Typography variant="h2" align="center" sx={{ fontSize: "1.7rem", fontWeight: 700 }}>
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
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {isLoggedIn ? (
            <Button variant="outlined" fullWidth size="large" onClick={handleLogout} sx={{ py: 1.8 }}>
              Đăng xuất
            </Button>
          ) : (
            <Button variant="contained" fullWidth size="large" startIcon={<Login />} onClick={handleLogin} sx={{ py: 1.8 }}>
              Đăng nhập
            </Button>
          )}

          <Typography variant="body2" align="center">
            Mẹo: Dùng <b>op@iras.com</b> / <b>123</b>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
