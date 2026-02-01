import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { useLocation } from "react-router-dom";
import Footer from "./components/public/public/Footer";
import Header from "./components/public/public/Header";
import AppRouter from "./router/router";
import { theme } from "./theme/theme";

function App() {
  const location = useLocation();
  // Kiểm tra nếu là một trang dashboard/admin thì ẩn header/footer public
  const isDashboard = location.pathname.startsWith("/technician") || location.pathname.startsWith("/admin");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {!isDashboard && <Header />}

        <Box component="main" sx={{ flexGrow: 1, pt: isDashboard ? 0 : "64px" }}>
          <AppRouter />
        </Box>

        {!isDashboard && <Footer />}
      </Box>
    </ThemeProvider>
  );
}

export default App;
