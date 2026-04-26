import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';

/**
 * PrivateRoute — Redirects unauthenticated users to /login.
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-sm font-medium text-slate-400">Loading CRM...</p>
      </div>
    </div>
  );

  return user ? children : <Navigate to="/login" replace />;
};

/**
 * crmRoleRoute — Redirects users who don't have the required role to /dashboard.
 * Used to protect Admin-only and Manager-only pages.
 */
const CrmRoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes — All authenticated users */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <PrivateRoute>
                <LeadsPage />
              </PrivateRoute>
            }
          />

          {/* Admin + Manager only */}
          <Route
            path="/reports"
            element={
              <CrmRoleRoute allowedRoles={['Admin', 'Manager']}>
                <ReportsPage />
              </CrmRoleRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/settings"
            element={
              <CrmRoleRoute allowedRoles={['Admin']}>
                <SettingsPage />
              </CrmRoleRoute>
            }
          />

          {/* Admin only — User Management */}
          <Route
            path="/users"
            element={
              <CrmRoleRoute allowedRoles={['Admin']}>
                <UserManagementPage />
              </CrmRoleRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
