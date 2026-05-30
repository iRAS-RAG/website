export interface AuditLog {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp: string;
}

export interface AuditLogQueryParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  meta?: {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
  };
}
