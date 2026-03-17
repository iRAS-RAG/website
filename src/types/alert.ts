// src/types/alert.ts

// Dùng Union Type thay cho enum để tương thích với 'erasableSyntaxOnly'
export type AlertStatus = 0 | 1 | 2;

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
  status: AlertStatus | string | number;
  createdAt?: string;
  modifiedAt?: string;
}

export interface IAlertListRequest {
  page?: number;
  pageSize?: number;
  status?: AlertStatus | string | number;
}
