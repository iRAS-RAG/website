// src/App.tsx
import Header from "./components/layout/public/Header";
import Footer from "./components/layout/public/Footer";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./theme/theme";
import AppRouter from "./router/router";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Đảm bảo có Header ở đây */}
        <Header />

        <Box component="main" sx={{ flexGrow: 1, pt: "64px" }}>
          {/* AppRouter sẽ hiển thị HomePage */}
          <AppRouter />
        </Box>

        {/* Đảm bảo có Footer ở đây */}
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
