import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getExpenseDetails, updateExpense } from '../../api/expenses';
import { getAllMembers } from '../../api/members';
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
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, user, token } = useAuth();
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    memberId: user?.id || '',
    date: new Date()
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAdmin) throw new Error('Admin privileges required');
        
        const membersData = await getAllMembers();
        setMembers(membersData);
        
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
  
    fetchData();
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
      const payload = {
        description: expense.description,
        amount: parseFloat(expense.amount).toFixed(2),
        memberId: expense.memberId,
        date: formattedDate
      };
      
      await updateExpense(id, payload, token);
      
      // Show success message
      setSuccessMessage('Expense updated successfully!');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/expenses');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update expense');
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
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
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Member Selection - Updated with better styling */}
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="member-select-label">Member</InputLabel>
            <Select
              labelId="member-select-label"
              name="memberId"
              value={expense.memberId}
              onChange={handleChange}
              required
              label="Member"
              sx={{
                '& .MuiSelect-select': {
                  padding: '12px 14px'
                }
              }}
            >
              {members.map(member => (
                <MenuItem 
                  key={member.id} 
                  value={member.id}
                  sx={{
                    padding: '8px 16px'
                  }}
                >
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={expense.description}
            onChange={handleChange}
            required
            sx={{ mt: 1 }}
          />

          <TextField
            fullWidth
            label="Amount (₹)"
            name="amount"
            type="number"
            value={expense.amount}
            onChange={handleChange}
            required
            inputProps={{ step: "0.01" }}
            sx={{ mt: 1 }}
          />

          <DatePicker
            label="Date"
            value={expense.date}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required 
                sx={{ mt: 1 }} 
              />
            )}
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

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success"
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default EditExpense;