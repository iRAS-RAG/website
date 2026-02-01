import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./theme/theme";
import AppRouter from "./router/router";
import Header from "./components/public/public/Header";
import Footer from "./components/public/public/Footer";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  // Kiểm tra nếu là trang dashboard thì ẩn header/footer public
  const isDashboard = location.pathname.startsWith("/technician");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {!isDashboard && <Header />}

        <Box
          component="main"
          sx={{ flexGrow: 1, pt: isDashboard ? 0 : "64px" }}
        >
          <AppRouter />
        </Box>

        {!isDashboard && <Footer />}
      </Box>
    </ThemeProvider>
  );
}

export default App;
