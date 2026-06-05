import type { MasterBoard } from "../types/masterboard";
import { apiFetch, extractArray } from "./client";

function toMasterBoard(item: Record<string, unknown>): MasterBoard {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    macAddress:
      (item.macAddress as string) || (item.mac_address as string) || undefined,
    fishTankId:
      (item.fishTankId as string) ||
      (item.fish_tank_id as string) ||
      undefined,
    fishTankName:
      (item.fishTankName as string) ||
      (item.fish_tank_name as string) ||
      undefined,
  };
}

export async function getMasterBoardsByTank(
  tankId: string,
): Promise<MasterBoard[]> {
  const res = await apiFetch<unknown>(
    `/hardwares/masterboards?fishTankId=${encodeURIComponent(tankId)}`,
  );
  const items = extractArray(res);
  return items.map((i) => toMasterBoard(i as Record<string, unknown>));
}

export async function getMasterBoards(): Promise<MasterBoard[]> {
  const res = await apiFetch<unknown>("/hardwares/masterboards");
  const items = extractArray(res);
  return items.map((i) => toMasterBoard(i as Record<string, unknown>));
}

export async function createMasterBoard(payload: {
  name: string;
  macAddress?: string | null;
  fishTankId?: string | null;
}): Promise<MasterBoard> {
  const body: Record<string, unknown> = {
    name: payload.name ?? "",
    macAddress: payload.macAddress ?? null,
    fishTankId: payload.fishTankId ?? null,
  };
  const created = await apiFetch<Record<string, unknown>>(
    "/hardwares/masterboards",
    { method: "POST", body },
  );
  return toMasterBoard(created as Record<string, unknown>);
}

export async function updateMasterBoard(
  id: string,
  payload: {
    name: string;
    macAddress?: string | null;
    fishTankId?: string | null;
  },
): Promise<MasterBoard | null> {
  const body: Record<string, unknown> = {
    name: payload.name ?? "",
    macAddress: payload.macAddress ?? null,
    fishTankId: payload.fishTankId ?? null,
  };
  const updated = await apiFetch<Record<string, unknown>>(
    `/hardwares/masterboards/${id}`,
    { method: "PUT", body },
  );
  if (!updated) return null;
  return toMasterBoard(updated as Record<string, unknown>);
}

export async function deleteMasterBoard(id: string): Promise<boolean> {
  await apiFetch(`/hardwares/masterboards/${id}`, { method: "DELETE" });
  return true;
}

export default {
  getMasterBoards,
  getMasterBoardsByTank,
  createMasterBoard,
  updateMasterBoard,
  deleteMasterBoard,
};
