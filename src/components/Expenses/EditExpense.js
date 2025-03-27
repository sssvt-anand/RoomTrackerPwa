import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getExpenseDetails, updateExpense } from '../../api/expenses';
import {
  Container,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token, isAdmin, user } = useAuth();
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    memberId: '',
    date: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const members = [
    { id: user?.id, name: 'Me' },
    { id: '1', name: 'Anand' },
    { id: '2', name: 'Jio' },
    { id: '3', name: 'Srikanth' }
  ].filter(m => m.id);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        if (!isAdmin) {
          throw new Error('Admin privileges required to edit expenses');
        }
        
        if (!token) {
          throw new Error('Authentication token missing');
        }

        const expenseData = await getExpenseDetails(id, token); // Pass token here
        setExpense({
          ...expenseData,
          amount: parseFloat(expenseData.amount).toString(),
          date: new Date(expenseData.date)
        });
      } catch (err) {
        console.error('Failed to fetch expense', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id, isAdmin, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setExpense(prev => ({
      ...prev,
      date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      if (!token) {
        throw new Error('Authentication token missing');
      }

      const amount = parseFloat(expense.amount);
      if (isNaN(amount)) {
        throw new Error('Please enter a valid amount');
      }

      const formattedDate = expense.date.toISOString().split('T')[0];

      await updateExpense(
        id, 
        {
          description: expense.description,
          amount: amount.toFixed(2),
          memberId: expense.memberId,
          date: formattedDate
        }, 
        token // Pass token here
      );

      navigate('/expenses', { 
        state: { 
          message: 'Expense updated successfully!', 
          severity: 'success' 
        } 
      });
    } catch (err) {
      console.error('Failed to update expense', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          Admin privileges required to edit expenses
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container style={{ textAlign: 'center', padding: 40 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Edit Expense
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>For Member</InputLabel>
                <Select
                  name="memberId"
                  value={expense.memberId}
                  onChange={handleChange}
                  label="For Member"
                  required
                >
                  {members.map(member => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box mb={2}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={expense.description}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                fullWidth
                label="Amount (₹)"
                name="amount"
                type="number"
                value={expense.amount}
                onChange={handleChange}
                variant="outlined"
                sx={{ mb: 2 }}
                inputProps={{ step: "0.01", min: "0.01" }}
                required
              />
            </Box>

            <Box mb={2}>
              <DatePicker
                label="Expense Date"
                value={expense.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    required
                  />
                )}
              />
            </Box>

            {error && (
              <Box mb={2}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/expenses')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default EditExpense;