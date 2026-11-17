import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

// Role hierarchy must match the backend exactly:
// Employee 1, HR 2, Manager 3, Admin 4, SuperAdmin 5.
// (The backend's authorizeRoles() treats Admin as >= Admin, so a lower level
// here would let HR/Manager through the UI guard only to get a 403 from the API.)
const ROLE_LEVEL: Record<string, number> = {
  Employee: 1,
  HR: 2,
  Manager: 3,
  Admin: 4,
  SuperAdmin: 5
};

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRoleLevel = ROLE_LEVEL[role as keyof typeof ROLE_LEVEL] || 0;
    const requiredRoleLevel = ROLE_LEVEL[requiredRole as keyof typeof ROLE_LEVEL] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}