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
    const user: User = { role, token };
    setUser(user);
  };

  const login = async (role: Role, data: any, endpoint: string, redirectPath: string) => {
    const payload = normalizeEmail(data);
    console.log("Login Request", payload);
    try {
      const res = await api.post(endpoint, payload);
      const response = res;
      console.log("API Response", response);
      const token = res.data.token || res.data.data?.token || res.data.data?.accessToken;
      storeUser(role, token);
      toastSuccess('Login successful');
      navigate(redirectPath);
    } catch (err: any) {
      const response = err.response;
      console.log("API Response", response);
      toastError(err.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (role: Role, data: any, endpoint: string, redirectPath: string) => {
    // Strip fields the backend doesn't expect
    const { confirmPassword, ...payload } = data;
    const normalizedPayload = normalizeEmail(payload);
    console.log('Signup Payload:', normalizedPayload);
    try {
      const res = await api.post(endpoint, normalizedPayload);
      const token = res.data.token || res.data.data?.token || res.data.data?.accessToken;
      storeUser(role, token);
      toastSuccess('Account created');
      navigate(redirectPath);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Signup failed');
    }
  };

  return { login, signup };
};
