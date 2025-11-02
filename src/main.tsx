import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ProfileManagement from './components/ProfileManagement';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/" element={<LoginPage/>} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute requiredRole="Admin">
            <UserManagement/>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileManagement/>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<AppRoutes />);
