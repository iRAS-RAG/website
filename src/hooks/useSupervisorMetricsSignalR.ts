import { HubConnection, HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/client";
import { getAccessToken } from "../api/jwt";

const HUB_URL = API_BASE.replace(/\/api\/?$/, "") + "/hubs/supervisor-metrics";

export function useSupervisorMetricsSignalR(farmId?: string, handlers?: { onFeeding?: (payload: any) => void; onMortality?: (payload: any) => void }) {
  const connRef = useRef<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const buildAndRegister = (transport?: number) => {
      const opts: any = { accessTokenFactory: () => getAccessToken() ?? "" };
      if (transport) opts.transport = transport;
      const conn = new HubConnectionBuilder().withUrl(HUB_URL, opts).withAutomaticReconnect().build();

      conn.on("FeedingLogCreated", (payload) => {
        handlers?.onFeeding?.(payload);
      });

      conn.on("MortalityLogCreated", (payload) => {
        handlers?.onMortality?.(payload);
      });

      conn.onreconnected(async () => {
        try {
          if (farmId) await conn.invoke("JoinFarmGroup", farmId);
        } catch (e) {
          // ignore
        }
      });

      return conn;
    };

    const connection = buildAndRegister();
    connRef.current = connection;

    connection
      .start()
      .then(async () => {
        if (cancelled) return;
        setConnected(true);
        if (farmId) {
          try {
            await connection.invoke("JoinFarmGroup", farmId);
          } catch {
            // ignore
          }
        }
      })
      .catch(async (err) => {
        // try long polling fallback
        try {
          const lp = buildAndRegister(HttpTransportType.LongPolling);
          connRef.current = lp;
          await lp.start();
          if (cancelled) return;
          setConnected(true);
          if (farmId) {
            try {
              await lp.invoke("JoinFarmGroup", farmId);
            } catch {
              // ignore
            }
          }
        } catch (e) {
          setConnected(false);
        }
      });

    return () => {
      cancelled = true;
      connection.stop().catch(() => {});
      connRef.current = null;
      setConnected(false);
    };
  }, [farmId, handlers]);

  const joinFarmGroup = useCallback(async (id: string) => {
    const conn = connRef.current;
    if (!conn) return;
    try {
      await conn.invoke("JoinFarmGroup", id);
    } catch (e) {
      // ignore
    }
  }, []);

  return { connected, joinFarmGroup } as const;
}

export default useSupervisorMetricsSignalR;
