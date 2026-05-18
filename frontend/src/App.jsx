import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeAchievements } from './pages/EmployeeAchievements';
import { EmployeeProgress } from './pages/EmployeeProgress';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { ManagerTeam } from './pages/ManagerTeam';
import { ManagerApproval } from './pages/ManagerApproval';
import { ManagerCheckins } from './pages/ManagerCheckins';
import { ManagerReports } from './pages/ManagerReports';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCycles } from './pages/admin/AdminCycles';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminAudit } from './pages/admin/AdminAudit';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Employee Routes */}
              <Route
                path="/employee/*"
                element={
                  <ProtectedRoute allowedRole="employee">
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<EmployeeDashboard />} />
                        <Route path="/achievements" element={<EmployeeAchievements />} />
                        <Route path="/progress" element={<EmployeeProgress />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Manager Routes */}
              <Route
                path="/manager/*"
                element={
                  <ProtectedRoute allowedRole="manager">
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<ManagerDashboard />} />
                        <Route path="/team" element={<ManagerTeam />} />
                        <Route path="/team/:employeeId" element={<ManagerApproval />} />
                        <Route path="/checkins" element={<ManagerCheckins />} />
                        <Route path="/reports" element={<ManagerReports />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/cycles" element={<AdminCycles />} />
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/reports" element={<AdminReports />} />
                        <Route path="/analytics" element={<AdminAnalytics />} />
                        <Route path="/audit" element={<AdminAudit />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Global 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

