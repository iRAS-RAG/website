import { useEffect, useState } from "react";
import { createMasterBoard, getMasterBoards, updateMasterBoard } from "../api/masterboards";
import type { MasterBoard } from "../types/masterboard";
import type { Tank } from "../types/tank";

export type MasterBoardSaveInput = {
  name: string;
  macAddress?: string;
  fishTankId?: string | null;
};

export default function useMasterBoards(tanks: Tank[]) {
  const [loading, setLoading] = useState(true);
  const [masterBoards, setMasterBoards] = useState<MasterBoard[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getMasterBoards();
        if (!mounted) return;
        setMasterBoards(data);
      } catch (error) {
        console.error("Failed to load masterboards:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveMasterBoard(value: MasterBoardSaveInput, editingBoard?: MasterBoard | null) {
    const fishTankName = value.fishTankId ? tanks.find((tank) => tank.id === value.fishTankId)?.name : undefined;

    if (editingBoard) {
      const updated = await updateMasterBoard(editingBoard.id, {
        name: value.name,
        macAddress: value.macAddress ?? undefined,
        fishTankName,
      });
      if (!updated) throw new Error("Update failed");
      setMasterBoards((prev) => prev.map((board) => (board.id === updated.id ? updated : board)));
      return;
    }

    const created = await createMasterBoard({
      name: value.name,
      macAddress: value.macAddress ?? undefined,
      fishTankName,
    });
    setMasterBoards((prev) => [...prev, created]);
  }

  return {
    loading,
    masterBoards,
    handleSaveMasterBoard,
  } as const;
}
