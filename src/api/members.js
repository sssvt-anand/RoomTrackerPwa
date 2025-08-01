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
export const updateMemberBudget = async (id, monthlyBudget) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/budget`, null, {
      params: { monthlyBudget }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating member budget:', error);
    throw error;
  }
};

export const updateMemberBudgetV2 = async (id, monthlyBudget) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/budget-v2`,
      { monthlyBudget },
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error details:', {
      config: error.config,
      response: error.response?.data
    });
    throw error;
  }
};

export const getMemberBudgetStatus = async (memberId) => {
  try {
    const response = await axios.get(`${API_URL}/${memberId}/budget-status`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching member budget status:', error);
    throw error;
  }
};

export const getMemberBudgetHistory = async (memberId) => {
  try {
    const response = await axios.get(`${API_URL}/${memberId}/budget-history`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching budget history:', error);
    throw error;
  }
};

export const getAllMembersWithBudgets = async () => {
  // eslint-disable-next-line no-template-curly-in-string
  const response = await axios.get('${API_URL}/$api/member-budget/all');
  return response.data;
};

