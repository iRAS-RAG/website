import { Email, Lock, Person, PersonAdd, Visibility, VisibilityOff } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, InputAdornment, Link, Paper, Snackbar, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import bg from "../../assets/backgrounds.png";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openSuccess, setOpenSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Vui lòng nhập họ và tên.";
    if (!email.trim()) e.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email không hợp lệ.";
    if (!password) e.password = "Vui lòng nhập mật khẩu.";
    else if (password.length < 6) e.password = "Mật khẩu phải ít nhất 6 ký tự.";
    if (!confirmPassword) e.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    else if (password && password !== confirmPassword) e.confirmPassword = "Mật khẩu không khớp.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;
    // Placeholder: API not ready yet — show success snackbar
    setOpenSuccess(true);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
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
            Đăng ký
          </Typography>
        </Stack>

        <Stack spacing={3.5}>
          <TextField
            fullWidth
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: "primary.main" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Địa chỉ email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "primary.main" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" type="button">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "primary.main" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" type="button">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<PersonAdd />}
            sx={{
              py: 1.8,
              fontSize: "1rem",
              boxShadow: "0 8px 16px rgba(42,133,255,0.3)",
            }}
            type="submit"
          >
            Đăng ký
          </Button>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ fontSize: "1rem" }}>
            Đã có tài khoản?{" "}
            <Link component={RouterLink} to="/auth/login" underline="hover" sx={{ fontWeight: 800, color: "primary.main" }}>
              Đăng nhập
            </Link>
          </Typography>
        </Stack>
      </Paper>

      <Snackbar open={openSuccess} autoHideDuration={4000} onClose={() => setOpenSuccess(false)}>
        <Alert severity="success" onClose={() => setOpenSuccess(false)} sx={{ width: "100%" }}>
          Đăng ký thành công (chỉ là placeholder).
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;
