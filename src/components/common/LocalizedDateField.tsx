import type { SxProps, Theme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";

type LocalizedDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
};

function toPickerValue(value: string): Dayjs | null {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

export default function LocalizedDateField({ label, value, onChange, helperText, error, required, disabled, fullWidth = true, size = "small", sx }: LocalizedDateFieldProps) {
  return (
    <DatePicker
      label={label}
      value={toPickerValue(value)}
      onChange={(nextValue) => onChange(nextValue ? nextValue.format("YYYY-MM-DD") : "")}
      format="DD/MM/YYYY"
      disabled={disabled}
      slotProps={{
        textField: {
          fullWidth,
          size,
          error,
          helperText,
          required,
          sx,
        },
      }}
    />
  );
}
