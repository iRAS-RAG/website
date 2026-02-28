export type Meta = { page?: number; pageSize?: number; totalItems?: number; totalPages?: number; [key: string]: unknown };
export type Links = { self?: string | null; first?: string | null; prev?: string | null; next?: string | null; last?: string | null; [key: string]: unknown };

export type PaginatedResponse<T> = {
  message?: string;
  data: T[];
  meta?: Meta;
  links?: Links;
};

export type TableParams = {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  [key: string]: unknown;
};
