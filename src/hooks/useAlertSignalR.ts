import { HubConnectionBuilder, HttpTransportType, type HubConnection, type IHttpConnectionOptions } from "@microsoft/signalr";
import { useCallback, useEffect, useRef } from "react";
import { API_BASE } from "../api/client";
import { getAccessToken } from "../api/jwt";
import { usePageVisibility } from "./usePageVisibility";

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

interface AlertStatusChangedNotification {
  alertId: string;
  tankId: string;
  newStatus: string;
}

interface Handlers {
  onReceiveAlert?: (push: AlertPush) => void;
  onAlertCreated?: (notification: AlertCreatedNotification) => void;
  onAlertStatusChanged?: (notification: AlertStatusChangedNotification) => void;
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

      conn.on("AlertStatusChanged", (notification: AlertStatusChangedNotification) => {
        handlersRef.current.onAlertStatusChanged?.(notification);
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

  // When the user switches back to this tab, the browser may have disconnected
  // the WebSocket. SignalR's auto-reconnect will kick in, but the immediate
  // retry often fails because the browser hasn't fully restored the WebSocket
  // subsystem yet. Explicitly check on visibility change and restart if needed.
  const handlePageVisible = useCallback(() => {
    const c = connRef.current;
    if (c && c.state === "Disconnected") {
      console.log("[AlertSignalR] Tab visible, restarting connection");
      c.start().catch((e) => {
        console.warn("[AlertSignalR] Restart on visibility failed, falling back:", e);
        // Build a fresh LongPolling connection as fallback
        const lp = buildConnection(HttpTransportType.LongPolling);
        lp.on("ReceiveAlert", (push: AlertPush) => {
          handlersRef.current.onReceiveAlert?.(push);
        });
        lp.on("AlertCreated", (notification: AlertCreatedNotification) => {
          handlersRef.current.onAlertCreated?.(notification);
        });
        lp.on("AlertStatusChanged", (notification: AlertStatusChangedNotification) => {
          handlersRef.current.onAlertStatusChanged?.(notification);
        });
        lp.onreconnecting(() => console.log("[AlertSignalR] Reconnecting..."));
        lp.onreconnected(async () => console.log("[AlertSignalR] Reconnected"));
        lp.onclose(() => console.log("[AlertSignalR] Connection closed"));
        connRef.current = lp;
        return lp.start();
      });
    }
  }, []);

  usePageVisibility(handlePageVisible);
}
