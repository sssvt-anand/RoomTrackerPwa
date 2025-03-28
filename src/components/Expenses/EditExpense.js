import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getExpenseDetails, updateExpense } from '../../api/expenses';
import {
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    memberId: user?.id || '',
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
        if (!isAdmin) throw new Error('Admin privileges required');
  
        const expenseData = await getExpenseDetails(id);
        if (!expenseData) throw new Error('Expense not found');

        setExpense({
          description: expenseData.description || '',
          amount: expenseData.amount ? parseFloat(expenseData.amount).toString() : '0',
          date: expenseData.date ? new Date(expenseData.date) : new Date(),
          memberId: expenseData.member?.id || expenseData.memberId || user?.id || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchExpense();
  }, [id, isAdmin, user?.id]);

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

      const formattedDate = expense.date.toISOString().split('T')[0];

      await updateExpense(id, {
        description: expense.description,
        amount: parseFloat(expense.amount).toFixed(2),
        memberId: expense.memberId,
        date: formattedDate
      });

      navigate('/expenses', { 
        state: { message: 'Expense updated successfully!', severity: 'success' } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <Typography variant="h6" color="error">
        Admin privileges required to edit expenses
      </Typography>
    );
  }

  if (loading) {
    return (
      <Dialog open>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          Edit Expense
        </DialogTitle>
        
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
          {/* Member Selection */}
          <FormControl fullWidth>
            <InputLabel>Member</InputLabel>
            <Select
              name="memberId"
              value={expense.memberId}
              onChange={handleChange}
              required
            >
              {members.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={expense.description}
            onChange={handleChange}
            required
          />

          {/* Amount */}
          <TextField
            fullWidth
            label="Amount (₹)"
            name="amount"
            type="number"
            value={expense.amount}
            onChange={handleChange}
            required
          />

          {/* Date Picker */}
          <DatePicker
            label="Date"
            value={expense.date}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth required />}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => navigate('/expenses')}
            variant="outlined"
            sx={{ borderRadius: 1, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ 
              backgroundColor: '#007bff', 
              '&:hover': { backgroundColor: '#0056b3' }, 
              borderRadius: 1, 
              px: 4 
            }}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Update Expense'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EditExpense;
