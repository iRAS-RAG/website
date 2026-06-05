import { apiFetch } from "./client";

// Phản hồi từ POST /api/advisory/chat (AdvisoryController)
export interface AdvisoryChatResponse {
  answer: string;
  isOffTopic: boolean;
  citations?: string[] | null;
  intent?: string | null;
}

export interface AdvisoryFeedbackRequest {
  tankId: string;
  response: string;
  helpful: boolean;
  intent?: string | null;
  question?: string | null;
}

// Phản hồi từ POST /api/advisory/diagnose-mortality
export interface MortalityDiagnosisResponse {
  answer: string;
  intent: string;
  confidence?: number | null;
  citations?: string[] | null;
  answerBasis?: string | null;
}

export const advisoryApi = {
  // Danh sách bể nuôi để người dùng chọn trước khi tư vấn
  getTanks: async () => {
    return await apiFetch<unknown>("/fish-tanks?page=1&pageSize=100", {
      method: "GET",
    });
  },

  // Gửi câu hỏi tư vấn cho trợ lý AI
  chat: async (tankId: string, message: string) => {
    return await apiFetch<AdvisoryChatResponse>("/advisory/chat", {
      method: "POST",
      body: { tankId, message },
    });
  },

  // Gửi đánh giá hữu ích / không hữu ích cho câu trả lời AI
  submitFeedback: async (data: AdvisoryFeedbackRequest) => {
    return await apiFetch<{ message: string }>("/advisory/chat/feedback", {
      method: "POST",
      body: data,
    });
  },

  // Chẩn đoán nguyên nhân cá chết — tự động thu thập dữ liệu mortality, feeding, alerts
  diagnoseMortality: async (tankId: string, batchId?: string, timeRange?: string) => {
    return await apiFetch<MortalityDiagnosisResponse>("/advisory/diagnose-mortality", {
      method: "POST",
      body: {
        tankId,
        batchId: batchId ?? null,
        timeRange: timeRange ?? null,
      },
    });
  },
};
