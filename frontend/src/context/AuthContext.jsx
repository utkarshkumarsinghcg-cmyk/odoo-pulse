import { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../services/mockData';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('gt_token');
      const storedUser = localStorage.getItem('gt_user');

      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
          localStorage.setItem('gt_user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('Backend session check notice:', err.message);
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Guest user default
        const defaultUser = { ...mockUser };
        setUser(defaultUser);
        localStorage.setItem('gt_user', JSON.stringify(defaultUser));
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.token && res.user) {
        localStorage.setItem('gt_token', res.token);
        localStorage.setItem('gt_user', JSON.stringify(res.user));
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Authentication failed.' };
    } catch (err) {
      console.warn('Backend login notice, falling back locally:', err.message);
      if (email && password) {
        const fallbackUser = { ...mockUser, email, authProvider: 'email' };
        setUser(fallbackUser);
        localStorage.setItem('gt_user', JSON.stringify(fallbackUser));
        return { success: true, user: fallbackUser };
      }
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await authApi.register(name, email, password);
      if (res.token && res.user) {
        localStorage.setItem('gt_token', res.token);
        localStorage.setItem('gt_user', JSON.stringify(res.user));
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Registration failed.' };
    } catch (err) {
      console.warn('Backend signup notice, falling back locally:', err.message);
      if (name && email && password) {
        const fallbackUser = { ...mockUser, name, email, authProvider: 'email' };
        setUser(fallbackUser);
        localStorage.setItem('gt_user', JSON.stringify(fallbackUser));
        return { success: true, user: fallbackUser };
      }
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const loginWithGoogle = async (googleData = null) => {
    const googleUser = googleData || {
      id: 101,
      name: 'Alex Johnson',
      email: 'alex.traveler@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      countriesVisited: 14,
      tripsPlanned: 4,
      authProvider: 'google',
    };
    setUser(googleUser);
    localStorage.setItem('gt_user', JSON.stringify(googleUser));
    return { success: true, user: googleUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gt_token');
    localStorage.removeItem('gt_user');
  };

  const updateUser = async (updates) => {
    try {
      const res = await authApi.updateProfile(updates);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('gt_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn('Backend profile update notice:', err.message);
    }
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      localStorage.setItem('gt_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loginWithGoogle, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
