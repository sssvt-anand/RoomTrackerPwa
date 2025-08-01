import axios from 'axios';
const API_URL = 'https://sudden-antelope-personalanand-fd678e31.koyeb.app'
export const getBudgetStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/budget/status`);
    
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
   
    return {
      totalBudget: 0,
      remainingBudget: 0,
      error: error.message
    };
  }
};

export const createBudget = async (memberId, budgetData, authToken) => {
  try {
   
    const response = await axios.post(
      `${API_URL}/api/budget/members/${memberId}`,
      { monthlyBudget: Number(budgetData.amount) }, // Ensure correct field name
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Full Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const updateMemberBudgetV2 = async (memberId, amount, authToken) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/budget/members/${memberId}`,
      { amount },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const getMemberBudgets = async (authToken) => {
  try {
    const response = await axios.get(`${API_URL}/api/budget/members`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Transform to only include needed fields
    return response.data.map(member => ({
      id: member.memberId,
      name: member.memberName,
      monthlyBudget: member.monthlyBudget
    }));
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};
export const updateMemberBudget = async (memberId, amount, authToken) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/budget/members/${memberId}`,
      { monthlyBudget: Number(amount) },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};
export const getAllMembers = async (authToken) => {
  try {
    const response = await axios.get(`${API_URL}/api/members`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data.map(member => ({
      id: member.memberId || member.id,  // Handle both cases
      name: member.memberName || member.name
    }));
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};
