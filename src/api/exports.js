import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = 'https://sudden-antelope-personalanand-fd678e31.koyeb.app/api/exports';

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
      params,
      responseType: 'blob' // Important for file downloads
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
      params,
      responseType: 'blob'
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

// Add this new function for member exports
export const exportByMember = async (memberId) => {
  try {
    const response = await axios.get(`${API_URL}/member/${memberId}`, {
      ...getAuthHeader(),
      responseType: 'blob' // Important for file downloads
    });
    return response.data;
  } catch (error) {
    console.error('Export by member error:', error);
    throw error;
  }
};  
export default {
  getMonthlyExports,
  getYearlyExports,
  getExportHistory,
  exportByMember
};