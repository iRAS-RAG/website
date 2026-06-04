// src/types/corrective-action.ts

export interface ICorrectiveAction {
  id: string;
  alertId: string;
  userId: string;
  userEmail: string;
  performedBy: string;
  actionTaken: string;
  notes: string;
  timestamp: string;
  sensorTypeName?: string;
  fishTankName?: string;
}

export interface ICreateCorrectiveAction {
  alertId: string;
  userId: string;
  actionTaken: string;
  notes?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
