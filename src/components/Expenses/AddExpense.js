import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createExpense } from '../../api/expenses';
import { getAllMembers } from '../../api/members'; // Import the API function
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
  CircularProgress
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { DatePicker } from '@material-ui/pickers';
import 'date-fns';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const AddExpense = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    memberId: user?.id || '',
    date: new Date()
  });
  const [members, setMembers] = useState([]); // State for storing members from API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [membersLoading, setMembersLoading] = useState(true); // Loading state for members

  // Fetch members from API when component mounts
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        const membersData = await getAllMembers();
        setMembers(membersData);
        
        // If current user isn't in the list, add them
        if (user?.id && !membersData.some(m => m.id === user.id)) {
          setMembers(prev => [...prev, { id: user.id, name: 'Me' }]);
        }
      } catch (err) {
        console.error('Failed to fetch members', err);
        setError('Failed to load members. Please try again.');
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        throw new Error('Please enter a valid amount');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (!formData.memberId) {
        throw new Error('Please select a member');
      }

      // Format date as YYYY-MM-DD
      const formattedDate = formData.date.toISOString().split('T')[0];

      // Create the expense
      await createExpense({
        description: formData.description,
        amount: amount.toFixed(2),
        memberId: formData.memberId,
        date: formattedDate
      });

      // Show success and reset form
      setSuccess('Expense added successfully!');
      setFormData({
        description: '',
        amount: '',
        memberId: user?.id || '',
        date: new Date()
      });

      // Optionally navigate back after delay
      setTimeout(() => navigate('/expenses'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className={classes.root}>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Add New Expense
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <FormControl 
            fullWidth 
            variant="outlined" 
            className={classes.formField}
            required
          >
            <InputLabel>For Member</InputLabel>
            <Select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              label="For Member"
              disabled={membersLoading}
            >
              {membersLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : (
                members.map(member => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            className={classes.formField}
            required
          />

          <TextField
            fullWidth
            label="Amount (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            variant="outlined"
            className={classes.formField}
            inputProps={{ 
              step: "0.01", 
              min: "0.01" 
            }}
            required
          />

          <Box className={classes.formField}>
            <DatePicker
              label="Expense Date"
              value={formData.date}
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
            <Alert severity="error" className={classes.formField}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className={classes.formField}>
              {success}
            </Alert>
          )}

          <Box className={classes.buttonGroup}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/expenses')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading || membersLoading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddExpense;