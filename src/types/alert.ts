// src/types/alert.ts

export type AlertStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "RESOLVED"
  | string
  | number;

export interface IAlert {
  id: string;
  sensorId: string; // SỬA Ở ĐÂY: Đổi từ sensorLogId -> sensorId
  speciesThresholdId: string;
  farmingBatchId?: string;
  farmingBatchName?: string;
  fishTankId: string;
  fishTankName: string;
  sensorTypeId: string;
  sensorTypeName: string;
  triggerValue: number; // SỬA Ở ĐÂY: Đổi từ value -> triggerValue
  raisedAt: string;
  resolvedAt?: string;
  status: AlertStatus;
  createdAt?: string;
  modifiedAt?: string;

  unitOfMeasure: string;
  minThreshold: number;
  maxThreshold: number;
}

export interface IAlertListRequest {
  page?: number;
  pageSize?: number;
  status?: AlertStatus;
}
