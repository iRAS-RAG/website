import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React from "react";

export type Column<T> = {
  field: string;
  label?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
};

export function DataTable<T>({ columns, rows }: Props<T>) {
  return (
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, overflow: "hidden", boxShadow: (theme) => theme.shadows[1] }}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ backgroundColor: (theme) => theme.palette.background.paper }}>
            {columns.map((c) => (
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
                {c.label ?? c.field}
              </TableCell>
            ))}
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
