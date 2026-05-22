import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sc_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and validate current token on launch
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Token expired or invalid
            handleLogout();
          }
        } catch (err) {
          console.error("Authentication init failed", err);
          // Keep token locally in case of network downtime, but set loading false
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication login failed");
      }

      localStorage.setItem('sc_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleRegister = async (fullName, email, password, role, profileData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
          profile_data: profileData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        // Handle field validation array structures or detail strings
        let errMsg = "Registration failed";
        if (Array.isArray(data.detail)) {
          errMsg = data.detail.map(d => d.msg).join(", ");
        } else if (data.detail) {
          errMsg = data.detail;
        }
        throw new Error(errMsg);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sc_token');
    setToken(null);
    setUser(null);
  };

  // Helper fetch function that automatically injects authorization header
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      handleLogout();
    }

    return res;
  };

  const value = {
    user,
    token,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    authFetch,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be called from within an AuthProvider");
  }
  return context;
};
