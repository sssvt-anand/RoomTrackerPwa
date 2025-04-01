import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout, getMembers as apiGetMembers } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetchMembers to prevent unnecessary recreations
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const membersData = await apiGetMembers();
      setMembers(membersData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch members", err);
      setError(err.message);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          const user = {
            email: decoded.sub, // Changed from username to email
            name: decoded.name, // Added name if available in token
            roles: decoded.roles,
            isAdmin: decoded.roles.includes('ROLE_ADMIN'),
            id: decoded.userId
          };
          setUser(user);
          await fetchMembers();
        }
      } catch (err) {
        console.error("Auth initialization failed", err);
        setError(err.message);
        // Clear invalid token
        localStorage.removeItem('token');
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, [fetchMembers]);

  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setError(null);
      
      const userData = await apiLogin(email, password);
      localStorage.setItem('token', userData.token);
      
      const decoded = jwtDecode(userData.token);
      const user = {
        email: decoded.sub, 
        name: decoded.name || email, // Fallback to email if name not available
        roles: decoded.roles,
        isAdmin: decoded.roles.includes('ROLE_ADMIN'),
        id: decoded.userId,
        token: userData.token
      };
      
      setUser(user);
      await fetchMembers();
      return user;
    } catch (err) {
      console.error("Login failed", err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      throw err; // Re-throw for component-level handling
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    try {
      apiLogout();
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setMembers([]);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        members,
        token: user?.token || null,
        authLoading,
        membersLoading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        login,
        logout,
        refreshMembers: fetchMembers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;