import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy load route components for code-splitting & bundle optimization
const RoleSelection = lazy(() => import('../components/auth/RoleSelection'));
const CommonLogin = lazy(() => import('../pages/auth/CommonLogin').then(m => ({ default: m.CommonLogin })));
const StudentLogin = lazy(() => import('../pages/auth/student/Login').then(m => ({ default: m.StudentLogin })));
const StudentSignup = lazy(() => import('../pages/auth/student/Signup').then(m => ({ default: m.StudentSignup })));
const StudentForgotPassword = lazy(() => import('../pages/auth/student/ForgotPassword').then(m => ({ default: m.StudentForgotPassword })));
const StudentResetPassword = lazy(() => import('../pages/auth/student/ResetPassword').then(m => ({ default: m.StudentResetPassword })));
const AlumniLogin = lazy(() => import('../pages/auth/alumni/Login').then(m => ({ default: m.AlumniLogin })));
const AlumniSignup = lazy(() => import('../pages/auth/alumni/Signup').then(m => ({ default: m.AlumniSignup })));
const AlumniForgotPassword = lazy(() => import('../pages/auth/alumni/ForgotPassword').then(m => ({ default: m.AlumniForgotPassword })));
const CdcLogin = lazy(() => import('../pages/auth/cdc/Login').then(m => ({ default: m.CdcLogin })));

const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const CdcDashboard = lazy(() => import('../pages/cdc/CdcDashboard'));
const AlumniDashboard = lazy(() => import('../pages/alumni/AlumniDashboard'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#060a12] via-[#09101f] to-[#04070e] text-slate-400">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="text-xs font-semibold tracking-wide text-slate-400">Loading page...</span>
    </div>
  </div>
);

export const AuthRoutes = () => (
  <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<CommonLogin />} />
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
  </Suspense>
);

