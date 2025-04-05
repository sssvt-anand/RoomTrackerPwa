import axios from 'axios';
const API_URL = 'https://sudden-antelope-personalanand-fd678e31.koyeb.app'
export const getBudgetStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/budget/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budget status:', error);
    throw error;
  }
};