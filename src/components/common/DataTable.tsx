import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import React from "react";

export type Column<T> = {
  field: string;
  label?: React.ReactNode;
  sortable?: boolean;
  sortKey?: string; // optional server-side key
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  sortBy?: string | undefined;
  sortDir?: "asc" | "desc" | undefined;
  onSort?: (
    sortBy?: string | undefined,
    sortDir?: "asc" | "desc" | undefined,
  ) => void;
};

export function DataTable<T>({
  columns,
  rows,
  sortBy,
  sortDir,
  onSort,
}: Props<T>) {
  return (
    <TableContainer
      component={Box}
      sx={{ overflowX: "auto", bgcolor: "#FFFFFF" }}
    >
      <Table size="medium" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#F1F5F9" }}>
            {columns.map((c, idx) => {
              const key = c.sortKey ?? c.field;
              const active = c.sortable && sortBy === key;
              const isLast = idx === columns.length - 1;

              return (
                <TableCell
                  key={c.field}
                  align={isLast && c.field === "actions" ? "right" : "left"}
                  sx={{
                    fontWeight: 600,
                    color: "#475569",
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #E2E8F0",
                    py: 1.5,
                  }}
                >
                  {c.sortable ? (
                    <TableSortLabel
                      active={Boolean(active)}
                      direction={active && sortDir ? sortDir : "asc"}
                      onClick={() => {
                        if (!onSort) return;
                        if (!active) return onSort(key, "asc");
                        if (sortDir === "asc") return onSort(key, "desc");
                        return onSort(undefined, undefined);
                      }}
                      sx={{
                        "&.MuiTableSortLabel-active": { color: "#0F172A" },
                      }}
                    >
                      {c.label ?? c.field}
                    </TableSortLabel>
                  ) : (
                    (c.label ?? c.field)
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                align="center"
                sx={{ py: 6, color: "#94A3B8" }}
              >
                Không tìm thấy dữ liệu.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r, idx) => (
              <TableRow
                key={idx}
                hover
                sx={{
                  transition: "background-color 0.2s",
                  "&:hover": { backgroundColor: "#F8FAFC !important" },
                  "& > td": { borderBottom: "1px solid #F1F5F9" },
                  "&:last-child > td": { borderBottom: "none" },
                }}
              >
                {columns.map((c, colIdx) => (
                  <TableCell
                    key={c.field}
                    align={
                      colIdx === columns.length - 1 && c.field === "actions"
                        ? "right"
                        : "left"
                    }
                    sx={{ py: 2 }}
                  >
                    {c.render
                      ? c.render(r)
                      : ((r as unknown as Record<string, unknown>)[
                          c.field
                        ] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
