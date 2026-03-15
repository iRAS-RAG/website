// src/utils/statusMapper.ts

export type StatusType = "Normal" | "Warning" | "Danger";

export const getStatusColor = (
  status: StatusType,
): "success" | "warning" | "error" => {
  switch (status) {
    case "Normal":
      return "success";
    case "Warning":
      return "warning";
    case "Danger":
      return "error";
    default:
      return "success";
  }
};

export const getStatusText = (status: StatusType): string => {
  switch (status) {
    case "Normal":
      return "Bình thường";
    case "Warning":
      return "Cảnh báo";
    case "Danger":
      return "Nguy hiểm";
    default:
      return "Không xác định";
  }
};
