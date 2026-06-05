import { HubConnectionBuilder, HttpTransportType, type HubConnection } from "@microsoft/signalr";
import { useCallback, useEffect, useRef } from "react";
import { API_BASE } from "../api/client";
import { getAccessToken } from "../api/jwt";
import { ragStatusFromInt, type DocumentRagStatus } from "../types/document";
import { usePageVisibility } from "./usePageVisibility";

const HUB_URL = API_BASE.replace(/\/api\/?$/, "") + "/hubs/documents";

interface RagStatusPayload {
  documentId: string;
  ragStatus: number; // SignalR sends (int)enum
}

export function useDocumentSignalR(
  documentIds: string[],
  onStatusUpdate: (documentId: string, ragStatus: DocumentRagStatus) => void,
) {
  const connRef = useRef<HubConnection | null>(null);
  const onStatusUpdateRef = useRef(onStatusUpdate);
  const documentIdsRef = useRef(documentIds);

  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate;
  });

  useEffect(() => {
    documentIdsRef.current = documentIds;
  }, [documentIds]);

  // Connect once — join current IDs after connection is established
  useEffect(() => {
    let cancelled = false;

    const conn = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => getAccessToken() ?? "" })
      .withAutomaticReconnect()
      .build();

    conn.on("RagStatusUpdated", (payload: RagStatusPayload) => {
      const mapped = ragStatusFromInt(payload.ragStatus);
      console.log("[DocumentSignalR] RagStatusUpdated received", { raw: payload, mapped });
      onStatusUpdateRef.current(payload.documentId, mapped);
    });

    conn.start().then(() => {
      if (cancelled) return;
      documentIdsRef.current.forEach((id) => conn.invoke("JoinDocument", id).catch(() => {}));
    }).catch((e) => {
      if (!cancelled) console.error("DocumentSignalR connection failed:", e);
    });

    connRef.current = conn;

    return () => {
      cancelled = true;
      conn.stop().catch(() => {});
      connRef.current = null;
    };
  }, []);

  // Restart connection on tab visibility restore if browser paused the WebSocket.
  const handlePageVisible = useCallback(() => {
    const c = connRef.current;
    if (c && c.state === "Disconnected") {
      console.log("[DocumentSignalR] Tab visible, restarting connection");
      c.start()
        .then(() => {
          documentIdsRef.current.forEach((id) => c.invoke("JoinDocument", id).catch(() => {}));
        })
        .catch(() => {
          // Fallback to LongPolling
          const lp = new HubConnectionBuilder()
            .withUrl(HUB_URL, {
              accessTokenFactory: () => getAccessToken() ?? "",
              transport: HttpTransportType.LongPolling,
            })
            .withAutomaticReconnect()
            .build();
          lp.on("RagStatusUpdated", (payload: RagStatusPayload) => {
            const mapped = ragStatusFromInt(payload.ragStatus);
            onStatusUpdateRef.current(payload.documentId, mapped);
          });
          connRef.current = lp;
          lp.start()
            .then(() => {
              documentIdsRef.current.forEach((id) => lp.invoke("JoinDocument", id).catch(() => {}));
            })
            .catch((e) => {
              console.error("[DocumentSignalR] Fallback connection failed:", e);
            });
        });
    }
  }, []);

  usePageVisibility(handlePageVisible);

  // Join any newly added IDs once connection is already live
  useEffect(() => {
    const conn = connRef.current;
    if (!conn || conn.state !== "Connected") return;

    documentIds.forEach((id) => conn.invoke("JoinDocument", id).catch(() => {}));

    return () => {
      documentIds.forEach((id) => conn.invoke("LeaveDocument", id).catch(() => {}));
    };
  }, [documentIds]);

  const joinDocument = (id: string) => {
    const conn = connRef.current;
    if (!conn || conn.state !== "Connected") return;
    conn.invoke("JoinDocument", id).catch(() => {});
  };

  return { joinDocument };
}
