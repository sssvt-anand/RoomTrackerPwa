import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = 'https://sudden-antelope-personalanand-fd678e31.koyeb.app/api/members';

export const getAllMembers = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const getMemberDetails = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};
