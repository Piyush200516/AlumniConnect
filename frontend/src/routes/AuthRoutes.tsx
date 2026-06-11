import { Routes, Route } from 'react-router-dom';
import RoleSelection from '../components/auth/RoleSelection';
import StudentLogin from '../pages/auth/student/Login';
import StudentSignup from '../pages/auth/student/Signup';
import AlumniLogin from '../pages/auth/alumni/Login';
import AlumniSignup from '../pages/auth/alumni/Signup';
import CdcLogin from '../pages/auth/cdc/Login';

export const AuthRoutes = () => (
  <Routes>
    <Route path="/auth" element={<RoleSelection />} />
    <Route path="/auth/student/login" element={<StudentLogin />} />
    <Route path="/auth/student/signup" element={<StudentSignup />} />
    <Route path="/auth/alumni/login" element={<AlumniLogin />} />
    <Route path="/auth/alumni/signup" element={<AlumniSignup />} />
    <Route path="/auth/cdc/login" element={<CdcLogin />} />
  </Routes>
);
