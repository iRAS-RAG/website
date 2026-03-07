import { useEffect, useState } from "react";
import { createMasterBoard, deleteMasterBoard, getMasterBoards, updateMasterBoard } from "../api/masterboards";
import type { MasterBoard } from "../types/masterboard";

export type MasterBoardSaveInput = {
  name: string;
  macAddress?: string;
  fishTankId?: string | null;
};

export default function useMasterBoards() {
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
    if (editingBoard) {
      const updated = await updateMasterBoard(editingBoard.id, {
        name: value.name,
        macAddress: value.macAddress ?? undefined,
        fishTankId: value.fishTankId ?? null,
      });
      if (!updated) throw new Error("Update failed");
      setMasterBoards((prev) => prev.map((board) => (board.id === updated.id ? updated : board)));
      return;
    }

    const created = await createMasterBoard({
      name: value.name,
      macAddress: value.macAddress ?? undefined,
      fishTankId: value.fishTankId ?? null,
    });
    setMasterBoards((prev) => [...prev, created]);
  }

  async function handleDeleteMasterBoard(id?: string | null) {
    if (!id) throw new Error("No masterboard selected");
    await deleteMasterBoard(id);
    setMasterBoards((prev) => prev.filter((board) => board.id !== id));
  }

  return {
    loading,
    masterBoards,
    handleSaveMasterBoard,
    handleDeleteMasterBoard,
  } as const;
}
