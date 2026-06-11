import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../layout/AuthProvider';
import type { Role } from '../../types/user';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    // Not authenticated, send to role selection
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Role mismatch, redirect to correct dashboard
    const dashboardPath = `/${user.role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  // All good, render nested route
  return <Outlet />;
};
