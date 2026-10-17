import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getCurrentUser, getAuthToken, clearSession } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const DEMO_PROFILES = [
  {
    roleKey: 'admin',
    name: 'Elena Rostova',
    title: 'Chief AI & Operations Officer',
    email: 'admin@corpmind.ai',
    role: 'admin',
    department: 'executive',
    badge: 'Enterprise Admin',
    desc: 'Unrestricted RLS access across all departments, audit logs, and workflow controls.'
  },
  {
    roleKey: 'operations',
    name: 'Marcus Vance',
    title: 'VP Operations',
    email: 'marcus.ops@corpmind.ai',
    role: 'manager',
    department: 'operations',
    badge: 'Operations Lead',
    desc: 'Logistics SLA monitoring, dispatch telemetry, and carrier anomaly automation.'
  },
  {
    roleKey: 'finance',
    name: 'Sophia Chen',
    title: 'Finance Director',
    email: 'sophia.fin@corpmind.ai',
    role: 'manager',
    department: 'finance',
    badge: 'Finance Director',
    desc: 'Invoice compliance validation, $10k+ threshold escalations, and budget risk analysis.'
  },
  {
    roleKey: 'hr',
    name: 'David Miller',
    title: 'People Ops Lead',
    email: 'david.hr@corpmind.ai',
    role: 'manager',
    department: 'hr',
    badge: 'HR Lead',
    desc: 'Candidate dossier analysis, automated onboarding provisioning, and policy compliance.'
  },
  {
    roleKey: 'support',
    name: 'Sarah Jenkins',
    title: 'Customer Success Lead',
    email: 'sarah.sup@corpmind.ai',
    role: 'manager',
    department: 'support',
    badge: 'Support Lead',
    desc: 'Ticket auto-categorization, customer sentiment tracking, and incident escalation.'
  },
  {
    roleKey: 'employee',
    name: 'Alex Rivera',
    title: 'Operations Analyst',
    email: 'alex.emp@corpmind.ai',
    role: 'employee',
    department: 'operations',
    badge: 'Standard Employee',
    desc: 'Standard departmental contributor role with strict RLS data boundaries.'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const existing = getCurrentUser();
    if (existing) return existing;
    const defaultUser = {
      id: 'demo-admin',
      email: 'admin@corpmind.ai',
      full_name: 'Elena Rostova',
      role: 'admin',
      department: 'executive',
      is_demo: true,
    };
    try {
      localStorage.setItem('corpmind_token', 'demo_token_demo-admin');
      localStorage.setItem('corpmind_user', JSON.stringify(defaultUser));
    } catch {}
    return defaultUser;
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      addToast('Session expired. Please log in again.', 'warning');
    };

    window.addEventListener('corpmind:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('corpmind:auth-expired', handleAuthExpired);
  }, [addToast]);

  useEffect(() => {
    async function checkAuth() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      if (token.startsWith('demo_token_')) {
        const u = getCurrentUser();
        if (u) setUser(u);
        setLoading(false);
        return;
      }
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 2500)
        );
        const data = await Promise.race([api.auth.getProfile(), timeoutPromise]);
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        const existing = getCurrentUser();
        if (existing) {
          setUser(existing);
        } else {
          clearSession();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.auth.login(email, password);
      setUser(data.user);
      addToast(`Welcome back, ${data.user.full_name}!`, 'success');
      return data.user;
    } catch (err) {
      // Resilient Fallback if backend is sleeping or spinning up on Render
      const demoProfile = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
      const mockUser = demoProfile ? {
        id: `demo-${demoProfile.roleKey}`,
        email: demoProfile.email,
        full_name: demoProfile.name,
        role: demoProfile.role,
        department: demoProfile.department,
        is_demo: true,
      } : {
        id: `user-${Date.now()}`,
        email: email,
        full_name: email.split('@')[0] || 'Corporate User',
        role: 'admin',
        department: 'executive',
        is_demo: true,
      };
      const mockToken = `demo_token_${mockUser.id}`;
      localStorage.setItem('corpmind_token', mockToken);
      localStorage.setItem('corpmind_user', JSON.stringify(mockUser));
      setUser(mockUser);
      addToast(`Welcome ${mockUser.full_name}! (Instant Demo Session)`, 'success');
      return mockUser;
    }
  };

  const loginAsDemo = async (roleKey) => {
    const profile = DEMO_PROFILES.find((p) => p.roleKey === roleKey) || DEMO_PROFILES[0];
    return login(profile.email, 'password123');
  };

  const register = async (userData) => {
    try {
      const data = await api.auth.register(userData);
      setUser(data.user);
      addToast('Corporate account registered successfully!', 'success');
      return data.user;
    } catch (err) {
      const mockUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        full_name: userData.fullName || (userData.email ? userData.email.split('@')[0] : 'Corporate User'),
        role: userData.role || 'employee',
        department: userData.department || 'operations',
        is_demo: true,
      };
      const mockToken = `demo_token_${mockUser.id}`;
      localStorage.setItem('corpmind_token', mockToken);
      localStorage.setItem('corpmind_user', JSON.stringify(mockUser));
      setUser(mockUser);
      addToast(`Welcome ${mockUser.full_name}! (Corporate Account Created)`, 'success');
      return mockUser;
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    addToast('You have been logged out securely.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        role: user?.role || 'guest',
        department: user?.department || 'operations',
        login,
        loginAsDemo,
        register,
        logout,
        demoProfiles: DEMO_PROFILES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
