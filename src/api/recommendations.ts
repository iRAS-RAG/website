import { apiFetch } from "./client";
import type { RecommendationResponse } from "../types/recommendation";

export const recommendationApi = {
  getAll: (params: { page: number; pageSize: number }) =>
    apiFetch<RecommendationResponse>(
      `/recommendations?page=${params.page}&pageSize=${params.pageSize}`,
    ),
};
