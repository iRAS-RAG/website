// src/types/operatorBatch.ts

export type FarmingBatchStatus = 0 | 1 | 2 | 3;
export interface IOperatorFarmingBatch {
  id: string;
  fishTankId: string;
  fishTankName: string;
  name: string;
  speciesStageConfigId: string;
  speciesId: string;
  speciesName: string;
  growthStageId: string;
  stageName: string;
  status: FarmingBatchStatus;
  pausedReason?: number | null;
  startDate: string;
  estimatedHarvestDate?: string;
  actualHarvestDate?: string;
  initialQuantity: number;
  currentQuantity: number;
  unitOfMeasure: string;
  tankVolume?: number;
  estimatedHarvestCount?: number;
  estimatedHarvestWeightKg?: number;
  createdAt?: string;
  modifiedAt?: string | null;
}

export interface IOperatorFeedingLog {
  id: string;
  farmingBatchId: string;
  farmingBatchName?: string;
  amount: number;
  feedTypeId?: string;
  feedTypeName?: string; // Để hiển thị tên cám trên bảng
  createdDate: string;
}

export interface IOperatorMortalityLog {
  id: string;
  batchId: string;
  batchName?: string;
  quantity: number;
  date: string;
}

// KHAI BÁO TYPE CHO DANH MỤC THỨC ĂN
export interface IFeedType {
  id: string;
  name: string;
  description: string;
  proteinPercentage: number;
  manufacturer: string;
}
