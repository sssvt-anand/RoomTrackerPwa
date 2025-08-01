import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://sudden-antelope-personalanand-fd678e31.koyeb.app'

export const login = async (email, password) => {  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { 
      email,  
      password 
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      // Decode token to get user info  
      const decoded = jwtDecode(response.data.token);
      return {
        email: decoded.sub,  
        roles: decoded.roles,
        isAdmin: decoded.roles.includes('ROLE_ADMIN'),
        token: response.data.token
      };
    }
    throw new Error('No token received');
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};



export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    throw new Error('Authentication token not found');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (e) {
    return true;
  }
};
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data.token;
  } catch (error) {
    // Clear tokens and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw error;
  }
};
export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = jwtDecode(token);
  return {
    email: decoded.sub,  
    roles: decoded.roles,
    isAdmin: decoded.roles.includes('ROLE_ADMIN')
  };
};
export const getMembers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/members`, getAuthHeader());
    // Transform the response data to match expected format
    return Array.isArray(response.data) 
      ? response.data 
      : [response.data]; // Wrap single member in array
  } catch (error) {
    console.error('Failed to fetch members:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { 
      email 
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Password reset request error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to request password reset'
    };
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      email,
      otp,
      newPassword
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Password reset error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to reset password'
    };
  }
};