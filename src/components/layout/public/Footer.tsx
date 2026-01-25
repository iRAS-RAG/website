import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "white",
        pt: 8,
        pb: 4,
        borderTop: "1px solid",
        borderColor: "divider",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        {/* --- 3 cột chính --- */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          {/* Cột 1 */}
          <Box sx={{ flex: { xs: "100%", md: "30%" } }}>
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: 800, mb: 2 }}
            >
              iRAS-RAG System
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, lineHeight: 1.7 }}
            >
              Dự án nghiên cứu ứng dụng RAG trong quản lý vận hành hệ thống nông
              nghiệp thông minh, tối ưu hóa quy trình nuôi cá tuần hoàn bằng trí
              tuệ nhân tạo.
            </Typography>

            <Stack direction="row" spacing={1}>
              <IconButton size="small" color="primary">
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <LinkedInIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <GitHubIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Cột 2 */}
          <Box sx={{ flex: { xs: "100%", md: "30%" } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              QUẢN LÝ VẬN HÀNH
            </Typography>

            <Box sx={{ display: "flex" }}>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Link
                  href="#"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  Báo cáo Downtime
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  Lịch hiệu chuẩn
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  Dự báo vật tư
                </Link>
              </Stack>

              <Stack spacing={1} sx={{ flex: 1 }}>
                <Link
                  href="#"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  Ngưỡng cảm biến
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  Hệ thống RAG
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  Nhật ký bảo trì
                </Link>
              </Stack>
            </Box>
          </Box>

          {/* Cột 3 */}
          <Box sx={{ flex: { xs: "100%", md: "25%" } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              LIÊN HỆ PHÒNG LAB
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              FPT Education / Đại học FPT
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              GVHD: Trương Long
            </Typography>

            <Link
              href="mailto:namptse180525@fpt.edu.vn"
              variant="body2"
              display="block"
              sx={{ mt: 1 }}
            >
              namptse180525@fpt.edu.vn
            </Link>

            <Link
              href="mailto:longt5@fe.edu.vn"
              variant="body2"
              display="block"
            >
              longt5@fe.edu.vn
            </Link>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Bản quyền */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © 2026 Nhóm SP26SE102. Phát triển cho mục đích nghiên cứu nông
            nghiệp thông minh.
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link
              href="#"
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="#"
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              Điều khoản sử dụng
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
