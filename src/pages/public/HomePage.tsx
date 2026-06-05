import LockIcon from "@mui/icons-material/Lock";
import SensorsIcon from "@mui/icons-material/Sensors";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Button, Container, Paper, Typography, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import bg from "../../assets/backgrounds.png";

export const HomePage = () => {
  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* ================= HERO SECTION ================= */}
      <Box
        id="hero"
        sx={{
          minHeight: "90vh",
          position: "relative",
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          pt: 10,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.9) 100%)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "80%", lg: "70%" } }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2.5,
                  py: 1,
                  mb: 4,
                  borderRadius: "50px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 24px -4px rgba(0,0,0,0.2)",
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{ color: "#34D399", fontSize: 20 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "white", fontWeight: 500, letterSpacing: 0.5 }}
                >
                  Hệ thống đang hoạt động ổn định — Sẵn sàng kết nối
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  lineHeight: 1.2,
                  background: "linear-gradient(to right, #ffffff, #93C5FD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Trợ lý Bảo trì AI cho Hệ thống RAS Thông minh
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 5,
                  color: "#94A3B8",
                  fontWeight: 400,
                  lineHeight: 1.7,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  px: { xs: 2, md: 10 },
                }}
              >
                Nền tảng công nghệ RAG kết hợp dữ liệu cảm biến thời gian thực
                để tối ưu hóa vận hành hệ thống nuôi cá tuần hoàn.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/auth/login"
                startIcon={<LockIcon />}
                sx={{
                  px: 4,
                  py: 1.8,
                  fontSize: "1.1rem",
                  borderRadius: "50px",
                  boxShadow: "0 10px 25px -5px rgba(42,133,255,0.5)",
                  textTransform: "none",
                  fontWeight: 600,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 20px 25px -5px rgba(42,133,255,0.6)",
                  },
                }}
              >
                Đăng nhập hệ thống
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ================= FEATURES SECTION ================= */}
      <Box id="features" sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Chip
              label="GIẢI PHÁP TỐI ƯU"
              sx={{
                mb: 2,
                bgcolor: "#E0F2FE",
                color: "#0284C7",
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: "8px",
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                mb: 2,
                fontSize: "2.25rem",
              }}
            >
              Chức năng cốt lõi
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#64748B",
                maxWidth: "600px",
                mx: "auto",
                fontSize: "1.1rem",
              }}
            >
              Nâng tầm quy trình vận hành hệ thống RAS với sức mạnh AI.
            </Typography>
          </Box>

          {/* ====== Feature Cards (Box version) ====== */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              justifyContent: "center",
            }}
          >
            {/* CARD TEMPLATE */}
            {[
              {
                icon: <SensorsIcon sx={{ fontSize: 40 }} />,
                bg: "#EFF6FF",
                color: "#3B82F6",
                title: "Theo dõi cảm biến",
                desc: "Theo dõi pH, DO, Nhiệt độ liên tục qua hệ thống cảm biến.",
              },
              {
                icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
                bg: "#F0FDF4",
                color: "#22C55E",
                title: "Trợ lý AI chuyên sâu",
                desc: "Giải đáp kỹ thuật theo tri thức RAG cho hệ thống RAS.",
              },
              {
                icon: <QueryStatsIcon sx={{ fontSize: 40 }} />,
                bg: "#FEFCE8",
                color: "#EAB308",
                title: "Bảo trì dự đoán",
                desc: "Phát hiện sớm rủi ro thiết bị và gợi ý lịch bảo trì.",
              },
            ].map((item, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  width: { xs: "100%", sm: "70%", md: "30%" },
                  p: 5,
                  borderRadius: 4,
                  border: "1px solid #E2E8F0",
                  textAlign: "center",
                  transition: "0.4s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "24px",
                    bgcolor: item.bg,
                    color: item.color,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mx: "auto",
                    mb: 4,
                  }}
                >
                  {item.icon}
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {item.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "#64748B" }}>
                  {item.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
