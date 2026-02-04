import { Email, Lock, Login, Visibility, VisibilityOff } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Role } from "../../api/auth";
import { clearCurrentUser, currentUser, login, setCurrentUser } from "../../api/auth";
import * as jwt from "../../api/jwt";
import bg from "../../assets/backgrounds.png";

const LoginPage = () => {
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
        token?: { accessToken?: string; refreshToken?: string; access_token?: string; refresh_token?: string };
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

      const accessToken = getStringField(tokenObj, "accessToken", "access_token");
      const refreshToken = getStringField(tokenObj, "refreshToken", "refresh_token");

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
        <Box component="form" onSubmit={handleLogin}>
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
              <Button type="submit" variant="contained" fullWidth size="large" startIcon={<Login />} sx={{ py: 1.8 }}>
                Đăng nhập
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
