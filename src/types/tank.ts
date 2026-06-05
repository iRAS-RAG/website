import type { MasterBoard } from "./masterboard";

export type Tank = {
  id: string;
  name: string;
  height?: number;
  radius?: number;
  farmId?: string;
  farmName?: string;
  topicCode?: string;
  cameraUrl?: string;
  masterBoards?: MasterBoard[];
};
