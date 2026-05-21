import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";

// Icons
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InventoryIcon from "@mui/icons-material/Inventory";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

// Components (Giả sử đã có trong dự án)
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";

// --- TYPES ---
interface Tank {
  id: string;
  name: string;
  status: "normal" | "warning" | "error";
  do: number;
  ph: number;
  temp: number;
  ammonia: number;
}

const AIAdvisory: React.FC = () => {
  const theme = useTheme();
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);

  // --- DỮ LIỆU GIẢ LẬP ---
  const tanks: Tank[] = [
    {
      id: "T01",
      name: "Bể A-01",
      status: "normal",
      do: 6.5,
      ph: 7.2,
      temp: 28.5,
      ammonia: 0.1,
    },
    {
      id: "T02",
      name: "Bể B-02",
      status: "error",
      do: 3.2,
      ph: 6.8,
      temp: 30.1,
      ammonia: 0.9,
    },
    {
      id: "T03",
      name: "Bể C-03",
      status: "warning",
      do: 5.0,
      ph: 7.5,
      temp: 29.0,
      ammonia: 0.4,
    },
    {
      id: "T04",
      name: "Bể D-04",
      status: "normal",
      do: 7.0,
      ph: 7.4,
      temp: 28.0,
      ammonia: 0.05,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.default,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <OperatorSidebar />
      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <OperatorHeader />

        {/* Container cho cột chat */}
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* ================= CỘT CHÍNH: CHAT INTERFACE ================= */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#F3F4F6",
              position: "relative",
              minWidth: 0,
            }}
          >
            {/* Header Chat */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderRadius: 0,
                height: 72,
                flexShrink: 0,
              }}
            >
              {selectedTank ? (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <WaterDropIcon color="primary" />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, lineHeight: 1.2 }}
                    >
                      Phân tích sự cố: {selectedTank.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DO: {selectedTank.do} mg/L | Ammonia:{" "}
                      {selectedTank.ammonia} ppm | Temp: {selectedTank.temp}°C
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <SmartToyOutlinedIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Trợ lý AI Phân tích iRAS
                  </Typography>
                </Stack>
              )}

              {selectedTank && (
                <Button
                  variant="outlined"
                  startIcon={<SwapHorizIcon />}
                  size="small"
                  onClick={() => setSelectedTank(null)}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Đổi bể khác
                </Button>
              )}
            </Paper>

            {/* Vùng nội dung chat */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto", minHeight: 0 }}>
              <Stack spacing={3}>
                {/* LỜI CHÀO & TANK CHIPS GỢI Ý MẶC ĐỊNH */}
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    maxWidth: "95%",
                    width: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        mt: 0.5,
                      }}
                    >
                      <SmartToyIcon sx={{ fontSize: 18, color: "white" }} />
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Paper
                        elevation={0}
                        sx={{ p: 2, borderRadius: "12px 12px 12px 0", mb: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary" }}
                        >
                          Xin chào, chúc bạn một ngày tốt lành! Vui lòng chọn
                          một bể nuôi bên dưới để tôi bắt đầu phân tích trạng
                          thái và tư vấn cho bạn.
                        </Typography>
                      </Paper>

                      {/* TANK CHIPS SELECTION */}
                      {!selectedTank && (
                        <Stack
                          direction="row"
                          spacing={1.5}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mt: 1.5 }}
                        >
                          {tanks.map((tank) => (
                            <Button
                              key={tank.id}
                              onClick={() => setSelectedTank(tank)}
                              variant="contained"
                              sx={{
                                borderRadius: "20px",
                                px: 2,
                                py: 0.8,
                                bgcolor:
                                  tank.status === "error"
                                    ? "#FEF2F2"
                                    : tank.status === "warning"
                                      ? "#FFF7ED"
                                      : "#EFF6FF",
                                color:
                                  tank.status === "error"
                                    ? "#DC2626"
                                    : tank.status === "warning"
                                      ? "#D97706"
                                      : "#2563EB",
                                boxShadow: "none",
                                border: `1px solid ${tank.status === "error" ? "#FECACA" : tank.status === "warning" ? "#FED7AA" : "#BFDBFE"}`,
                                fontWeight: 600,
                                textTransform: "none",
                                "&:hover": {
                                  bgcolor:
                                    tank.status === "error"
                                      ? "#FEE2E2"
                                      : tank.status === "warning"
                                        ? "#FFEDD5"
                                        : "#DBEAFE",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                  transform: "translateY(-1px)",
                                },
                                transition: "all 0.2s",
                              }}
                              startIcon={<WaterDropIcon fontSize="small" />}
                              endIcon={
                                tank.status === "error" ? (
                                  <WarningAmberIcon
                                    fontSize="small"
                                    color="error"
                                  />
                                ) : tank.status === "warning" ? (
                                  <WarningAmberIcon
                                    fontSize="small"
                                    color="warning"
                                  />
                                ) : null
                              }
                            >
                              {tank.name}
                            </Button>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* AI ANALYSIS ĐƯỢC KÍCH HOẠT KHI CHỌN BỂ */}
                {selectedTank && (
                  <Box
                    sx={{
                      alignSelf: "flex-start",
                      maxWidth: "95%",
                      width: "100%",
                      animation: "fadeIn 0.5s",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 32,
                          height: 32,
                          mt: 0.5,
                        }}
                      >
                        <SmartToyIcon sx={{ fontSize: 18, color: "white" }} />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Paper
                          elevation={0}
                          sx={{ p: 2, borderRadius: "12px 12px 12px 0", mb: 2 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "text.primary" }}
                          >
                            Tôi đã phân tích tình trạng{" "}
                            <strong>{selectedTank.name}</strong>. Hệ thống ghi
                            nhận mức DO là {selectedTank.do} mg/L và Ammonia là{" "}
                            {selectedTank.ammonia} ppm. Dưới đây là hướng dẫn
                            chi tiết từng bước để xử lý:
                          </Typography>
                        </Paper>

                        {/* Các bước xử lý */}
                        <Stack spacing={1.5} sx={{ mb: 2 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: "12px",
                              borderColor: "rgba(0,0,0,0.08)",
                              bgcolor: "white",
                            }}
                          >
                            <Stack direction="row" spacing={1.5}>
                              <CheckCircleOutlineIcon color="success" />
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Bước 1: Tăng oxy hòa tan ngay lập tức
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    mt: 0.5,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  Tăng công suất hệ thống sục khí lên 100%. Kiểm
                                  tra tất cả đầu sục khí có hoạt động bình
                                  thường. Mục tiêu: Đạt DO ≥ 5.5 mg/L trong 30
                                  phút.
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Stack>

                        {/* Vật tư cần thiết */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            bgcolor: "#FAFAFA",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 2 }}
                          >
                            <InventoryIcon fontSize="small" color="success" />
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              Vật tư cần thiết
                            </Typography>
                          </Stack>
                          <Stack spacing={2}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Vi sinh Bacillus
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Mã: BIO-BAC-001
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  500g
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Kho A - Kệ 3
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                sx={{
                                  minWidth: 40,
                                  height: 24,
                                  fontSize: "10px",
                                  borderRadius: "6px",
                                  boxShadow: "none",
                                }}
                              >
                                Lấy
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Input Area */}
            <Box
              sx={{
                p: 2,
                bgcolor: "white",
                borderTop: `1px solid ${theme.palette.divider}`,
                flexShrink: 0,
              }}
            >
              {!selectedTank && (
                <Typography
                  variant="caption"
                  display="block"
                  align="center"
                  sx={{ mb: 1, color: "text.disabled" }}
                >
                  Bạn cần chọn một bể ở trên để bắt đầu nhập câu hỏi.
                </Typography>
              )}
              <Paper
                variant="outlined"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "12px",
                  borderColor: theme.palette.divider,
                  opacity: selectedTank ? 1 : 0.6,
                  pointerEvents: selectedTank ? "auto" : "none",
                }}
              >
                <IconButton sx={{ p: "8px" }} aria-label="attach" size="small">
                  <AttachFileIcon
                    sx={{ color: "text.secondary", fontSize: 20 }}
                  />
                </IconButton>
                <TextField
                  sx={{
                    ml: 1,
                    flex: 1,
                    "& input::placeholder": { fontSize: "13px" },
                  }}
                  placeholder={
                    selectedTank
                      ? `Nhập câu hỏi hoặc mô tả vấn đề cho ${selectedTank.name}...`
                      : "Vui lòng chọn bể phía trên trước..."
                  }
                  variant="standard"
                  disabled={!selectedTank}
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: "13px" },
                  }}
                />
                <Button
                  disabled={!selectedTank}
                  variant="contained"
                  size="small"
                  endIcon={<SendIcon sx={{ fontSize: "16px !important" }} />}
                  sx={{
                    borderRadius: "8px",
                    px: 2,
                    height: 32,
                    fontSize: "12px",
                    fontWeight: 600,
                    boxShadow: "none",
                  }}
                >
                  Gửi
                </Button>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AIAdvisory;
