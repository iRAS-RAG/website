export type Sensor = {
  id: string;
  name: string;
  pinCode?: number;
  sensorTypeId?: string;
  sensorTypeName?: string;
  masterBoardId?: string;
  masterBoardName?: string;
};
// Dữ liệu đo lường thực tế từ API latest-data
export interface SensorTelemetry {
  sensorId: string;
  sensorName: string;
  sensorType: string;
  value: number;
  unit: string;
  status: "Normal" | "Warning" | "Danger";
  timestamp: string;
}

export interface LatestDataResponse {
  message: string;
  data: SensorTelemetry[];
}

export interface SensorLog {
  id: string;
  value: number;
  timestamp: string;
}

export interface SensorLogResponse {
  items: SensorLog[];
  totalCount: number;
  page: number;
  pageSize: number;
}
