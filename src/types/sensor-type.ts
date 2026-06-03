export type SensorType = {
  id: string;
  name: string;
  measureType?: string;
  unitOfMeasure?: string;
  code?: string;
};

export type SensorTypeCreate = {
  name: string;
  measureType?: string;
  unitOfMeasure?: string;
  code: string;
};
