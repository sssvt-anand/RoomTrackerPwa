import axios from 'axios';
import { refreshToken, getAuthHeader } from './auth';

const API_URL = 'http://localhost:8081/api/expenses';

const authenticatedRequest = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return await requestFn();
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Session expired. Please login again.');
      }
    }
    throw error;
  }
};

const formatAmount = (amount) => parseFloat(amount || 0).toFixed(2);

const formatExpenseData = (expense) => ({
  ...expense,
  id: expense.id || expense._id,
  amount: formatAmount(expense.amount),
  clearedAmount: formatAmount(expense.clearedAmount || 0),
  remainingAmount: formatAmount(expense.remainingAmount || 
                 (expense.amount - (expense.clearedAmount || 0))),
  date: expense.date ? new Date(expense.date).toISOString() : null,
  fullyCleared: (expense.clearedAmount || 0) >= expense.amount,
  paymentHistory: expense.paymentHistory || [{
    amount: expense.lastClearedAmount,
    clearedBy: expense.lastClearedBy,
    date: expense.lastClearedAt
  }].filter(p => p.amount > 0)
});

// GET all expenses
export const getAllExpenses = async () => {
  return authenticatedRequest(async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data.map(formatExpenseData);
  });
};


// GET expense summary
export const getExpenseSummary = async () => {
  return authenticatedRequest(async () => {
    const response = await axios.get(`${API_URL}/summary`, getAuthHeader());
    return response.data;
  });
};

// POST create new expense
export const createExpense = async (expenseData) => {
  return authenticatedRequest(async () => {
    const response = await axios.post(API_URL, expenseData, getAuthHeader());
    return formatExpenseData(response.data);
  });
};
    // GET single expense details
export const getExpenseDetails = async (id, token) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// PUT update existing expense
export const updateExpense = async (id, data, token) => {
  // Early validation with detailed error
  if (!token) {
    const error = new Error("Authentication token missing. Please login again.");
    error.code = "AUTH_MISSING_TOKEN";
    throw error;
  }

  try {
    // Verify token format
    if (typeof token !== 'string' || !token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }

    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      },
      validateStatus: (status) => status < 500 // Don't throw for 4xx errors
    });

    if (response.status === 401) {
      const error = new Error("Session expired. Please login again.");
      error.code = "AUTH_EXPIRED";
      throw error;
    }

    if (response.status === 403) {
      const error = new Error("You don't have permissions to update ,Cannot modify cleared expenses.");
      error.code = "AUTH_FORBIDDEN";
      throw error;
    }

    if (response.status !== 200) {
      const error = new Error(response.data?.message || "Failed to update expense");
      error.code = "UPDATE_FAILED";
      throw error;
    }

    return response.data;
  } catch (error) {
    console.error("Update failed:", {
      message: error.message,
      code: error.code,
      request: {
        url: `${API_URL}/${id}`,
        data,
        headers: { Authorization: token.substring(0, 10) + '...' }
      },
      response: error.response?.data
    });
    throw error;
  }
};



// DELETE expense
export const deleteExpense = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error(error.response.data?.message || "Admin privileges required");
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || "Cannot delete cleared expenses");
    }
    throw error;
  }
};


export const clearExpense = async (expenseId, memberId, amount, token) => {
  try {
    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);
    
    const response = await axios.put(
      `${API_URL}/clear/${expenseId}`,
      {}, // Empty body for PUT with params
      {
        params: {
          memberId,
          amount: formattedAmount
        },
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(token).headers
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Clear expense error:', {
      request: `${API_URL}/clear/${expenseId}`,
      params: { memberId, amount },
      error: error.response?.data || error.message
    });
    throw error;
  }
};

// GET payment history for an expense


export const getPaymentHistory = async (expenseId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${expenseId}/payments`,
      getAuthHeader()
    );

    const paymentsWithMembers = await Promise.all(
      response.data.map(async payment => {
        try {
          // Ensure we have member details
          let member = payment.clearedBy;
          if (!member && payment.memberId) {
            const memberResponse = await axios.get(
              `${API_URL}/members/${payment.memberId}`,
              getAuthHeader()
            );
            member = memberResponse.data;
          }

          return {
            ...payment,
            clearedBy: member || { name: 'Unknown' },
            // Ensure date is properly formatted
            clearedAt: payment.clearedAt || payment.date || new Date().toISOString()
          };
        } catch (memberError) {
          console.error('Error fetching member details:', memberError);
          return {
            ...payment,
            clearedBy: { name: 'Unknown' },
            clearedAt: payment.clearedAt || payment.date || new Date().toISOString()
          };
        }
      })
    );

    return paymentsWithMembers;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};