import { Avatar, Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Icons
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

// Components
import { useToast } from "../../components/common/toastContext";
import { OperatorHeader } from "../../components/operator/OperatorHeader";
import { OperatorSidebar } from "../../components/operator/OperatorSidebar";

// API
import { advisoryApi } from "../../api/advisory";
import { extractArray, isApiError } from "../../api/client";

// --- TYPES ---
interface Tank {
  id: string;
  name: string;
  hasOpenAlert?: boolean;
}

interface Exchange {
  question: string;
  answer: string;
  isOffTopic: boolean;
  citations: string[];
  error: boolean;
  intent: string | null;
  feedbackSubmitted: boolean;
  isHelpful: boolean | null;
}

// Loại bỏ cú pháp Markdown phổ biến trong câu trả lời của AI để hiển thị
// dạng văn bản thuần (tránh hiện thừa các ký tự **, *, #, `, ...)
const stripMarkdown = (s: string): string => {
  if (!s) return s;
  return s
    .replace(/\*\*([\s\S]+?)\*\*/g, "$1") // **bold**
    .replace(/__([\s\S]+?)__/g, "$1") // __bold__
    .replace(/^#{1,6}\s+/gm, "") // headers # / ##
    .replace(/^\s*[*+-]\s+/gm, "• ") // bullets: *, -, +
    .replace(/`([^`]+)`/g, "$1"); // `code`
};

const AIAdvisory: React.FC = () => {
  const theme = useTheme();
  const toast = useToast();
  const location = useLocation();
  const prefillApplied = useRef(false);

  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loadingTanks, setLoadingTanks] = useState(true);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  useEffect(() => {
    const loadTanks = async () => {
      try {
        const res = await advisoryApi.getTanks();
        setTanks(extractArray(res) as Tank[]);
      } catch (err) {
        console.error("Lỗi tải danh sách bể nuôi:", err);
        toast.error("Không tải được danh sách bể nuôi.");
      } finally {
        setLoadingTanks(false);
      }
    };
    loadTanks();
  }, [toast]);

  // Khi điều hướng từ trang Cảnh báo sang: tự chọn bể + điền sẵn câu hỏi
  useEffect(() => {
    if (prefillApplied.current || tanks.length === 0) return;
    const navState = location.state as {
      tankId?: string;
      prefillPrompt?: string;
    } | null;
    if (!navState?.tankId) return;

    const matched = tanks.find((t) => t.id === navState.tankId);
    if (matched) {
      prefillApplied.current = true;
      setSelectedTank(matched);
      if (navState.prefillPrompt) setMessage(navState.prefillPrompt);
    }
  }, [tanks, location.state]);

  const handleSelectTank = (tank: Tank) => {
    setSelectedTank(tank);
    setExchanges([]);
    setMessage("");
  };

  const handleChangeTank = () => {
    setSelectedTank(null);
    setExchanges([]);
    setMessage("");
  };

  // Gửi đánh giá hữu ích / không hữu ích cho một exchange theo index
  const handleFeedback = async (index: number, helpful: boolean) => {
    const ex = exchanges[index];
    if (!ex || ex.feedbackSubmitted || !selectedTank || !ex.answer) return;

    // Cập nhật UI ngay lập tức (optimistic update)
    setExchanges((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        feedbackSubmitted: true,
        isHelpful: helpful,
      };
      return updated;
    });

    try {
      await advisoryApi.submitFeedback({
        tankId: selectedTank.id,
        response: ex.answer,
        helpful,
        intent: ex.intent,
        question: ex.question,
      });
    } catch (err) {
      console.error("Lỗi gửi feedback:", err);
    }
  };

  const handleSend = async () => {
    const question = message.trim();
    if (!selectedTank || !question || sending) return;

    // Đánh giá ngầm: nếu câu trả lời cuối chưa được đánh giá thì tự gửi helpful=true
    const lastIndex = exchanges.length - 1;
    if (lastIndex >= 0) {
      const lastEx = exchanges[lastIndex];
      if (lastEx && !lastEx.error && !lastEx.feedbackSubmitted && lastEx.answer) {
        handleFeedback(lastIndex, true);
      }
    }

    setMessage("");
    setSending(true);

    // Tạo một khung chat tạm thời (chưa có câu trả lời) đẩy vào màn hình trước
    setExchanges((prev) => [
      ...prev,
      {
        question,
        answer: "",
        isOffTopic: false,
        citations: [],
        error: false,
        intent: null,
        feedbackSubmitted: false,
        isHelpful: null,
      },
    ]);

    try {
      const res = await advisoryApi.chat(selectedTank.id, question);

      setExchanges((prev) => {
        const newExchanges = [...prev];
        const idx = newExchanges.length - 1;
        newExchanges[idx] = {
          ...newExchanges[idx],
          answer: res?.answer?.trim() || "Hệ thống chưa trả về câu trả lời. Vui lòng thử lại.",
          isOffTopic: !!res?.isOffTopic,
          citations: res?.citations ?? [],
          error: false,
          intent: res?.intent ?? null,
        };
        return newExchanges;
      });
    } catch (err) {
      console.error("Lỗi gọi advisory chat:", err);
      const status = isApiError(err) ? err.status : undefined;
      const apiMsg = isApiError(err) ? (err.data as { message?: string })?.message : undefined;

      let reason: string;
      if (status === 403) {
        reason = (apiMsg || "Bạn không có quyền truy cập bể nuôi này.") + " Vui lòng chọn bể khác.";
      } else if (status === 401) {
        reason = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else {
        reason = apiMsg || "Không thể kết nối tới trợ lý AI. Vui lòng thử lại.";
      }

      toast.error(reason);
      setExchanges((prev) => {
        const newExchanges = [...prev];
        const idx = newExchanges.length - 1;
        newExchanges[idx] = {
          ...newExchanges[idx],
          answer: reason,
          error: true,
        };
        return newExchanges;
      });
    } finally {
      setSending(false);
    }
  };

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
        <OperatorHeader title="Trợ lý AI Phân tích iRAS" />

        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {selectedTank.name}
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <SmartToyOutlinedIcon color="primary" />
                </Stack>
              )}

              {selectedTank && (
                <Button
                  variant="outlined"
                  startIcon={<SwapHorizIcon />}
                  size="small"
                  onClick={handleChangeTank}
                  disabled={sending}
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
                {/* LỜI CHÀO & TANK CHIPS */}
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
                      <Paper elevation={0} sx={{ p: 2, borderRadius: "12px 12px 12px 0", mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "text.primary" }}>
                          Xin chào, chúc bạn một ngày tốt lành! Vui lòng chọn một bể nuôi bên dưới để tôi bắt đầu phân tích trạng thái và tư vấn cho bạn.
                        </Typography>
                      </Paper>

                      {!selectedTank &&
                        (loadingTanks ? (
                          <CircularProgress size={24} sx={{ mt: 1.5 }} />
                        ) : tanks.length === 0 ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                            Không có bể nuôi nào để tư vấn.
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                            {tanks.map((tank) => (
                              <Button
                                key={tank.id}
                                onClick={() => handleSelectTank(tank)}
                                variant="contained"
                                sx={{
                                  borderRadius: "20px",
                                  px: 2,
                                  py: 0.8,
                                  bgcolor: tank.hasOpenAlert ? "#FEF2F2" : "#EFF6FF",
                                  color: tank.hasOpenAlert ? "#DC2626" : "#2563EB",
                                  boxShadow: "none",
                                  border: `1px solid ${tank.hasOpenAlert ? "#FECACA" : "#BFDBFE"}`,
                                  fontWeight: 600,
                                  textTransform: "none",
                                  "&:hover": {
                                    bgcolor: tank.hasOpenAlert ? "#FEE2E2" : "#DBEAFE",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                    transform: "translateY(-1px)",
                                  },
                                  transition: "all 0.2s",
                                }}
                                startIcon={<WaterDropIcon fontSize="small" />}
                                endIcon={tank.hasOpenAlert ? <WarningAmberIcon fontSize="small" color="error" /> : null}
                              >
                                {tank.name}
                              </Button>
                            ))}
                          </Stack>
                        ))}
                    </Box>
                  </Stack>
                </Box>

                {/* BONG BÓNG SẴN SÀNG */}
                {selectedTank && exchanges.length === 0 && (
                  <Box sx={{ alignSelf: "flex-start", maxWidth: "95%" }}>
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
                      <Paper elevation={0} sx={{ p: 2, borderRadius: "12px 12px 12px 0" }}>
                        <Typography variant="body2" sx={{ color: "text.primary" }}>
                          Tôi đã sẵn sàng phân tích cho <strong>{selectedTank.name}</strong>. Bạn hãy nhập câu hỏi hoặc mô tả vấn đề bên dưới để tôi tư vấn.
                        </Typography>
                      </Paper>
                    </Stack>
                  </Box>
                )}

                {/* VÒNG LẶP HIỂN THỊ LỊCH SỬ CHAT */}
                {exchanges.map((ex, index) => {
                  const isLastItem = index === exchanges.length - 1;
                  const isWaitingForAPI = isLastItem && sending;

                  return (
                    <React.Fragment key={index}>
                      {/* CÂU HỎI CỦA NGƯỜI DÙNG */}
                      <Box sx={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: "12px 12px 0 12px",
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "white" }}>
                            {ex.question}
                          </Typography>
                        </Paper>
                      </Box>

                      {/* CÂU TRẢ LỜI CỦA AI */}
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
                            <Paper elevation={0} sx={{ p: 2, borderRadius: "12px 12px 12px 0" }}>
                              {isWaitingForAPI ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <CircularProgress size={16} />
                                  <Typography variant="body2" color="text.secondary">
                                    Đang phân tích...
                                  </Typography>
                                </Stack>
                              ) : (
                                <>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: ex.error ? "error.main" : "text.primary",
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {stripMarkdown(ex.answer)}
                                  </Typography>

                                  {ex.isOffTopic && !ex.error && (
                                    <Chip size="small" icon={<WarningAmberIcon />} label="Câu hỏi nằm ngoài phạm vi tư vấn" color="warning" variant="outlined" sx={{ mt: 1.5 }} />
                                  )}

                                  {ex.citations && ex.citations.length > 0 && (
                                    <Box sx={{ mt: 1.5 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          color: "text.secondary",
                                        }}
                                      >
                                        Nguồn tham khảo:
                                      </Typography>
                                      {ex.citations.map((c, i) => (
                                        <Typography key={i} variant="caption" display="block" color="text.secondary">
                                          • {c}
                                        </Typography>
                                      ))}
                                    </Box>
                                  )}
                                </>
                              )}
                            </Paper>

                            {/* NÚT ĐÁNH GIÁ FEEDBACK */}
                            {!isWaitingForAPI && !ex.error && (
                              <Stack direction="row" justifyContent="flex-end" spacing={0.75} sx={{ mt: 1 }}>
                                <Button
                                  size="small"
                                  startIcon={<ThumbUpAltOutlinedIcon sx={{ fontSize: "15px !important" }} />}
                                  onClick={() => handleFeedback(index, true)}
                                  disabled={ex.feedbackSubmitted}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    px: 1.25,
                                    py: 0.4,
                                    minWidth: 0,
                                    borderRadius: "6px",
                                    color: ex.feedbackSubmitted && ex.isHelpful === true ? "success.main" : "text.secondary",
                                    "&:hover": {
                                      color: "success.main",
                                      bgcolor: "rgba(46, 125, 50, 0.08)",
                                    },
                                    transition: "color 0.2s, background-color 0.2s",
                                  }}
                                >
                                  Hữu ích
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<ThumbDownAltOutlinedIcon sx={{ fontSize: "15px !important" }} />}
                                  onClick={() => handleFeedback(index, false)}
                                  disabled={ex.feedbackSubmitted}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    px: 1.25,
                                    py: 0.4,
                                    minWidth: 0,
                                    borderRadius: "6px",
                                    color: ex.feedbackSubmitted && ex.isHelpful === false ? "error.main" : "text.secondary",
                                    "&:hover": {
                                      color: "error.main",
                                      bgcolor: "rgba(211, 47, 47, 0.08)",
                                    },
                                    transition: "color 0.2s, background-color 0.2s",
                                  }}
                                >
                                  Không hữu ích
                                </Button>
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    </React.Fragment>
                  );
                })}
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
                <Typography variant="caption" display="block" align="center" sx={{ mb: 1, color: "text.disabled" }}>
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
                }}
              >
                <TextField
                  sx={{
                    ml: 1,
                    flex: 1,
                    "& input::placeholder": { fontSize: "13px" },
                  }}
                  placeholder={selectedTank ? `Nhập câu hỏi hoặc mô tả vấn đề cho ${selectedTank.name}...` : "Vui lòng chọn bể phía trên trước..."}
                  variant="standard"
                  disabled={!selectedTank || sending}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: "13px" },
                  }}
                />
                <Button
                  disabled={!selectedTank || sending || !message.trim()}
                  onClick={handleSend}
                  variant="contained"
                  size="small"
                  endIcon={sending ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: "16px !important" }} />}
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
