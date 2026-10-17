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
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
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
        setUser(getCurrentUser());
        setLoading(false);
        return;
      }
      try {
        const data = await api.auth.getProfile();
        setUser(data.user);
      } catch (err) {
        clearSession();
        setUser(null);
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
      // Resilient Demo Fallback if backend is sleeping or spinning up on Render
      const demoProfile = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (demoProfile && (password === 'password123' || !password)) {
        const mockUser = {
          id: `demo-${demoProfile.roleKey}`,
          email: demoProfile.email,
          full_name: demoProfile.name,
          role: demoProfile.role,
          department: demoProfile.department,
          is_demo: true,
        };
        const mockToken = `demo_token_${demoProfile.roleKey}`;
        localStorage.setItem('corpmind_token', mockToken);
        localStorage.setItem('corpmind_user', JSON.stringify(mockUser));
        setUser(mockUser);
        addToast(`Welcome ${mockUser.full_name}! (Instant Demo Session)`, 'success');
        return mockUser;
      }
      addToast(err.message || 'Unable to connect to backend server', 'error');
      throw err;
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
      addToast(err.message, 'error');
      throw err;
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
