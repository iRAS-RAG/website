import { createTheme } from "@mui/material/styles";

/* =========================================================
   🎨 COLOR SYSTEM — iRAS-RAG Brand Identity
   ========================================================= */
const COLOR_PRIMARY = "#2A85FF"; // AI Blue
const COLOR_SECONDARY = "#27C4A8"; // Aqua
const COLOR_WARNING = "#FFB547";
const COLOR_DANGER = "#F04438";
const COLOR_SUCCESS = "#32D583";

const NEUTRAL_TEXT = "#1F2937";
const NEUTRAL_TEXT_SECONDARY = "#6B7280";
const NEUTRAL_BORDER = "#D1D5DB";
const NEUTRAL_BG = "#F4F7FA";

export const theme = createTheme({
  palette: {
    primary: { main: COLOR_PRIMARY },
    secondary: { main: COLOR_SECONDARY },
    warning: { main: COLOR_WARNING },
    error: { main: COLOR_DANGER },
    success: { main: COLOR_SUCCESS },
    background: {
      default: NEUTRAL_BG,
      paper: "#FFFFFF",
    },
    text: {
      primary: NEUTRAL_TEXT,
      secondary: NEUTRAL_TEXT_SECONDARY,
    },
    divider: NEUTRAL_BORDER,
  },

  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontWeight: 800, fontSize: "2.5rem" },
    h2: { fontWeight: 700, fontSize: "2rem" },
    h3: { fontWeight: 600, fontSize: "1.25rem" },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem", color: NEUTRAL_TEXT_SECONDARY },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 20px",
        },
        containedPrimary: {
          boxShadow: "0 4px 12px rgba(42,133,255,0.25)",
          "&:hover": { backgroundColor: "#1F6FDB" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
          border: `1px solid ${NEUTRAL_BORDER}`,
        },
      },
    },
  },
});
