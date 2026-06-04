export type SensorType = {
  id: string;
  name: string;
  measureType?: string;
  unitOfMeasure?: string;
  code?: string;
  minPossibleValue: number;
  maxPossibleValue: number;
};

export type SensorTypeCreate = {
  name: string;
  measureType?: string;
  unitOfMeasure?: string;
  code: string;
};
