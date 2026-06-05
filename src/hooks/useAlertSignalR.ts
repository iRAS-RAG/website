import { HubConnectionBuilder, HttpTransportType, type HubConnection, type IHttpConnectionOptions } from "@microsoft/signalr";
import { useEffect, useRef } from "react";
import { API_BASE } from "../api/client";
import { getAccessToken } from "../api/jwt";

const HUB_URL = API_BASE.replace(/\/api\/?$/, "") + "/hubs/alerts";

export interface AlertPush {
  alertId: string;
  tankId: string;
  tankName: string;
  sensorTypeName?: string;
  triggerValue: number;
  minValue: number;
  maxValue: number;
}

interface AlertCreatedNotification {
  alertId: string;
  tankId: string;
}

interface Handlers {
  onReceiveAlert?: (push: AlertPush) => void;
  onAlertCreated?: (notification: AlertCreatedNotification) => void;
}

function buildConnection(transport?: HttpTransportType) {
  const opts: IHttpConnectionOptions = {
    accessTokenFactory: () => getAccessToken() ?? "",
  };
  if (transport !== undefined) opts.transport = transport;

  return new HubConnectionBuilder()
    .withUrl(HUB_URL, opts)
    .withAutomaticReconnect()
    .build();
}

export function useAlertSignalR(handlers: Handlers) {
  const connRef = useRef<HubConnection | null>(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    let cancelled = false;
    let conn: HubConnection;

    const startConnection = async () => {
      conn = buildConnection();

      conn.on("ReceiveAlert", (push: AlertPush) => {
        handlersRef.current.onReceiveAlert?.(push);
      });

      conn.on("AlertCreated", (notification: AlertCreatedNotification) => {
        handlersRef.current.onAlertCreated?.(notification);
      });

      conn.onreconnecting(() => {
        if (!cancelled) console.log("[AlertSignalR] Reconnecting...");
      });

      conn.onreconnected(async () => {
        if (!cancelled) console.log("[AlertSignalR] Reconnected");
      });

      conn.onclose(() => {
        if (!cancelled) console.log("[AlertSignalR] Connection closed");
      });

      connRef.current = conn;

      try {
        await conn.start();
      } catch (e) {
        if (cancelled) return;
        console.warn("[AlertSignalR] WebSocket failed, falling back to LongPolling:", e);
        // WebSocket failed — try LongPolling as a fallback
        conn.stop().catch(() => {});
        conn = buildConnection(HttpTransportType.LongPolling);

        conn.on("ReceiveAlert", (push: AlertPush) => {
          handlersRef.current.onReceiveAlert?.(push);
        });

        conn.on("AlertCreated", (notification: AlertCreatedNotification) => {
          handlersRef.current.onAlertCreated?.(notification);
        });

        conn.onreconnecting(() => {
          if (!cancelled) console.log("[AlertSignalR] Reconnecting...");
        });

        conn.onreconnected(async () => {
          if (!cancelled) console.log("[AlertSignalR] Reconnected");
        });

        conn.onclose(() => {
          if (!cancelled) console.log("[AlertSignalR] Connection closed");
        });

        connRef.current = conn;

        try {
          await conn.start();
        } catch (e2) {
          if (!cancelled) console.error("[AlertSignalR] All transport attempts failed:", e2);
          connRef.current = null;
          return;
        }
      }
    };

    startConnection();

    return () => {
      cancelled = true;
      if (conn) {
        conn.stop().catch(() => {});
      }
      connRef.current = null;
    };
  }, []);
}
