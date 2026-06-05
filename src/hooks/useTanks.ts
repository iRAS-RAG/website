import { useEffect, useState } from "react";
import { createTank, deleteTank, getTanks, updateTank } from "../api/tanks";
import type { Tank } from "../types/tank";

export type TankUpdatePayload = {
  name: string;
  height?: number;
  radius?: number;
  farmId?: string;
  topicCode?: string;
  cameraUrl?: string;
};

const DEFAULT_FARM_ID = "aaaaaaaa-0000-0000-0000-000000000001";

export default function useTanks() {
  const [loading, setLoading] = useState(true);
  const [tanks, setTanks] = useState<Tank[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getTanks();
        if (!mounted) return;
        setTanks(data);
      } catch (error) {
        console.error("Failed to load tanks:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreateTank(payload: TankUpdatePayload) {
    const created = await createTank({
      ...payload,
      farmId: DEFAULT_FARM_ID,
    });
    if (!created) throw new Error("Create failed");
    setTanks((prev) => [...prev, created]);
    return created;
  }

  async function handleUpdateTank(payload: TankUpdatePayload, id?: string | null) {
    if (!id) throw new Error("No tank selected");
    const updated = await updateTank(id, payload);
    if (!updated) throw new Error("Update failed");
    setTanks((prev) => prev.map((tank) => (tank.id === id ? updated : tank)));
  }

  async function handleDeleteTank(id?: string | null) {
    if (!id) throw new Error("No tank selected");
    await deleteTank(id);
    setTanks((prev) => prev.filter((tank) => tank.id !== id));
  }

  return {
    loading,
    tanks,
    handleCreateTank,
    handleUpdateTank,
    handleDeleteTank,
  } as const;
}
