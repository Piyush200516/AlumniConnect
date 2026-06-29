import { Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from '../components/auth/RoleSelection';
import { StudentLogin } from '../pages/auth/student/Login';
import { StudentSignup } from '../pages/auth/student/Signup';
import { StudentForgotPassword } from '../pages/auth/student/ForgotPassword';
import { StudentResetPassword } from '../pages/auth/student/ResetPassword';
import { AlumniLogin } from '../pages/auth/alumni/Login';
import { AlumniSignup } from '../pages/auth/alumni/Signup';
import { AlumniForgotPassword } from '../pages/auth/alumni/ForgotPassword';
import { CdcLogin } from '../pages/auth/cdc/Login';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import StudentDashboard from '../pages/student/StudentDashboard';
import CdcDashboard from '../pages/cdc/CdcDashboard';
import AlumniDashboard from '../pages/alumni/AlumniDashboard';

export const AuthRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/auth" replace />} />
    <Route path="/auth" element={<RoleSelection />} />
    <Route path="/auth/student/login" element={<StudentLogin />} />
    <Route path="/auth/student/signup" element={<StudentSignup />} />
    <Route path="/auth/student/forgot-password" element={<StudentForgotPassword />} />
    <Route path="/reset-password" element={<StudentResetPassword />} />
    <Route path="/auth/alumni/login" element={<AlumniLogin />} />
    <Route path="/auth/alumni/signup" element={<AlumniSignup />} />
    <Route path="/auth/alumni/forgot-password" element={<AlumniForgotPassword />} />
    <Route path="/auth/cdc/login" element={<CdcLogin />} />

    {/* Protected Student Routes */}
    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
      <Route path="/student/dashboard" element={<StudentDashboard />} />
    </Route>

    {/* Protected Alumni Routes */}
    <Route element={<ProtectedRoute allowedRoles={['alumni']} />}>
      <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
    </Route>

    {/* Protected CDC Routes */}
    <Route element={<ProtectedRoute allowedRoles={['cdc']} />}>
      <Route path="/cdc/dashboard" element={<CdcDashboard />} />
    </Route>
  </Routes>
);

