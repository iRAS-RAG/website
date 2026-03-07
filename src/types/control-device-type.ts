export type ControlDeviceType = {
  id: string;
  name: string;
  description?: string;
};

export type ControlDeviceTypeCreate = {
  name: string;
  description?: string;
};
