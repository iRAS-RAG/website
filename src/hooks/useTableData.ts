import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/client";
import type { PaginatedResponse, TableParams } from "../types/table";

export function useTableData<T = Record<string, unknown>>(endpoint: string, params: TableParams) {
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<T>["meta"] | undefined>(undefined);
  const [links, setLinks] = useState<PaginatedResponse<T>["links"] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    // debounce quick changes (search)
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchData();
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(params)]);

  async function fetchData() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<PaginatedResponse<T> | unknown[]>(endpoint + buildQuery(params), { rawResponse: true, signal: abortRef.current.signal });
      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        const data = (payload as PaginatedResponse<T>).data ?? [];
        setRows(data as T[]);
        setMeta((payload as PaginatedResponse<T>).meta);
        setLinks((payload as PaginatedResponse<T>).links);
      } else if (Array.isArray(payload)) {
        setRows(payload as unknown as T[]);
        setMeta(undefined);
        setLinks(undefined);
      } else {
        setRows([]);
        setMeta(undefined);
        setLinks(undefined);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function buildQuery(p: TableParams) {
    const qs = new URLSearchParams();
    if (p.page !== undefined) qs.set("page", String(p.page));
    if (p.pageSize !== undefined) qs.set("pageSize", String(p.pageSize));
    if (p.q !== undefined && p.q !== null) qs.set("q", String(p.q));
    if (p.sortBy !== undefined) qs.set("sortBy", String(p.sortBy));
    if (p.sortDir !== undefined) qs.set("sortDir", String(p.sortDir));
    // include other filters
    Object.keys(p).forEach((k) => {
      if (["page", "pageSize", "q", "sortBy", "sortDir"].includes(k)) return;
      const v = p[k];
      if (v === undefined || v === null) return;
      qs.set(k, String(v as any));
    });
    const s = qs.toString();
    return s ? `?${s}` : "";
  }

  function reload() {
    fetchData();
  }

  return { rows, meta, links, loading, error, reload };
}

export default useTableData;
