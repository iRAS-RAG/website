import { Navigate, Route, Routes } from "react-router-dom";
import { isAdmin, isOperator, isSupervisor } from "../api/auth";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AIKnowledge from "../pages/admin/AIKnowledge";
import HardwareSensors from "../pages/admin/HardwareSensors";
import UserManagement from "../pages/admin/UserManagement";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/public/HomePage";
import SupervisorDashboard from "../pages/supervisor/SupervisorDashboard";

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

      {/* Operator */}
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

      {/* Admin */}
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

      {/* Supervisor */}
      <Route
        path="/supervisor/dashboard"
        element={
          <ProtectedRoute check={isSupervisor}>
            <SupervisorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/species"
        element={
          <ProtectedRoute check={isSupervisor}>
            <SupervisorDashboard section="species" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/feed-types"
        element={
          <ProtectedRoute check={isSupervisor}>
            <SupervisorDashboard section="feed-types" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/thresholds"
        element={
          <ProtectedRoute check={isSupervisor}>
            <SupervisorDashboard section="thresholds" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/schedule"
        element={
          <ProtectedRoute check={isSupervisor}>
            <SupervisorDashboard section="schedule" />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
