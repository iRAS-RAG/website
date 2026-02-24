import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from "@mui/material";
import React from "react";

export type Column<T> = {
  field: string;
  label?: string;
  sortable?: boolean;
  sortKey?: string; // optional server-side key
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  sortBy?: string | undefined;
  sortDir?: "asc" | "desc" | undefined;
  onSort?: (sortBy?: string | undefined, sortDir?: "asc" | "desc" | undefined) => void;
};

export function DataTable<T>({ columns, rows, sortBy, sortDir, onSort }: Props<T>) {
  return (
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, overflow: "hidden", boxShadow: (theme) => theme.shadows[1] }}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ backgroundColor: (theme) => theme.palette.background.paper }}>
            {columns.map((c) => {
              const key = c.sortKey ?? c.field;
              const active = c.sortable && sortBy === key;
              return (
                <TableCell
                  key={c.field}
                  sx={{
                    fontWeight: 700,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: (theme) => theme.palette.background.paper,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
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
          {rows.map((r, idx) => (
            <TableRow
              key={idx}
              hover
              sx={{
                backgroundColor: (theme) => (idx % 2 === 0 ? theme.palette.background.default : theme.palette.action.hover),
              }}
            >
              {columns.map((c) => (
                <TableCell key={c.field} sx={{ borderBottom: "none", py: 2 }}>
                  {c.render ? c.render(r) : ((r as unknown as Record<string, unknown>)[c.field] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
