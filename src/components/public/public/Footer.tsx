import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";

const Footer: React.FC = () => {
  return (
    <Box
      id="team"
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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          {/* Cột 1 */}
          <Box sx={{ flex: { xs: "100%", md: "35%" } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: "#0F172A",
              }} /* Đổi sang màu Slate đậm chuyên nghiệp hơn */
            >
              iRAS-RAG System
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                lineHeight: 1.8,
                color: "#64748B",
              }} /* Màu xám Slate dịu mắt */
            >
              Dự án nghiên cứu ứng dụng RAG trong quản lý vận hành hệ thống nông
              nghiệp thông minh, tối ưu hóa quy trình nuôi thuỷ-hải sản tuần
              hoàn bằng trí tuệ nhân tạo.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <IconButton
                size="small"
                sx={{
                  color: "#64748B",
                  bgcolor: "#F1F5F9",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "#2A85FF",
                    color: "white",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#64748B",
                  bgcolor: "#F1F5F9",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "#0077B5",
                    color: "white",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#64748B",
                  bgcolor: "#F1F5F9",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "#111827",
                    color: "white",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Cột 2 & 3 giữ nguyên cấu trúc cũ, chỉ tối ưu UI */}
          <Box sx={{ flex: { xs: "100%", md: "25%" } }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 3, color: "text.primary" }}
            >
              QUẢN LÝ VẬN HÀNH
            </Typography>
            <Stack spacing={1.5}>
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
                Ngưỡng cảm biến
              </Link>
              <Link
                href="#"
                variant="body2"
                color="text.secondary"
                underline="hover"
              >
                Cơ sở tri thức RAG
              </Link>
            </Stack>
          </Box>

          <Box sx={{ flex: { xs: "100%", md: "25%" } }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 3, color: "text.primary" }}
            >
              ĐỘI NGŨ & LIÊN HỆ
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Phòng Lab Đại học FPT
            </Typography>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              GVHD: Trương Long
            </Typography>
            <Link
              href="mailto:namptse180525@fpt.edu.vn"
              variant="body2"
              color="text.secondary"
              display="block"
              sx={{
                mb: 1,
                textDecoration: "none",
                "&:hover": { color: "primary.main" },
              }}
            >
              namptse180525@fpt.edu.vn
            </Link>
            <Link
              href="mailto:longt5@fe.edu.vn"
              variant="body2"
              color="text.secondary"
              display="block"
              sx={{
                textDecoration: "none",
                "&:hover": { color: "primary.main" },
              }}
            >
              longt5@fe.edu.vn
            </Link>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

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
