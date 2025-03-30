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
  Alert,
  Box,
  FormHelperText
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = yup.object({
  description: yup.string().required('Description is required'),
  amount: yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .typeError('Must be a valid number'),
  memberId: yup.string().required('Member is required'),
  date: yup.date().required('Date is required')
});

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, user, token } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      description: '',
      amount: '',
      memberId: user?.id || '',
      date: new Date()
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        
        const formattedDate = values.date.toISOString().split('T')[0];
        const payload = {
          description: values.description,
          amount: parseFloat(values.amount).toFixed(2),
          memberId: values.memberId,
          date: formattedDate
        };
        
        await updateExpense(id, payload, token);
        
        setSuccessMessage('Expense updated successfully!');
        setTimeout(() => navigate('/expenses'), 1500);
        
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to update expense');
        console.error('Update error:', err);
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAdmin) throw new Error('Admin privileges required');
        
        const [membersData, expenseData] = await Promise.all([
          getAllMembers(),
          getExpenseDetails(id)
        ]);

        if (!expenseData) throw new Error('Expense not found');

        setMembers(membersData);
        
        formik.setValues({
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

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Admin privileges required to edit expenses
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Dialog open fullWidth maxWidth="sm">
        <DialogContent sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 200 
        }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open fullWidth maxWidth="sm" onClose={() => navigate('/expenses')}>
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          fontSize: '1.25rem',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2
        }}>
          Edit Expense
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }} error={formik.touched.memberId && Boolean(formik.errors.memberId)}>
              <InputLabel id="member-select-label">Member *</InputLabel>
              <Select
                labelId="member-select-label"
                name="memberId"
                value={formik.values.memberId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Member *"
              >
                {members.map(member => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.memberId && formik.errors.memberId && (
                <FormHelperText>{formik.errors.memberId}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Description *"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Amount (₹) *"
              name="amount"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
              inputProps={{ step: "0.01" }}
              sx={{ mb: 3 }}
            />

            <DatePicker
              label="Date *"
              value={formik.values.date}
              onChange={(date) => formik.setFieldValue('date', date)}
              onClose={() => formik.setFieldTouched('date', true)}
              renderInput={(params) => (
                <TextField 
                  {...params}
                  fullWidth
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  sx={{ mb: 3 }}
                />
              )}
            />

            <DialogActions sx={{ px: 0, py: 2 }}>
              <Button
                onClick={() => navigate('/expenses')}
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting || !formik.isValid}
                startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {formik.isSubmitting ? 'Updating...' : 'Update Expense'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

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