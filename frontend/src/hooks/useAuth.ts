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

  const storeUser = (role: Role, token: string) => {
    const user: User = { role, token };
    setUser(user);
    localStorage.setItem('token', token);
  };

  const login = async (role: Role, data: any, endpoint: string, redirectPath: string) => {
    const payload = data;
    console.log("Login Request", payload);
    try {
      const res = await api.post(endpoint, data);
      const response = res;
      console.log("API Response", response);
      const token = res.data.token;
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
    try {
      const res = await api.post(endpoint, data);
      const token = res.data.token;
      storeUser(role, token);
      toastSuccess('Account created');
      navigate(redirectPath);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Signup failed');
    }
  };

  return { login, signup };
};
