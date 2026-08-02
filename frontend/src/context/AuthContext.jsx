import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext({});

const TOKEN_KEY = 'stratify_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // full profile object from /api/auth/me
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data);
        setProfile(data);
      })
      .catch(() => {
        // Token is expired or invalid — clear it
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Sign In ───────────────────────────────────────────────────────────────
  const signIn = async ({ email, password }) => {
    const result = await api.post('/auth/login', { email, password });
    // result = { success, token, user }
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
    setProfile(result.user);
    return result;
  };

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
