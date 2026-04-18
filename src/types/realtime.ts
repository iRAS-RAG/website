// src/types/realtime.ts

export interface ITank {
  id: string;
  name: string;
  hasOpenAlert: boolean;
  topicCode: string;
}

export interface ILatestSensorData {
  sensorId: string;
  sensorName: string;
  sensorTypeName: string;
  unitOfMeasure: string;

  // KHAI BÁO CÁC TRƯỜNG NGƯỠNG Ở ĐÂY
  minThreshold?: number;
  maxThreshold?: number;
  minValue?: number;
  maxValue?: number;

  latestData?: {
    latestAvg: number; // Đổi từ latestValue -> latestAvg
    latestMin?: number; // Thêm mới
    latestMax?: number; // Thêm mới
    isWarning: boolean;
    periodStart: string; // Đổi từ recordedAt -> periodStart
  };
}

export interface IControlDevice {
  id: string;
  name: string;
  state: boolean;
  controlDeviceTypeName: string;
}

export interface IRecommendation {
  id: string;
  alertId: string;
  documentTitle: string;
  suggestionText: string;
}
