import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types/auth';
import api from '../../services/api';

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  enrollmentNumber: string;
  branch: string;
  course: string;
  graduationYear: number;
  phone: string | null;
  bio: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  resumeUrl: string | null;
  profileImage: string | null;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  profile: StudentProfile | null;
  setProfile: (profile: StudentProfile | null) => void;
  loading: boolean;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  completionPercentage: number;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as any;
    if (token && role) {
      return { token, role };
    }
    return null;
  });

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(!!(user && user.role === 'student'));

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', newUser.token);
      localStorage.setItem('role', newUser.role);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth';
  };

  const refreshProfile = async () => {
    if (!user || user.role !== 'student') {
      setProfile(null);
      return;
    }
    try {
      const res = await api.get('/student/profile');
      setProfile(res.data.data);
    } catch (err: any) {
      console.error('Failed to fetch student profile:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    }
  };

  const calculateCompletionPercentage = (p: StudentProfile) => {
    let basic = 0;
    if (p.fullName) basic += 10;
    if (p.enrollmentNumber) basic += 5;
    if (p.branch) basic += 5;
    if (p.course) basic += 5;
    if (p.graduationYear) basic += 5;

    let contact = 0;
    if (p.email) contact += 10;
    if (p.phone) contact += 10;

    let social = 0;
    if (p.linkedinUrl) social += 10;
    if (p.githubUrl) social += 10;

    let skills = p.skills && p.skills.length > 0 ? 15 : 0;
    let resume = p.resumeUrl ? 15 : 0;

    return basic + contact + social + skills + resume;
  };

  const completionPercentage = profile ? calculateCompletionPercentage(profile) : 0;

  useEffect(() => {
    const loadProfile = async () => {
      if (user && user.role === 'student') {
        setLoading(true);
        await refreshProfile();
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        loading,
        logout,
        refreshProfile,
        completionPercentage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
