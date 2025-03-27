import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = 'https://room-1-ra2m.onrender.com/api/exports';

const handleResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(response.statusText);
};

const handleError = (error) => {
  console.error('API Error:', error);
  throw error;
};

export const getMonthlyExports = async (start = null, end = null) => {
  try {
    const params = {};
    if (start) params.start = start;
    if (end) params.end = end;
    
    const response = await axios.get(`${API_URL}/monthly`, {
      ...getAuthHeader(),
      params
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getYearlyExports = async (start = null, end = null) => {
  try {
    const params = {};
    if (start) params.start = start;
    if (end) params.end = end;
    
    const response = await axios.get(`${API_URL}/yearly`, {
      ...getAuthHeader(),
      params
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getExportHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/history`, getAuthHeader());
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};