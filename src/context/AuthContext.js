import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout, getMembers as apiGetMembers } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const fetchMembers = async () => {
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
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          const user = {
            username: decoded.sub,
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
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setAuthLoading(true);
      const userData = await apiLogin(username, password);
      localStorage.setItem('token', userData.token); // Store token
      setToken(userData.token); // Set token in state
      const decoded = jwtDecode(userData.token);
      const user = {
        username: decoded.sub,
        roles: decoded.roles,
        isAdmin: decoded.roles.includes('ROLE_ADMIN'),
        id: decoded.userId,
        token: userData.token // Include token in user object
      };
      setUser(user);
      await fetchMembers();
      return user;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setMembers([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Expose token directly
        members,
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

// Make sure this export is named correctly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;