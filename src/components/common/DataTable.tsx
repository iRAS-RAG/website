import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
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
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableCell key={c.field}>{c.label ?? c.field}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={idx}>
              {columns.map((c) => (
                <TableCell key={c.field}>{c.render ? c.render(r) : ((r as any)[c.field] as React.ReactNode)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
