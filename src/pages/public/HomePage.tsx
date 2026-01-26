import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import bg from "../../assets/backgrounds.png";

export const HomePage = () => {
  return (
    <Box>
      <Box
        sx={{
          height: "85vh",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bg})`, // Đã sửa tên file
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 700 }}>
            {/* Sử dụng variant h1 từ theme (fontWeight: 800) */}
            <Typography variant="h1" gutterBottom sx={{ color: "white" }}>
              Trợ lý Bảo trì AI cho Hệ thống RAS Thông minh
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Nền tảng tích hợp dữ liệu cảm biến, dự báo rủi ro và hỗ trợ kỹ thuật bằng AI giúp tối ưu hóa quy trình nuôi cá công nghệ tuần hoàn.
            </Typography>

            <Stack direction="row" spacing={2}>
              {/* Button tự động nhận borderRadius: 8 và boxShadow từ theme */}
              <Button variant="contained" color="primary" size="large" startIcon={<CheckCircleIcon />}>
                Kiểm tra sức khỏe hệ thống
              </Button>
              <Button variant="outlined" size="large" sx={{ color: "white", borderColor: "white" }} startIcon={<ChatIcon />}>
                Trò chuyện với AI
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* STATUS BAR - Sử dụng màu success từ theme */}
      <Container maxWidth="lg" sx={{ mt: -6, position: "relative", zIndex: 10 }}>
        <Paper
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderLeft: "8px solid",
            borderColor: "success.main",
          }}
        >
          <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h3">Tóm tắt trạng thái hệ thống</Typography>
            <Typography variant="body2" color="text.secondary">
              Hệ thống đang hoạt động ổn định - 0 cảnh báo mới dựa trên dữ liệu cảm biến thời gian thực.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
export default HomePage;
