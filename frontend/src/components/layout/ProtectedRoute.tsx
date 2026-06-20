import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../layout/AuthProvider';
import type { Role } from '../../types/user';

const normalizeRole = (role: unknown): Role | null => {
  if (typeof role !== 'string') {
    return null;
  }

  const normalized = role.trim().toLowerCase();
  if (normalized === 'student' || normalized === 'alumni' || normalized === 'cdc') {
    return normalized;
  }

  return null;
};

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuthContext();
  const location = useLocation();
  const userRole = normalizeRole(user?.role);

  if (!user || !userRole) {
    // Not authenticated, send to role selection
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Role mismatch, redirect to correct dashboard
    const dashboardPath = `/${userRole}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  // All good, render nested route
  return <Outlet />;
};
