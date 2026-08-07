import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'features/auth/context/AuthContext'
import ProtectedRoute from 'features/auth/components/ProtectedRoute'
import LoginPage from 'features/auth/pages/LoginPage'
import SignupPage from 'features/auth/pages/SignupPage'
import DashboardPage from 'features/project/pages/DashboardPage'
import ProjectPage from 'features/project/pages/ProjectPage'
import AnalyticsPage from 'features/audit/pages/AnalyticsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
          <Route path="/projects/:id/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

