import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./components/common/ToastProvider";

dayjs.locale("vi");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
        <ToastProvider>
          <App />
        </ToastProvider>
      </LocalizationProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
