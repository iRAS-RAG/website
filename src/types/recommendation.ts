export interface Recommendation {
  id: string;
  alertId?: string;
  documentId?: string;
  documentTitle?: string;
  suggestionText: string; // <-- THÊM DÒNG NÀY (hoặc đổi tên từ 'content' thành 'suggestionText')
  content?: string; // (Tạm giữ lại content nếu các file khác trong code cũ của bạn vẫn đang dùng)
}

export interface RecommendationResponse {
  data: Recommendation[];
  message?: string;
}
