import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
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
    try {
      const finalEndpoint = endpoint || '/auth/login';
      const res = await api.post(finalEndpoint, payload);
      const token = res.data?.token || res.data?.data?.token || res.data?.data?.accessToken || res.data?.accessToken;
      
      const rawRole = role || res.data?.data?.user?.role || res.data?.user?.role;
      if (!rawRole) {
        throw new Error('Role not specified in login response');
      }
      
      if (typeof token !== 'string' || !token) {
        throw new Error('Login response did not include an access token');
      }

      const finalRole = rawRole.trim().toLowerCase() as Role;
      storeUser(finalRole, token);
      toastSuccess('Login successful');
      
      const finalRedirectPath = redirectPath || `/${finalRole}/dashboard`;
      navigate(finalRedirectPath);
    } catch (err) {
      toastError(getErrorMessage(err, 'Login failed'));
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
      if (enrollmentNumber) payload.enrollmentNumber = enrollmentNumber;
      if (linkedinUrl) payload.linkedinUrl = linkedinUrl;
    } else if (role === 'student') {
      if (enrollmentNumber) payload.enrollmentNumber = enrollmentNumber;
      if (data.graduationYear) payload.graduationYear = Number(data.graduationYear);
    }

    const normalizedPayload = normalizeEmail(payload);
    try {
      const res = await api.post(endpoint, normalizedPayload);
      const token = res.data?.token || res.data?.data?.token || res.data?.data?.accessToken || res.data?.accessToken;
      if (token) {
        storeUser(role, token);
      }
      toastSuccess('Account created successfully');
      navigate(redirectPath);
    } catch (err) {
      toastError(getErrorMessage(err, 'Signup failed'));
    }
  };

  return { login, signup };
};
