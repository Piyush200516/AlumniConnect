import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toastSuccess, toastError } from '../utils/toast';
import type { Role } from '../types/user';
import type { User } from '../types/auth';
import { AuthContext } from '../components/layout/AuthProvider';

export const useAuth = () => {
  const { setUser } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const normalizeEmail = (value: any) => {
    if (value && typeof value.email === 'string') {
      return { ...value, email: value.email.trim().toLowerCase() };
    }
    return value;
  };

  const storeUser = (role: Role, token: string) => {
    localStorage.clear();
    sessionStorage.clear();
    const normalizedRole = role.trim().toLowerCase() as Role;
    const user: User = { role: normalizedRole, token };
    setUser(user);
  };

  const login = async (role?: Role, data?: any, endpoint?: string, redirectPath?: string) => {
    const payload = normalizeEmail(data);
    console.log("Login Request", payload);
    try {
      const finalEndpoint = endpoint || '/auth/login';
      const res = await api.post(finalEndpoint, payload);
      console.log("API Response", res);
      const token = res.data?.token || res.data?.data?.token || res.data?.data?.accessToken || res.data?.accessToken;
      
      const rawRole = role || res.data?.data?.user?.role || res.data?.user?.role;
      if (!rawRole) {
        throw new Error('Role not specified in login response');
      }
      
      const finalRole = rawRole.trim().toLowerCase() as Role;
      storeUser(finalRole, token);
      toastSuccess('Login successful');
      
      const finalRedirectPath = redirectPath || `/${finalRole}/dashboard`;
      navigate(finalRedirectPath);
    } catch (err: any) {
      console.error("Login API Error", err.response);
      toastError(err.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (role: Role, data: any, endpoint: string, redirectPath: string) => {
    // Strip confirmPassword and map frontend fields to backend validation schema
    const { confirmPassword, fullName, company, linkedinUrl, enrollmentNumber, ...rest } = data;
    
    const payload: any = {
      ...rest,
      name: data.name || fullName,
    };

    if (role === 'alumni') {
      if (company) payload.currentCompany = company;
      if (data.passingYear) payload.passingYear = Number(data.passingYear);
      if (data.designation) payload.designation = data.designation;
    } else if (role === 'student') {
      if (enrollmentNumber) payload.enrollmentNumber = enrollmentNumber;
      if (data.graduationYear) payload.graduationYear = Number(data.graduationYear);
    }

    const normalizedPayload = normalizeEmail(payload);
    console.log('Signup Payload:', normalizedPayload);
    try {
      const res = await api.post(endpoint, normalizedPayload);
      const token = res.data?.token || res.data?.data?.token || res.data?.data?.accessToken || res.data?.accessToken;
      if (token) {
        storeUser(role, token);
      }
      toastSuccess('Account created successfully');
      navigate(redirectPath);
    } catch (err: any) {
      console.error('Signup API Error:', err.response?.data || err);
      toastError(err.response?.data?.message || 'Signup failed');
    }
  };

  return { login, signup };
};
