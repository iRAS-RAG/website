import { Navigate, Route, Routes } from "react-router-dom";
import { isAdmin, isManager } from "../mocks/auth";

import UserManagement from "../pages/admin/UserManagement";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import HomePage from "../pages/public/HomePage";

import AlertCenter from "../pages/technician/AlertCenter";
import RealTimeSensors from "../pages/technician/RealTimeSensors";
import TankManagement from "../pages/technician/TankManagement";
import AIAdvisory from "../pages/technician/AIAdvisory";
import TechnicianDashboard from "../pages/technician/TechnicianDashboard";
import MaintenanceLog from "../pages/technician/MaintenanceLog";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Auth */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Technician */}
      <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
      <Route path="/technician/sensors" element={<RealTimeSensors />} />
      <Route path="/technician/alerts" element={<AlertCenter />} />
      <Route path="/technician/tanks" element={<TankManagement />} />
      <Route path="/technician/ai-advisory" element={<AIAdvisory />} />
      <Route path="/technician/maintenance" element={<MaintenanceLog />} />

      {/* Admin */}
      <Route
        path="/admin/users"
        element={isAdmin() ? <UserManagement /> : <Navigate to="/" replace />}
      />

      {/* Manager */}
      <Route
        path="/manager/dashboard"
        element={
          isManager() ? <ManagerDashboard /> : <Navigate to="/" replace />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
