// src/types/alert.ts

export type AlertStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "RESOLVED"
  | string
  | number;

export interface IAlert {
  id: string;
  sensorLogId: string;
  speciesThresholdId: string;
  farmingBatchId?: string;
  farmingBatchName?: string;
  fishTankId: string;
  fishTankName: string;
  sensorTypeId: string;
  sensorTypeName: string;
  value: number;
  raisedAt: string;
  resolvedAt?: string;
  status: AlertStatus;
  createdAt?: string;
  modifiedAt?: string;

  // THÊM 3 TRƯỜNG NÀY ĐỂ HIỂN THỊ NGƯỠNG
  unitOfMeasure: string;
  minThreshold: number;
  maxThreshold: number;
}

export interface IAlertListRequest {
  page?: number;
  pageSize?: number;
  status?: AlertStatus;
}
