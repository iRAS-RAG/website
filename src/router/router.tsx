import { Navigate, Route, Routes } from "react-router-dom";
import { isAdmin, isOperator, isSupervisor } from "../api/auth";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AIKnowledge from "../pages/admin/AIKnowledge";
import HardwareManagement from "../pages/admin/HardwareManagement";
import UserManagement from "../pages/admin/UserManagement";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/public/HomePage";
import SupervisorDashboard from "../pages/supervisor/SupervisorDashboard";

import AIAdvisory from "../pages/operator/AIAdvisory";
import AlertCenter from "../pages/operator/AlertCenter";
import TankManagement from "../pages/operator/BatchManagement";
import MaintenanceLog from "../pages/operator/MaintenanceLog";
import OperatorDashboard from "../pages/operator/OperatorDashboard";
import RealTimeSensors from "../pages/operator/RealTimeSensors";
import BatchDetailPage from "../pages/supervisor/BatchDetailPage";
import BatchListPage from "../pages/supervisor/BatchListPage";
import HarvestBatchPage from "../pages/supervisor/HarvestBatchPage";
import OperatorManagement from "../pages/supervisor/OperatorManagement";
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

      {/* Batches - Supervisor Access */}
      <Route
        path="/supervisor/batches"
        element={
          <ProtectedRoute check={isSupervisor}>
            <BatchListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/batches/:id"
        element={
          <ProtectedRoute check={isSupervisor}>
            <BatchDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/batches/:id/harvest"
        element={
          <ProtectedRoute check={isSupervisor}>
            <HarvestBatchPage />
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
            <HardwareManagement />
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
        path="/supervisor/feed-types"
        element={
          <ProtectedRoute check={isSupervisor}>
            <SupervisorDashboard section="feed-types" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/operators"
        element={
          <ProtectedRoute check={isSupervisor}>
            <OperatorManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/species-configs"
        element={
          <ProtectedRoute check={isSupervisor}>
            <SupervisorDashboard section="species-configs" />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
