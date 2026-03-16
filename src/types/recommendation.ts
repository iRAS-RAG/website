export interface Recommendation {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface RecommendationResponse {
  data: Recommendation[];
  message?: string;
}
