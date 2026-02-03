import { Navigate, Route, Routes } from "react-router-dom";
import { isAdmin, isManager } from "../mocks/auth";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AIKnowledge from "../pages/admin/AIKnowledge";
import HardwareSensors from "../pages/admin/HardwareSensors";
import UserManagement from "../pages/admin/UserManagement";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import HomePage from "../pages/public/HomePage";

import AIAdvisory from "../pages/technician/AIAdvisory";
import AlertCenter from "../pages/technician/AlertCenter";
import MaintenanceLog from "../pages/technician/MaintenanceLog";
import RealTimeSensors from "../pages/technician/RealTimeSensors";
import TankManagement from "../pages/technician/TankManagement";
import TechnicianDashboard from "../pages/technician/TechnicianDashboard";

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
      <Route path="/admin/dashboard" element={isAdmin() ? <AdminDashboard /> : <Navigate to="/" replace />} />
      <Route path="/admin/users" element={isAdmin() ? <UserManagement /> : <Navigate to="/" replace />} />
      <Route path="/admin/ai" element={isAdmin() ? <AIKnowledge /> : <Navigate to="/" replace />} />
      <Route path="/admin/hardware" element={isAdmin() ? <HardwareSensors /> : <Navigate to="/" replace />} />

      {/* Manager */}
      <Route path="/manager/dashboard" element={isManager() ? <ManagerDashboard /> : <Navigate to="/" replace />} />
      <Route path="/manager/species" element={isManager() ? <ManagerDashboard section="species" /> : <Navigate to="/" replace />} />
      <Route path="/manager/feeds" element={isManager() ? <ManagerDashboard section="feeds" /> : <Navigate to="/" replace />} />
      <Route path="/manager/thresholds" element={isManager() ? <ManagerDashboard section="thresholds" /> : <Navigate to="/" replace />} />
      <Route path="/manager/schedule" element={isManager() ? <ManagerDashboard section="schedule" /> : <Navigate to="/" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
