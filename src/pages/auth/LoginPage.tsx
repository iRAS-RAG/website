import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { Role } from "../../api/auth";
import {
  clearCurrentUser,
  currentUser,
  login,
  setCurrentUser,
} from "../../api/auth";
import * as jwt from "../../api/jwt";
import bg from "../../assets/backgrounds.png";

const LoginPage = () => {
  // ==========================================
  // LOGIC ĐƯỢC GIỮ NGUYÊN 100%
  // ==========================================
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isLoggedIn = Boolean(currentUser.id);

  const handleLogin = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setError("");
    try {
      type LoginResp = {
        token?: {
          accessToken?: string;
          refreshToken?: string;
          access_token?: string;
          refresh_token?: string;
        };
        message?: string;
      } & Record<string, unknown>;

      const resp = (await login({ email, password })) as LoginResp | null;
      const tokenObj = resp?.token ?? resp;

      function getStringField(obj: unknown, ...keys: string[]) {
        if (!obj || typeof obj !== "object") return null;
        for (const k of keys) {
          const v = (obj as Record<string, unknown>)[k];
          if (typeof v === "string" && v) return v;
        }
        return null;
      }

      const accessToken = getStringField(
        tokenObj,
        "accessToken",
        "access_token",
      );
      const refreshToken = getStringField(
        tokenObj,
        "refreshToken",
        "refresh_token",
      );

      if (!accessToken) {
        setError("Sai địa chỉ email hoặc mật khẩu!");
        return;
      }

      // store tokens
      jwt.setTokens(accessToken, refreshToken ?? null);

      // extract user info from JWT
      const userInfo = jwt.getUserFromToken(accessToken);
      const role = (userInfo.role ?? null) as Role | null;
      const id = userInfo.id || "";
      const name = userInfo.name || "User";

      // update in-app current user state (keeps guarded routes working)
      setCurrentUser({ id, name, role });

      // redirect based on role
      if (role === "Admin") navigate("/admin/dashboard");
      else if (role === "Supervisor") navigate("/supervisor/dashboard");
      else if (role === "Operator") navigate("/operator/dashboard");
      else navigate("/");
    } catch (err: unknown) {
      let msg = "Email hoặc mật khẩu không chính xác!";
      if (typeof err === "object" && err !== null) {
        const e = err as { data?: { message?: string }; message?: string };
        msg = e?.data?.message || e?.message || msg;
      }
      setError(msg);
    }
  };

  function handleLogout() {
    jwt.clearTokens();
    clearCurrentUser();
    navigate("/");
  }

  // ==========================================
  // CUSTOM STYLE CHO Ô INPUT (MODERN SaaS STYLE)
  // ==========================================
  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px", // Giảm góc bo xuống 8px tạo cảm giác kỹ thuật
      bgcolor: "#FFFFFF", // Nền trắng tinh thay vì xám nhạt
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#CBD5E1" },
      "&.Mui-focused fieldset": {
        borderColor: "#2A85FF",
        borderWidth: "1px",
        boxShadow: "0 0 0 3px rgba(42, 133, 255, 0.15)", // Hiệu ứng glow mỏng hơn
      },
    },
    // Style cho nhãn label
    "& .MuiInputLabel-root": {
      color: "#64748B",
      fontWeight: 500,
      fontSize: "0.95rem",
    },
    "& .Mui-focused .MuiInputLabel-root": {
      color: "#2A85FF",
    },
    "& .MuiInputBase-input": {
      py: "16px", // Tăng chiều cao ô input để tạo độ thoáng
      px: "14px",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* 1. BACKGROUND KÈM OVERLAY XANH NAVY VÀ LÀM MỜ (Đã tối ưu độ mờ) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(10, 25, 41, 0.75)", // Tăng overlay tối một chút
            backdropFilter: "blur(10px)", // Tăng độ mờ một chút
            WebkitBackdropFilter: "blur(10px)",
          },
          zIndex: -1,
        }}
      />

      {/* 2. AUTH CARD (Đã giảm BorderRadius xuống 16px) */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          p: { xs: 4, sm: 5 },
          borderRadius: "16px", // Giảm góc bo để nhìn chuyên nghiệp hơn
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0", // Thêm viền mỏng để định hình card
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)", // Làm mềm shadow
        }}
      >
        <Box component="form" onSubmit={handleLogin}>
          {/* 3. HEADER CỦA FORM */}
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                mb: 1.5,
                fontSize: "1.75rem",
              }}
            >
              Chào mừng trở lại
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748B", lineHeight: 1.4 }}
            >
              Vui lòng đăng nhập để tiếp tục
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* 4. INPUT FIELDS (Chuyển sang dùng Label thay vì Placeholder) */}
            <TextField
              fullWidth
              label="Địa chỉ email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#94A3B8" }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* 6. LOGIN BUTTON (Chỉnh borderRadius: "12px") */}
            {isLoggedIn ? (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  color: "#64748B",
                  borderColor: "#E2E8F0",
                  "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
                }}
              >
                Đăng xuất
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.8, // Tăng padding dọc một chút
                  borderRadius: "12px", // Chỉnh lại góc bo chuyên nghiệp hơn
                  bgcolor: "#2A85FF",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: "0 4px 14px 0 rgba(42, 133, 255, 0.2)", // Làm dịu bóng đổ
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "#1F6FDB",
                    transform: "translateY(-1px)", // Giảm độ nẩy hover xuống 1px
                    boxShadow: "0 6px 20px rgba(42, 133, 255, 0.3)",
                  },
                }}
              >
                Đăng nhập hệ thống
              </Button>
            )}
          </Stack>

          {/* 7. FOOTER */}
          <Box sx={{ mt: 5, textAlign: "center" }}>
            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                color: "#64748B",
                fontSize: "0.875rem",
                "&:hover": { color: "#0F172A" },
              }}
            >
              <ArrowBack sx={{ fontSize: 16, mr: 1 }} />
              Quay lại trang chủ
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
