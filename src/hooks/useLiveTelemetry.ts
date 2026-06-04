import { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";
import { API_BASE, extractArray } from "../api/client";
import { realtimeApi, type TelemetryPush } from "../api/realtimeApi";
import { getAccessToken } from "../api/jwt";

const WINDOW_MS = 10_000;
const HUB_URL = API_BASE.replace(/\/api\/?$/, "") + "/hubs/telemetry";

export type LivePoint = { time: string; value: number; ts: number };

function toPoint(p: TelemetryPush): LivePoint {
  const d = new Date(p.timestamp);
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { time, value: p.value, ts: d.getTime() };
}

function groupSeed(data: TelemetryPush[]): Map<string, LivePoint[]> {
  const map = new Map<string, LivePoint[]>();
  const cutoff = Date.now() - WINDOW_MS;
  for (const p of data) {
    const pt = toPoint(p);
    if (pt.ts < cutoff) continue;
    if (!map.has(p.sensorId)) map.set(p.sensorId, []);
    map.get(p.sensorId)!.push(pt);
  }
  return map;
}

export const useLiveTelemetry = (tankId: string | null) => {
  const [series, setSeries] = useState<Map<string, LivePoint[]>>(new Map());
  const connRef = useRef<HubConnection | null>(null);
  const tankRef = useRef<string | null>(tankId);

  useEffect(() => {
    tankRef.current = tankId;
  }, [tankId]);

  useEffect(() => {
    if (!tankId) {
      // When tankId becomes null, clear the series synchronously via the ref.
      // This is NOT a cascading render — it's a reset triggered by prop change.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeries(new Map());
      return;
    }

    let cancelled = false;

    const toPoints = (data: unknown): TelemetryPush[] =>
      Array.isArray(data) ? data : (extractArray(data) as TelemetryPush[]);

    const seedChart = async () => {
      try {
        const data = await realtimeApi.getTelemetryWindow(tankId);
        if (!cancelled) setSeries(groupSeed(toPoints(data)));
      } catch (err) {
        console.error("Lỗi tải dữ liệu telemetry:", err);
      }
    };

    const conn = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => getAccessToken() ?? "" })
      .withAutomaticReconnect()
      .build();

    conn.on("ReceiveTelemetry", (point: TelemetryPush) => {
      if (point.tankId !== tankRef.current) return;
      const pt = toPoint(point);
      const cutoff = Date.now() - WINDOW_MS;
      setSeries((prev) => {
        const next = new Map(prev);
        const existing = next.get(point.sensorId) ?? [];
        next.set(
          point.sensorId,
          [...existing, pt].filter((p) => p.ts >= cutoff),
        );
        return next;
      });
    });

    // Replace series after fetch completes — existing data stays visible during the in-flight request.
    conn.onreconnected(async () => {
      try {
        const data = await realtimeApi.getTelemetryWindow(tankId);
        if (!cancelled) setSeries(groupSeed(toPoints(data)));
      } catch (err) {
        console.error("Lỗi tải lại dữ liệu sau kết nối lại:", err);
      }
    });

    conn.start().catch(console.error);
    connRef.current = conn;
    seedChart();

    return () => {
      cancelled = true;
      conn.stop();
      connRef.current = null;
    };
  }, [tankId]);

  return series;
};
