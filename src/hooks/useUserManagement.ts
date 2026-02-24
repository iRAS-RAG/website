import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { User } from "../api/users";
import { createUser, deleteUser, toUiUser, updateUser } from "../api/users";
import type { TableParams } from "../types/table";
import useTableData from "./useTableData";

export default function useUserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();

  function parseSearchParams(): TableParams {
    const p: TableParams = {};
    const sp = searchParams;
    const page = sp.get("page");
    const pageSize = sp.get("pageSize");
    const searchTerm = sp.get("searchTerm");
    const isDeleted = sp.get("isDeleted");
    const sortBy = sp.get("sortBy");
    const sortDir = sp.get("sortDir");
    if (page) p.page = Number(page);
    if (pageSize) p.pageSize = Number(pageSize);
    if (searchTerm) p.searchTerm = searchTerm;
    if (isDeleted) p.isDeleted = isDeleted === "true";
    if (sortBy) p.sortBy = sortBy;
    if (sortDir) p.sortDir = sortDir as TableParams["sortDir"];
    return p;
  }

  const initialParams = useMemo(
    () => ({ page: 1, pageSize: 10, isDeleted: false, ...parseSearchParams() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString()],
  );

  const [tableParams, setTableParamsLocal] = useState<TableParams>(initialParams);

  const { rows, meta, loading: dataLoading, error: dataError, reload } = useTableData<Record<string, unknown>>("/users", tableParams);
  const data = (rows ?? []).map((r) => toUiUser(r)) as User[];

  const [opLoading, setOpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataError) setError(dataError);
  }, [dataError]);

  useEffect(() => {
    const fromUrl = parseSearchParams();
    const same =
      JSON.stringify({ page: tableParams.page, pageSize: tableParams.pageSize, searchTerm: tableParams.searchTerm, sortBy: tableParams.sortBy, sortDir: tableParams.sortDir }) ===
      JSON.stringify({ page: fromUrl.page, pageSize: fromUrl.pageSize, searchTerm: fromUrl.searchTerm, sortBy: fromUrl.sortBy, sortDir: fromUrl.sortDir });
    if (!same) {
      setTableParamsLocal(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function updateUrlWithParams(next: Partial<TableParams>) {
    const merged: TableParams = { ...(tableParams ?? {}), ...next };
    const sp = new URLSearchParams();
    if (merged.page !== undefined) sp.set("page", String(merged.page));
    if (merged.pageSize !== undefined) sp.set("pageSize", String(merged.pageSize));
    if (merged.searchTerm !== undefined && merged.searchTerm !== "") sp.set("searchTerm", String(merged.searchTerm));
    if (merged.sortBy !== undefined) sp.set("sortBy", String(merged.sortBy));
    if (merged.sortDir !== undefined) sp.set("sortDir", String(merged.sortDir));
    if (merged.isDeleted !== undefined && merged.isDeleted !== null) sp.set("isDeleted", String(merged.isDeleted));
    setSearchParams(sp, { replace: true });
  }

  const loading = dataLoading || opLoading;

  const load = useCallback(async () => {
    setError(null);
    try {
      reload();
    } catch (e) {
      setError("Failed to load users");
      throw e;
    }
  }, [reload]);

  const createOrUpdate = useCallback(
    async (editingId: string | null, values: { firstName: string; lastName: string; email: string; role: string; password?: string }) => {
      setOpLoading(true);
      setError(null);
      try {
        if (editingId) {
          await updateUser(editingId, values as Partial<typeof values>);
        } else {
          await createUser(values);
        }
        reload();
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message);
        throw e;
      } finally {
        setOpLoading(false);
      }
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      setOpLoading(true);
      setError(null);
      try {
        await deleteUser(id);
        await reload();
      } catch (e) {
        setError("Delete failed");
        throw e;
      } finally {
        setOpLoading(false);
      }
    },
    [reload],
  );

  return {
    tableParams,
    setTableParamsLocal,
    data,
    meta,
    loading,
    error,
    reload,
    updateUrlWithParams,
    load,
    createOrUpdate,
    remove,
  } as const;
}
