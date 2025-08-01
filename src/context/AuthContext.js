import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getMembers as apiGetMembers,
  refreshToken as apiRefreshToken 
} from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTokenAttempt, setRefreshTokenAttempt] = useState(0);

  // Function to handle token refresh
  const refreshAuthToken = useCallback(async () => {
    try {
      const newTokenData = await apiRefreshToken();
      localStorage.setItem('token', newTokenData.token);
      localStorage.setItem('refreshToken', newTokenData.refreshToken);
      
      const decoded = jwtDecode(newTokenData.token);
      return {
        email: decoded.sub,
        name: decoded.name,
        roles: decoded.roles,
        isAdmin: decoded.roles.includes('ROLE_ADMIN'),
        id: decoded.userId,
        token: newTokenData.token
      };
    } catch (err) {
      console.error("Token refresh failed", err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw err;
    }
  }, []);

  // Wrapper for API calls with automatic token refresh
  const authRequest = useCallback(async (requestFn) => {
    try {
      return await requestFn();
    } catch (error) {
      if (error.response?.status === 401 && refreshTokenAttempt < 3) {
        try {
          const newUser = await refreshAuthToken();
          setUser(newUser);
          setRefreshTokenAttempt(prev => prev + 1);
          return await requestFn(); // Retry the original request
        } catch (refreshError) {
          logout();
          throw new Error('Session expired. Please login again.');
        }
      }
      throw error;
    }
  }, [refreshAuthToken, refreshTokenAttempt]);

  // Memoized fetchMembers with authRequest wrapper
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const membersData = await authRequest(() => apiGetMembers());
      setMembers(membersData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch members", err);
      setError(err.message);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [authRequest]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            try {
              const newUser = await refreshAuthToken();
              setUser(newUser);
            } catch (refreshError) {
              console.error("Token refresh on init failed", refreshError);
              logout();
            }
          } else {
            const user = {
              email: decoded.sub,
              name: decoded.name,
              roles: decoded.roles,
              isAdmin: decoded.roles.includes('ROLE_ADMIN'),
              id: decoded.userId,
              token
            };
            setUser(user);
          }
          await fetchMembers();
        }
      } catch (err) {
        console.error("Auth initialization failed", err);
        setError(err.message);
        logout();
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, [fetchMembers, refreshAuthToken]);

  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setError(null);
      setRefreshTokenAttempt(0);
      
      const userData = await apiLogin(email, password);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('refreshToken', userData.refreshToken);
      
      const decoded = jwtDecode(userData.token);
      const user = {
        email: decoded.sub, 
        name: decoded.name || email,
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
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    try {
      apiLogout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setMembers([]);
      setError(null);
      setRefreshTokenAttempt(0);
    }
  };

  // Value to be provided by context
  const contextValue = {
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
    refreshMembers: fetchMembers,
    authRequest // Expose the authRequest wrapper for other components
  };

  return (
    <AuthContext.Provider value={contextValue}>
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