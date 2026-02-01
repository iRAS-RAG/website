import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/public/HomePage";
import TechnicianDashboard from "../pages/technician/TechnicianDashboard";
import RealTimeSensors from "../pages/technician/RealTimeSensors";
import AlertCenter from "../pages/technician/AlertCenter";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
      <Route path="/technician/sensors" element={<RealTimeSensors />} />
      <Route path="/technician/alerts" element={<AlertCenter />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
