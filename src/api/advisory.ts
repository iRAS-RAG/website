import { apiFetch } from "./client";

// Phản hồi từ POST /api/advisory/chat (AdvisoryController)
export interface AdvisoryChatResponse {
  answer: string;
  isOffTopic: boolean;
  citations?: string[] | null;
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
};
