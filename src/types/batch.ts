export type BatchStatus = "ACTIVE" | "HARVESTED" | "PAUSED" | "TERMINATED";

export type PlannedStage = {
  id: string;
  sequence: number;
  speciesStageConfigId?: string;
  growthStageId?: string;
  stageName: string;
  expectedDurationDays?: number;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  amountPer100Fish?: number;
  frequencyPerDay?: number;
  maxStockingDensity?: number;
  feedTypeNames?: string[];
};

export type Batch = {
  id: string;
  name: string;
  fishTankId: string;
  fishTankName?: string;
  tankVolume?: number;
  speciesStageConfigId: string;
  plannedStages?: PlannedStage[];
  speciesId?: string;
  speciesName?: string;
  growthStageId?: string;
  stageName?: string;
  status: BatchStatus;
  pausedReason?: string | null;
  startDate: string; // ISO date string
  estimatedHarvestDate?: string; // ISO date string
  actualHarvestDate?: string; // ISO date string
  initialQuantity: number;
  currentQuantity?: number;
  unitOfMeasure: string;
  survivalRate?: number; // percentage (calculated client-side)
  createdAt?: string;
  modifiedAt?: string | null;
};

export type BatchOperationLog = {
  id: string;
  batchId: string;
  operationType: "feeding" | "sampling" | "mortality" | "treatment" | "water_change" | "other";
  description: string;
  quantity?: number; // for mortality events
  loggedBy?: string;
  loggedByName?: string;
  timestamp: string; // ISO date string
  createdAt?: string;
};

export type BatchPerformance = {
  batchId: string;
  date: string;
  averageTemp?: number;
  averagePh?: number;
  averageDo?: number;
  estimatedBiomass?: number; // weight * count
  feedAmount?: number;
};

export type CreateBatchPayload = {
  fishTankId: string;
  name: string;
  speciesId: string;
  startDate: string;
  initialQuantity: number;
  unitOfMeasure: string;
};

export type HarvestBatchPayload = {
  actualHarvestDate: string;
  finalQuantity: number;
  notes?: string;
};

export type BatchComparison = {
  batchId: string;
  batchName: string;
  survivalRate: number;
  averageDo: number;
  averageTemp: number;
  averagePh: number;
  incidentCount: number;
  cycleDuration: number; // in days
};
