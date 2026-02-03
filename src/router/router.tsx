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

import { isOperator } from "../mocks/auth";
import AIAdvisory from "../pages/operator/AIAdvisory";
import AlertCenter from "../pages/operator/AlertCenter";
import MaintenanceLog from "../pages/operator/MaintenanceLog";
import OperatorDashboard from "../pages/operator/OperatorDashboard";
import RealTimeSensors from "../pages/operator/RealTimeSensors";
import TankManagement from "../pages/operator/TankManagement";
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Auth */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Operator (protected) */}
      <Route
        path="/operator/dashboard"
        element={
          <ProtectedRoute check={isOperator}>
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/sensors"
        element={
          <ProtectedRoute check={isOperator}>
            <RealTimeSensors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/alerts"
        element={
          <ProtectedRoute check={isOperator}>
            <AlertCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/tanks"
        element={
          <ProtectedRoute check={isOperator}>
            <TankManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/ai-advisory"
        element={
          <ProtectedRoute check={isOperator}>
            <AIAdvisory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operator/maintenance"
        element={
          <ProtectedRoute check={isOperator}>
            <MaintenanceLog />
          </ProtectedRoute>
        }
      />

      {/* Admin (protected) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute check={isAdmin}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute check={isAdmin}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ai"
        element={
          <ProtectedRoute check={isAdmin}>
            <AIKnowledge />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hardware"
        element={
          <ProtectedRoute check={isAdmin}>
            <HardwareSensors />
          </ProtectedRoute>
        }
      />

      {/* Manager (protected) */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute check={isManager}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/species"
        element={
          <ProtectedRoute check={isManager}>
            <ManagerDashboard section="species" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/feeds"
        element={
          <ProtectedRoute check={isManager}>
            <ManagerDashboard section="feeds" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/thresholds"
        element={
          <ProtectedRoute check={isManager}>
            <ManagerDashboard section="thresholds" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/schedule"
        element={
          <ProtectedRoute check={isManager}>
            <ManagerDashboard section="schedule" />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
