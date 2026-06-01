export interface AuditLog {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  role?: string;
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
  searchQuery?: string;
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

export function parseAuditJson(raw?: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    return typeof p === "object" && p !== null && !Array.isArray(p)
      ? (p as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Lấy tên entity từ JSON của oldValue hoặc newValue.
 * Thử theo thứ tự: name → Name → LastName+FirstName → Email
 */
export function extractEntityName(log: AuditLog): string {
  const raw = log.newValue ?? log.oldValue;
  const parsed = parseAuditJson(raw);
  if (!parsed) return "";

  const direct =
    (parsed.name as string) ||
    (parsed.Name as string) ||
    "";
  if (direct) return direct;

  // Fallback cho User entity (Name không có nhưng có First/Last)
  const last = (parsed.LastName as string) || (parsed.lastName as string) || "";
  const first = (parsed.FirstName as string) || (parsed.firstName as string) || "";
  const full = `${last} ${first}`.trim();
  if (full) return full;

  return (parsed.Email as string) || (parsed.email as string) || "";
}

/** Tạo câu mô tả hành động cho từng loại log */
export function buildDescription(log: AuditLog): string {
  const actor = log.fullName?.trim() || log.email || "Người dùng";
  const entityName = extractEntityName(log);

  // --- Special case: Người dùng Sửa → có thể là đổi role ---
  if (log.entityType === "Người dùng" && log.action === "Sửa") {
    const oldData = parseAuditJson(log.oldValue);
    const newData = parseAuditJson(log.newValue);
    const targetName =
      (oldData?.name as string) ||
      (newData?.name as string) ||
      entityName;
    const oldRole =
      (oldData?.RoleName as string) || (oldData?.roleName as string);
    const newRole =
      (newData?.RoleName as string) || (newData?.roleName as string);
    if (oldRole && newRole && oldRole !== newRole) {
      const target = targetName ? `"${targetName}"` : "người dùng";
      return `${actor} đã thay đổi vai trò của ${target} từ "${oldRole}" sang "${newRole}"`;
    }
    const target = targetName ? `người dùng "${targetName}"` : "người dùng";
    return `${actor} đã cập nhật thông tin ${target}`;
  }

  // --- General case ---
  const parts = [actor, "đã", log.action];
  // Ẩn entityType với các loại không có nghĩa khi hiển thị
  if (
    log.entityType &&
    log.entityType !== "Xác thực" &&
    log.entityType !== "Báo cáo"
  ) {
    parts.push(log.entityType);
  }
  if (entityName) parts.push(`"${entityName}"`);
  return parts.join(" ");
}

/** Nhóm action chỉ hiển thị mô tả, không cần dialog chi tiết */
const SIMPLE_ENTITY_TYPES = new Set([
  "Xác thực",
  "Người dùng",
  "Phân quyền người dùng - trang trại",
  "Báo cáo",
]);

const SIMPLE_ACTIONS = new Set(["Đăng nhập", "Đăng xuất", "Bật/tắt thiết bị"]);

export function isSimpleLog(log: AuditLog): boolean {
  return SIMPLE_ENTITY_TYPES.has(log.entityType) || SIMPLE_ACTIONS.has(log.action);
}
