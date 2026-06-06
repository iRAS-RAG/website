import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Collapse,
  Tooltip,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { alertApi } from "../../api/alerts";
import { advisoryApi } from "../../api/advisory";
import type { AdvisoryChatResponse } from "../../api/advisory";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { aiSuggestionCache } from "../../cache/aiSuggestionCache";

// --- Định dạng câu trả lời AI (giống AIAdvisory) ---
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const RAW_URL_RE = /https?:\/\/[^\s)]+/g;

const formatRawUrlDisplay = (url: string): string => {
  try {
    const lastSegment = url.split("/").pop() || url;
    const filename = lastSegment.split("?")[0].split("#")[0];
    const cleaned = filename.replace(/_[a-z0-9]{6,}(\.[a-z]+)$/i, "$1");
    return decodeURIComponent(cleaned);
  } catch {
    return url;
  }
};

interface AISegment {
  type: "text" | "bold" | "link";
  content: string;
  url?: string;
}

function parseBold(text: string): AISegment[] {
  const segs: AISegment[] = [];
  const parts = text.split(/\*\*([\s\S]+?)\*\*/g);
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    segs.push({ type: i % 2 === 0 ? "text" : "bold", content: parts[i] });
  }
  return segs;
}

function parseRawUrlsInText(text: string): AISegment[] {
  if (!text) return [];
  const segs: AISegment[] = [];
  const re = new RegExp(RAW_URL_RE.source, "g");
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cursor) segs.push(...parseBold(text.slice(cursor, m.index)));
    let url = m[0];
    if (url.endsWith(")")) url = url.slice(0, -1);
    segs.push({ type: "link", content: formatRawUrlDisplay(url), url });
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) segs.push(...parseBold(text.slice(cursor)));
  return segs;
}

function parseAiResponse(text: string): AISegment[] {
  if (!text) return [];
  const segs: AISegment[] = [];
  const positions: Array<{ start: number; end: number; text: string; url: string }> = [];
  let m: RegExpExecArray | null;
  const mdRe = new RegExp(MD_LINK_RE.source, "g");
  while ((m = mdRe.exec(text)) !== null) {
    positions.push({ start: m.index, end: m.index + m[0].length, text: m[1], url: m[2] });
  }
  let cursor = 0;
  for (const pos of positions) {
    if (cursor < pos.start) segs.push(...parseRawUrlsInText(text.slice(cursor, pos.start)));
    segs.push({ type: "link", content: pos.text, url: pos.url });
    cursor = pos.end;
  }
  if (cursor < text.length) segs.push(...parseRawUrlsInText(text.slice(cursor)));
  return segs;
}

// 1. CẬP NHẬT INTERFACE: Xóa level, sửa status
export interface AlertData {
  id: string | number;
  time: string;
  sensorCode: string;
  sensorName: string;
  value: string;
  limit: string;
  tank: string;
  tankId: string;
  staff: string;
  status: "Đang xử lý" | "Chờ xử lý" | "Đóng sự cố" | "Đã bỏ qua";
  hasCorrectiveAction: boolean;
}

interface AlertDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: AlertData | null;
  onStatusChange?: () => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  open,
  onClose,
  data,
  onStatusChange,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [pendingStatus, setPendingStatus] = useState<"Acknowledged" | "Dismissed" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Local status override: used to stay open and show new buttons after "Tiếp nhận"
  const [localStatus, setLocalStatus] = useState<AlertData["status"] | null>(null);
  const currentStatus = localStatus ?? data?.status;

  // --- AI tư vấn tự động khi mở modal ---
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiExpanded, setAiExpanded] = useState(true);

  // Cache module-level: giữa liệu khi component unmount/remount

  const constructPrompt = (d: AlertData): string =>
    `${d.tank} đang có chỉ số ${d.sensorName} là ${d.value} ` +
    `(vượt ngưỡng an toàn ${d.limit}). ` +
    `Hãy hướng dẫn tôi quy trình xử lý SOP khẩn cấp cho tình huống này.`;

  const fetchAiSuggestion = useCallback((alertId: string | number, tankId: string) => {
    setAiResponse(null);
    setAiError(null);
    setAiLoading(true);
    setAiExpanded(true);

    // Bước 1: thử lấy khuyến nghị đã được backend tạo tự động
    alertApi
      .getRecommendation(String(alertId))
      .then((res: unknown) => {
        const recData = (res as { data?: { suggestionText?: string } })?.data;
        const response = recData?.suggestionText?.trim() || null;
        if (response) {
          aiSuggestionCache.set(alertId, { response, error: null });
          setAiResponse(response);
          setAiLoading(false);
          return;
        }
        // recommendation rỗng → fallback
        throw new Error("empty_recommendation");
      })
      .catch(() => {
        // Bước 2: fallback — gọi advisory chat API trực tiếp
        const prompt = constructPrompt(data!);
        return advisoryApi.chat(tankId, prompt).then((res: AdvisoryChatResponse) => {
          const response = res.answer?.trim() || null;
          const error = !response ? "AI chưa trả về nội dung tư vấn." : null;
          aiSuggestionCache.set(alertId, { response, error });
          setAiResponse(response);
          setAiError(error);
        });
      })
      .catch((err: unknown) => {
        console.error("Lỗi gọi AI tư vấn:", err);
        const error = "Không thể kết nối tới trợ lý AI. Vui lòng thử lại sau.";
        aiSuggestionCache.set(alertId, { response: null, error });
        setAiError(error);
      })
      .finally(() => {
        setAiLoading(false);
      });
  }, [data]);

  // Khi mở modal (data thay đổi), kiểm tra cache trước, chỉ gọi API nếu chưa có
  useEffect(() => {
    if (!data) return;
    setLocalStatus(null);

    const cached = aiSuggestionCache.get(data.id);
    if (cached) {
      // Có cache → show luôn, không gọi lại API
      setAiResponse(cached.response);
      setAiError(cached.error);
      setAiLoading(false);
      setAiExpanded(true);
      return;
    }

    // Chưa có cache → gọi API
    fetchAiSuggestion(data.id, data.tankId);
  }, [data?.id, data?.tankId]);

  // Regenerate: xoá cache cho alert hiện tại và gọi lại API
  const handleRegenerate = () => {
    if (!data || aiLoading) return;
    aiSuggestionCache.delete(data.id);
    fetchAiSuggestion(data.id, data.tankId);
  };

  // Task 1: chuyển sang trang AI Advisor với prompt mở đầu điền sẵn
  const handleConsultAI = () => {
    if (!data) return;
    const prompt = constructPrompt(data);
    navigate("/operator/ai-advisory", {
      state: {
        tankId: data.tankId,
        tankName: data.tank,
        prefillPrompt: prompt,
        autoSend: true,
      },
    });
    onClose();
  };

  const handleGoToCorrectiveAction = () => {
    if (!data) return;
    navigate("/operator/maintenance", {
      state: { openCreate: true, alertId: String(data.id) },
    });
    onClose();
  };

  const handleStatusConfirm = async () => {
    if (!data || !pendingStatus) return;
    setSubmitting(true);
    try {
      await alertApi.updateStatus(String(data.id), pendingStatus);
      onStatusChange?.();
      if (pendingStatus === "Acknowledged") {
        // Stay open, show "Đã xử lý" + "Tham vấn AI"
        setLocalStatus("Đang xử lý");
        setPendingStatus(null);
      } else {
        // Dismissed — close confirmation first, then the modal.
        setPendingStatus(null);
        onClose();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      setPendingStatus(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) return null;

  // Cố định một màu đỏ cho tất cả các cảnh báo (thay vì phụ thuộc vào Level)
  const alertTheme = {
    main: theme.palette.error.main,
    light: theme.palette.error.light,
    bg: "#FEF2F2",
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Chi tiết cảnh báo
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* Thông tin cơ bản */}
        <Stack direction="row" spacing={2} mb={2}>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                fontSize: "10px",
                textTransform: "uppercase",
              }}
            >
              Thời gian
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {data.time}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                fontSize: "10px",
                textTransform: "uppercase",
              }}
            >
              Bể ảnh hưởng
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {data.tank}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} mb={2}>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: "10px", textTransform: "uppercase" }}
            >
              Cảm biến
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {data.sensorCode}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: "10px", textTransform: "uppercase" }}
            >
              Trạng thái
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                ...(currentStatus === "Đang xử lý" && { color: theme.palette.primary.main }),
                ...(currentStatus === "Chờ xử lý" && { color: theme.palette.warning.main }),
                ...(currentStatus === "Đóng sự cố" && { color: theme.palette.success.main }),
                ...(currentStatus === "Đã bỏ qua" && { color: theme.palette.text.secondary }),
              }}
            >
              {currentStatus}
            </Typography>
          </Box>
        </Stack>

        {/* CÂU THÔNG BÁO: Dùng sensorName */}
        <Typography
          variant="body2"
          sx={{
            p: 2,
            bgcolor: alertTheme.bg,
            borderRadius: "12px",
            color: alertTheme.main,
            mb: 3,
            fontWeight: 500,
            border: `1px solid ${alertTheme.light}`,
          }}
        >
          Giá trị <strong>{data.sensorName}</strong> đang ở mức {data.value},
          vượt ngưỡng an toàn ({data.limit}). Cần kiểm tra và xử lý ngay.
        </Typography>

        {/* So sánh giá trị */}
        <Stack direction="row" spacing={2} mb={3}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              border: `1px solid ${alertTheme.light}`,
              borderRadius: "16px",
              bgcolor: "#fff",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              GIÁ TRỊ VƯỢT NGƯỠNG BAN ĐẦU
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: alertTheme.main }}
            >
              {data.value}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: alertTheme.main }}
            >
              <TrendingDownIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Bất thường
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              border: `1px solid ${theme.palette.success.light}`,
              borderRadius: "16px",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              NGƯỠNG AN TOÀN
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: theme.palette.success.main }}
            >
              {data.limit}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.success.main, fontWeight: 600 }}
            >
              Mức tối ưu
            </Typography>
          </Box>
        </Stack>

        {/* ---- AI TƯ VẤN TỰ ĐỘNG ---- */}
        <Box
          sx={{
            mb: 3,
            borderRadius: "12px",
            border: `1px solid ${
              aiError ? theme.palette.error.light : theme.palette.primary.light
            }`,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              bgcolor: aiError ? "#FEF2F2" : "#EFF6FF",
              cursor: "pointer",
            }}
            onClick={() => !aiLoading && setAiExpanded((prev) => !prev)}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              {aiLoading ? (
                <CircularProgress size={18} />
              ) : (
                <LightbulbOutlinedIcon
                  sx={{
                    fontSize: 20,
                    color: aiError ? theme.palette.error.main : theme.palette.primary.main,
                  }}
                />
              )}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: aiError ? theme.palette.error.main : theme.palette.primary.main,
                }}
              >
                {aiLoading
                  ? "AI đang phân tích..."
                  : aiError
                    ? "AI tư vấn chưa sẵn sàng"
                    : "Gợi ý từ AI"}
              </Typography>
            </Stack>

            {/* Actions: Regenerate + Expand/Collapse */}
            {!aiLoading && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                {/* Nút Regenerate — chỉ hiện khi đã có phản hồi (kể cả lỗi) */}
                {(aiResponse || aiError) && (
                  <Tooltip title="Tạo lại gợi ý AI">
                    <IconButton
                      size="small"
                      sx={{ p: 0.5 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegenerate();
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton size="small" sx={{ p: 0.5 }}>
                  {aiExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Stack>
            )}
          </Box>

          {/* Body */}
          <Collapse in={aiExpanded && !aiLoading}>
            <Box sx={{ p: 2, bgcolor: "#fff" }}>
              {aiLoading ? (
                <Stack spacing={1}>
                  <Box
                    sx={{
                      height: 12,
                      width: "100%",
                      bgcolor: "#E2E8F0",
                      borderRadius: "6px",
                      animation: "pulse 1.5s infinite",
                      "@keyframes pulse": { "0%, 100%": { opacity: 0.4 }, "50%": { opacity: 1 } },
                    }}
                  />
                  <Box
                    sx={{
                      height: 12,
                      width: "80%",
                      bgcolor: "#E2E8F0",
                      borderRadius: "6px",
                      animation: "pulse 1.5s infinite",
                      "@keyframes pulse": { "0%, 100%": { opacity: 0.4 }, "50%": { opacity: 1 } },
                    }}
                  />
                  <Box
                    sx={{
                      height: 12,
                      width: "60%",
                      bgcolor: "#E2E8F0",
                      borderRadius: "6px",
                      animation: "pulse 1.5s infinite",
                      "@keyframes pulse": { "0%, 100%": { opacity: 0.4 }, "50%": { opacity: 1 } },
                    }}
                  />
                </Stack>
              ) : aiError ? (
                <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                  {aiError}
                </Typography>
              ) : aiResponse ? (
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: theme.palette.text.primary,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                  }}
                >
                  {aiResponse && parseAiResponse(aiResponse).map((seg, idx) => {
                    if (seg.type === "bold")
                      return <strong key={idx}>{seg.content}</strong>;
                    if (seg.type === "link" && seg.url)
                      return (
                        <Link
                          key={idx}
                          href={seg.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{ color: "primary.main", fontWeight: 500 }}
                        >
                          {seg.content}
                        </Link>
                      );
                    return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
                  })}
                </Typography>
              ) : null}
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ mb: 3 }} />

{/* NÚT HÀNH ĐỘNG */}
        <Stack direction="row" spacing={1.5}>
          {/* "Chờ xử lý": Tiếp nhận + Bỏ qua */}
          {currentStatus === "Chờ xử lý" && (
            <>
              <Button
                variant="contained"
                onClick={() => setPendingStatus("Acknowledged")}
                sx={{ flex: 1, py: 1, borderRadius: "10px", textTransform: "none", fontWeight: 600, boxShadow: "none", p: 0 }}
              >
                <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                  <Box sx={{ width: "40px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center", py: 1, pr: 1 }}>
                    Tiếp nhận
                  </Box>
                </Box>
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setPendingStatus("Dismissed")}
                sx={{ flex: 1, py: 1, borderRadius: "10px", textTransform: "none", fontWeight: 600, borderWidth: 2, "&:hover": { borderWidth: 2 }, p: 0 }}
              >
                <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                  <Box sx={{ width: "40px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
                    <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center", py: 1, pr: 1 }}>
                    Bỏ qua
                  </Box>
                </Box>
              </Button>
            </>
          )}

          {/* "Đang xử lý": Đã xử lý + Tham vấn AI */}
          {currentStatus === "Đang xử lý" && (
            <>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleGoToCorrectiveAction}
                sx={{ flex: 1, py: 1, borderRadius: "10px", textTransform: "none", fontWeight: 600, borderWidth: 2, "&:hover": { borderWidth: 2 }, p: 0 }}
              >
                <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                  <Box sx={{ width: "40px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
                    <AssignmentOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center", py: 1, pr: 1 }}>
                    Đã xử lý
                  </Box>
                </Box>
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleConsultAI}
                sx={{ flex: 1, py: 1, borderRadius: "10px", textTransform: "none", fontWeight: 600, borderWidth: 2, "&:hover": { borderWidth: 2 }, p: 0 }}
              >
                <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                  <Box sx={{ width: "40px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
                    <SmartToyOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center", py: 1, pr: 1 }}>
                    Tham vấn AI
                  </Box>
                </Box>
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>

    {/* Confirmation dialog */}
    <Dialog open={pendingStatus !== null} onClose={() => setPendingStatus(null)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận thay đổi trạng thái</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {pendingStatus === "Acknowledged"
            ? "Bạn có chắc muốn tiếp nhận cảnh báo này? Trạng thái sẽ chuyển sang Đang xử lý."
            : "Bạn có chắc muốn bỏ qua cảnh báo này? Đây là thao tác không thể hoàn tác."}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => setPendingStatus(null)}
          disabled={submitting}
          sx={{ textTransform: "none" }}
        >
          Huỷ
        </Button>
        <Button
          variant="contained"
          color={pendingStatus === "Dismissed" ? "error" : "primary"}
          disabled={submitting}
          onClick={handleStatusConfirm}
          startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none" }}
        >
          {submitting ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};
