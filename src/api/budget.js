import axios from 'axios';
const API_URL = 'https://sudden-antelope-personalanand-fd678e31.koyeb.app'
export const getBudgetStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/budget/status`);
    // Handle case where backend returns error message
    if (response.data.error) {
      return {
        totalBudget: 0,
        remainingBudget: 0,
        error: response.data.error
      };
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching budget status:', error);
    // Return default values when error occurs
    return {
      totalBudget: 0,
      remainingBudget: 0,
      error: error.message
    };
  }
};