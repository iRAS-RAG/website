import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  IconButton,
  Divider,
  Chip,
  LinearProgress,
  Button,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
  useTheme,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
// import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// Components (Giả sử đã có trong dự án)
import { TechnicianSidebar } from "../../components/technician/TechnicianSidebar";
import { TechnicianHeader } from "../../components/technician/TechnicianHeader";

const AIAdvisory: React.FC = () => {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterType, setFilterType] = useState("Tất cả");

  // --- DỮ LIỆU GIẢ LẬP ---

  // 1. Lịch sử chat
  const chatHistory = [
    {
      id: 1,
      title: "Xử lý DO thấp - Bể B-02",
      time: "10:30 AM",
      urgent: true,
      snippet: "Làm thế nào để xử lý mức DO thấp...",
    },
    {
      id: 2,
      title: "Sửa máy bơm định kỳ",
      time: "Hôm qua",
      urgent: false,
      snippet: "Quy trình bảo trì máy bơm nước...",
    },
    {
      id: 3,
      title: "Điều chỉnh pH bể A-01",
      time: "2 ngày trước",
      urgent: false,
      snippet: "Cân chỉnh nồng độ pH đang...",
    },
    {
      id: 4,
      title: "Kiểm tra cảm biến nhiệt độ",
      time: "01/01/2024",
      urgent: false,
      snippet: "Cảm biến nhiệt độ hiển thị sai...",
    },
  ];

  // 2. Tài liệu tham khảo (Cập nhật đầy đủ field cho giao diện mới)
  const documents = [
    {
      name: "SOP-001: Xử lý khẩn cấp DO thấp",
      tag: "Quy trình",
      date: "15/12/2023",
      relevance: 98,
      size: "2.4 MB",
      type: "SOP",
      color: "success", // Xanh lá
    },
    {
      name: "SOP-005: Quy trình xử lý Ammonia cao",
      tag: "Quy trình",
      date: "20/11/2023",
      relevance: 95,
      size: "1.8 MB",
      type: "SOP",
      color: "success",
    },
    {
      name: "Manual: Hệ thống sục khí Blower XYZ-500",
      tag: "Hướng dẫn",
      date: "01/10/2023",
      relevance: 87,
      size: "5.2 MB",
      type: "MANUAL",
      color: "warning", // Cam
    },
    {
      name: "SOP-012: Điều chỉnh pH nước nuôi",
      tag: "Quy trình",
      date: "10/06/2023",
      relevance: 62,
      size: "1.5 MB",
      type: "SOP",
      color: "warning",
    },
    {
      name: "Lịch sử bảo trì Bể B-02 (2023)",
      tag: "Bảo trì",
      date: "01/01/2024",
      relevance: 75,
      size: "1.1 MB",
      type: "HISTORY",
      color: "inherit", // Xám
    },
    {
      name: "Manual: Cảm biến DO Model S-400",
      tag: "Hướng dẫn",
      date: "15/09/2023",
      relevance: 45,
      size: "2.7 MB",
      type: "MANUAL",
      color: "primary", // Xanh dương
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <TechnicianSidebar />
      <Box
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TechnicianHeader />

        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          {/* ================= CỘT TRÁI: LỊCH SỬ (280px) ================= */}
          <Box
            sx={{
              width: 280,
              borderRight: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: "column",
              bgcolor: "white",
            }}
          >
            {/* 1. Header & Search */}
            <Box sx={{ p: 2, pb: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: "1rem" }}
                >
                  Lịch sử trò chuyện
                </Typography>
                <IconButton size="small">
                  <MoreHorizIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                </IconButton>
              </Stack>

              <TextField
                fullWidth
                size="small"
                placeholder="Tìm cuộc trò chuyện..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        fontSize="small"
                        sx={{ color: "text.secondary", fontSize: "1.1rem" }}
                      />
                    </InputAdornment>
                  ),
                  style: { fontSize: "13px" }, // Chữ nhập vào nhỏ gọn
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#F9FAFB",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                    "& input::placeholder": { fontSize: "13px" }, // Chữ placeholder nhỏ
                  },
                }}
              />
            </Box>

            <List sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
              {chatHistory.map((chat, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <ListItem key={chat.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => setSelectedIndex(idx)}
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        borderRadius: "8px",
                        border: isSelected
                          ? `1px solid ${theme.palette.primary.light}`
                          : "1px solid transparent",
                        bgcolor: isSelected
                          ? "#F0F7FF !important"
                          : "transparent",
                        "&:hover": { bgcolor: "#F9FAFB" },
                        py: 1.5,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ width: "100%", mb: 0.5 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 700 : 600,
                            flex: 1,
                            color: isSelected ? "primary.main" : "text.primary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.85rem",
                          }}
                        >
                          {chat.title}
                        </Typography>
                        {chat.urgent && (
                          <Box
                            component="span"
                            sx={{
                              bgcolor: "error.light",
                              borderRadius: "50%",
                              width: 6,
                              height: 6,
                            }}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.3,
                          fontSize: "0.75rem",
                        }}
                      >
                        {chat.snippet}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          color: "text.disabled",
                          fontSize: "0.65rem",
                        }}
                      >
                        {chat.time}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {/* 3. Footer Button (Cuộc trò chuyện mới) */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />} // Icon dấu cộng
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  boxShadow: "none",
                  py: 1,
                  bgcolor: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                Cuộc trò chuyện mới
              </Button>
            </Box>
          </Box>

          {/* ================= CỘT GIỮA: CHAT INTERFACE ================= */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#F3F4F6", // Màu nền xám nhạt của vùng chat
              position: "relative",
            }}
          >
            {/* Vùng nội dung chat */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
              <Stack spacing={3}>
                {/* --- User Message 1 --- */}
                <Box sx={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-end"
                    justifyContent="flex-end"
                  >
                    {/* Bong bóng chat */}
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: theme.palette.primary.main, // Màu xanh dương
                          color: "white",
                          borderRadius: "12px 12px 0 12px", // Bo góc kiểu chat
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          Bể B-02 đang có mức DO rất thấp (3.2 mg/L) và Ammonia
                          cao (0.9 ppm). Tôi cần hướng dẫn xử lý khẩn cấp.
                        </Typography>
                      </Paper>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          color: "text.secondary",
                          fontSize: "0.7rem",
                        }}
                      >
                        10:30
                      </Typography>
                    </Box>
                    {/* Avatar User */}
                    <Avatar sx={{ bgcolor: "#9CA3AF", width: 32, height: 32 }}>
                      <PersonIcon sx={{ fontSize: 20, color: "white" }} />
                    </Avatar>
                  </Stack>
                </Box>

                {/* --- AI Response 1 --- */}
                {/* --- AI Response 1 (Phân tích & Hướng dẫn) --- */}
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    maxWidth: "95%",
                    width: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    {/* Avatar AI */}
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
                      {/* 1. Phần mở đầu text */}
                      <Paper
                        elevation={0}
                        sx={{ p: 2, borderRadius: "12px 12px 12px 0", mb: 2 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary" }}
                        >
                          Tôi đã phân tích tình trạng Bể B-02 và phát hiện đây
                          là tình huống nghiêm trọng cần xử lý ngay. Dưới đây là
                          hướng dẫn chi tiết từng bước:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            color: "text.secondary",
                          }}
                        >
                          10:31
                        </Typography>
                      </Paper>

                      {/* 2. Các bước xử lý (Steps) */}
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        {/* Bước 1: Hoàn thành (Xanh lá) */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            borderColor: "rgba(0,0,0,0.08)",
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
                                tra tất cả đầu sục khí có hoạt động bình thường.
                                Mục tiêu: Đạt DO ≥ 5.5 mg/L trong 30 phút.
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>

                        {/* Bước 2: Hoàn thành (Xanh lá) */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            borderColor: "rgba(0,0,0,0.08)",
                          }}
                        >
                          <Stack direction="row" spacing={1.5}>
                            <CheckCircleOutlineIcon color="success" />
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                Bước 2: Xử lý Ammonia
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
                                Thay nước 30% (khoảng 300 lít nếu bể 1,000 lít).
                                Bổ sung vi sinh Bacillus với liều lượng 5g/m³
                                nước để phân hủy NH3.
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>

                        {/* Bước 3: Đang chờ (Cam) */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            borderColor: "rgba(0,0,0,0.08)",
                          }}
                        >
                          <Stack direction="row" spacing={1.5}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                border: "1px solid #F59E0B",
                                color: "#F59E0B",
                                bgcolor: "#FFF7ED",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              3
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                Bước 3: Điều chỉnh pH
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
                                Thêm vôi CaCO3 với liều lượng 500 gram/m³ để
                                nâng pH từ 6.7 lên 7.0-7.5. Hòa tan vôi trong
                                nước trước khi rải đều.
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>

                        {/* Bước 4: Đang chờ (Cam) */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            borderColor: "rgba(0,0,0,0.08)",
                          }}
                        >
                          <Stack direction="row" spacing={1.5}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                border: "1px solid #F59E0B",
                                color: "#F59E0B",
                                bgcolor: "#FFF7ED",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              4
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                Bước 4: Giảm nhiệt độ
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
                                Tăng lưu lượng nước tuần hoàn 20% để giảm nhiệt
                                độ từ 30.1°C xuống 28-29°C. Kiểm tra hệ thống
                                làm mát.
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Stack>

                      {/* 3. Tài liệu tham khảo (Box xanh nhạt) */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: "12px",
                          bgcolor: "#EFF6FF", // Nền xanh nhạt
                          border: "1px solid #BFDBFE",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <DescriptionIcon color="primary" fontSize="small" />
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: "primary.main" }}
                          >
                            Tài liệu tham khảo
                          </Typography>
                        </Stack>
                        <Stack spacing={1}>
                          {[
                            "SOP-001: Xử lý khẩn cấp DO thấp",
                            "SOP-005: Quy trình xử lý Ammonia cao",
                            "Manual: Hệ thống sục khí Blower XYZ-500",
                          ].map((text, i) => (
                            <Stack
                              key={i}
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "primary.main",
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                {text}
                              </Typography>
                              <LinkIcon
                                sx={{ fontSize: 14, color: "primary.main" }}
                              />
                            </Stack>
                          ))}
                        </Stack>
                      </Paper>

                      {/* 4. Vật tư cần thiết */}
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, borderRadius: "12px", bgcolor: "#FAFAFA" }}
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
                          {/* Item 1 */}
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
                          <Divider sx={{ borderStyle: "dashed" }} />

                          {/* Item 2 */}
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
                                Vôi CaCO3
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Mã: CHEM-CA0-002
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                5kg
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Kho B - Kệ 1
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
                          <Divider sx={{ borderStyle: "dashed" }} />

                          {/* Item 3 */}
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
                                Đầu sục khí dự phòng
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Mã: PART-AIR-015
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                2 cái
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Kho A - Kệ 5
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

                {/* --- User Message 2 --- */}
                <Box sx={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-end"
                    justifyContent="flex-end"
                  >
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: theme.palette.primary.main,
                          color: "white",
                          borderRadius: "12px 12px 0 12px",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          Đã tăng công suất sục khí lên 100% và thay nước 30%.
                          Hiện tại DO đã tăng lên 5.3 mg/L. Tiếp theo tôi cần
                          làm gì?
                        </Typography>
                      </Paper>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          color: "text.secondary",
                          fontSize: "0.7rem",
                        }}
                      >
                        11:05
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "#9CA3AF", width: 32, height: 32 }}>
                      <PersonIcon sx={{ fontSize: 20, color: "white" }} />
                    </Avatar>
                  </Stack>
                </Box>

                {/* --- AI Response 2 --- */}
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
                        sx={{
                          p: 2,
                          borderRadius: "12px 12px 12px 0",
                          mb: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Rất tốt! DO đã cải thiện đáng kể. Bây giờ hãy tiếp tục
                          với các bước tiếp theo để ổn định hoàn toàn môi trường
                          bể:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          11:06
                        </Typography>
                      </Paper>

                      <Stack spacing={1.5}>
                        {/* Bước 5 */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            borderColor: "rgba(0,0,0,0.08)",
                          }}
                        >
                          <Stack direction="row" spacing={1.5}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                border: "1px solid #F59E0B",
                                color: "#F59E0B",
                                bgcolor: "#FFF7ED",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              5
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                Bước 5: Theo dõi liên tục
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
                                Kiểm tra DO mỗi 15 phút trong 2 giờ tới. Nếu DO
                                giảm xuống dưới 5.5 mg/L, cần kiểm tra lại hệ
                                thống sục khí.
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>

                        {/* Bước 6 */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            borderColor: "rgba(0,0,0,0.08)",
                          }}
                        >
                          <Stack direction="row" spacing={1.5}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                border: "1px solid #F59E0B",
                                color: "#F59E0B",
                                bgcolor: "#FFF7ED",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              6
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                Bước 6: Ghi nhật ký
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
                                Ghi lại tất cả các thông số và hành động đã thực
                                hiện vào hệ thống để theo dõi và phân tích sau
                                này.
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
            {/* Input Area */}
            <Box
              sx={{
                p: 2,
                bgcolor: "white",
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1.5, overflowX: "auto", pb: 0.5 }}
              >
                {[
                  "Xử lý DO thấp",
                  "Kiểm tra máy bơm",
                  "Quy trình điều chỉnh pH",
                ].map((prompt) => (
                  <Chip
                    key={prompt}
                    label={prompt}
                    icon={<SmartToyIcon style={{ fontSize: 14 }} />}
                    onClick={() => {}}
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      borderRadius: "8px",
                      bgcolor: "background.paper",
                      "&:hover": { bgcolor: theme.palette.action.hover },
                    }}
                  />
                ))}
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "12px",
                  borderColor: theme.palette.divider,
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <IconButton sx={{ p: "8px" }} aria-label="attach" size="small">
                  {/* Giảm kích thước icon đính kèm */}
                  <AttachFileIcon
                    sx={{ color: "text.secondary", fontSize: 20 }}
                  />
                </IconButton>
                <TextField
                  sx={{
                    ml: 1,
                    flex: 1,
                    // Chỉnh kích thước chữ Placeholder
                    "& input::placeholder": {
                      fontSize: "13px",
                    },
                  }}
                  placeholder="Nhập câu hỏi hoặc mô tả vấn đề..."
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    // Chỉnh kích thước chữ khi nhập
                    style: { fontSize: "13px" },
                  }}
                />
                <Button
                  variant="contained"
                  size="small" // Thu nhỏ nút Gửi
                  endIcon={<SendIcon sx={{ fontSize: "16px !important" }} />} // Thu nhỏ icon Gửi
                  sx={{
                    borderRadius: "8px",
                    px: 2,
                    height: 32, // Giới hạn chiều cao nút thấp hơn
                    fontSize: "12px", // Chữ trong nút nhỏ hơn
                    fontWeight: 600,
                    boxShadow: "none",
                  }}
                >
                  Gửi
                </Button>
              </Paper>

              <Typography
                variant="caption"
                display="block"
                align="center"
                sx={{ mt: 1, color: "text.disabled", fontSize: "0.7rem" }}
              >
                AI Advisor được đào tạo trên dữ liệu công nghệ nuôi trồng thủy
                sản iRAS. Kiểm tra kỹ thông tin trước khi áp dụng.
              </Typography>
            </Box>
          </Box>

          {/* ================= CỘT PHẢI: TÀI LIỆU (320px) ================= */}
          <Box
            sx={{
              width: 320,
              borderLeft: `1px solid ${theme.palette.divider}`,
              bgcolor: "white",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header & Filters */}
            <Box sx={{ p: 2, pb: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 0.5 }}
              >
                <DescriptionIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Tài liệu tham khảo
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2 }}
              >
                Tài liệu liên quan được AI gợi ý
              </Typography>

              <Stack direction="row" spacing={1}>
                {["Tất cả", "SOP", "Manual", "Bảo trì"].map((label) => {
                  const isActive = filterType === label;
                  return (
                    <Button
                      key={label}
                      variant={isActive ? "contained" : "text"}
                      size="small"
                      onClick={() => setFilterType(label)}
                      sx={{
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                        height: 28,
                        minWidth: "auto",
                        px: 2,
                        bgcolor: isActive
                          ? theme.palette.primary.main
                          : "#F3F4F6",
                        color: isActive ? "white" : "text.secondary",
                        "&:hover": {
                          bgcolor: isActive
                            ? theme.palette.primary.dark
                            : "#E5E7EB",
                        },
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Stack>
            </Box>

            <Divider sx={{ my: 1, opacity: 0.5 }} />

            <List sx={{ flexGrow: 1, overflowY: "auto", p: 2, pt: 0 }}>
              {documents.map((doc, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: "16px",
                    border: `1px solid #E5E7EB`,
                    position: "relative",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      borderColor: theme.palette.primary.light,
                    },
                  }}
                >
                  {/* Top: Icon & Title */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{ mb: 1.5 }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor:
                          doc.type === "SOP"
                            ? "#EFF6FF" // Blue bg
                            : doc.type === "MANUAL"
                              ? "#ECFDF5" // Green bg
                              : "#FFF7ED", // Orange bg
                        color:
                          doc.type === "SOP"
                            ? "#3B82F6"
                            : doc.type === "MANUAL"
                              ? "#10B981"
                              : "#F97316",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {doc.type === "SOP" ? (
                        <DescriptionIcon fontSize="small" />
                      ) : doc.type === "MANUAL" ? (
                        <TextSnippetIcon fontSize="small" />
                      ) : (
                        <CheckCircleOutlineIcon fontSize="small" />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          lineHeight: 1.3,
                          mb: 0.5,
                          color: "text.primary",
                        }}
                      >
                        {doc.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            bgcolor: "#F3F4F6",
                            px: 0.8,
                            py: 0.2,
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "text.secondary",
                          }}
                        >
                          {doc.tag}
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "11px" }}
                        >
                          {doc.date}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Middle: Relevance Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "11px", color: "text.secondary" }}
                      >
                        Độ liên quan
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          fontSize: "11px",
                          color:
                            doc.color === "success"
                              ? theme.palette.success.main
                              : doc.color === "warning"
                                ? theme.palette.warning.main
                                : doc.color === "primary"
                                  ? theme.palette.primary.main
                                  : "text.secondary",
                        }}
                      >
                        {doc.relevance}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={doc.relevance}
                      // SỬA DÒNG NÀY: Thay 'as any' bằng các giá trị cụ thể
                      color={
                        doc.color as
                          | "primary"
                          | "secondary"
                          | "error"
                          | "info"
                          | "success"
                          | "warning"
                          | "inherit"
                      }
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "#F3F4F6",
                      }}
                    />
                  </Box>

                  {/* Bottom: Size & Download Button */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, color: "text.secondary" }}
                    >
                      {doc.size}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={
                        <CloudDownloadOutlinedIcon
                          sx={{ fontSize: "16px !important" }}
                        />
                      }
                      sx={{
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "none",
                        height: 28,
                        boxShadow: "none",
                        bgcolor: "#3B82F6",
                        "&:hover": {
                          bgcolor: "#2563EB",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      Tải về
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </List>

            {/* Footer Button */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DescriptionIcon />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: theme.palette.divider,
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    bgcolor: "transparent",
                  },
                }}
              >
                Xem tất cả tài liệu
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AIAdvisory;
