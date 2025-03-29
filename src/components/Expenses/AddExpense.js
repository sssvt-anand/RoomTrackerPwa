import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createExpense } from '../../api/expenses';
import { getAllMembers } from '../../api/members';
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
  useMediaQuery,
  Grid
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { DatePicker } from '@material-ui/pickers';
import 'date-fns';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(30),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      paddingTop: theme.spacing(8),
    },
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: 12,
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(2),
      padding: theme.spacing(3),
    },
  },
  formField: {
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    marginTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'space-between',
  },
  amountRemaining: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  requiredLabel: {
    '&:after': {
      content: "' *'",
      color: theme.palette.error.main,
    }
  },
}));

const AddExpense = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    memberId: user?.id || '',
    date: new Date()
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [membersLoading, setMembersLoading] = useState(true);
  const [remainingAmount, setRemainingAmount] = useState(440.00); // Static for now

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        const membersData = await getAllMembers();
        setMembers(membersData);
        
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

      const formattedDate = formData.date.toISOString().split('T')[0];

      await createExpense({
        description: formData.description,
        amount: amount.toFixed(2),
        memberId: formData.memberId,
        date: formattedDate
      });

      setSuccess('Expense added successfully!');
      setFormData({
        description: '',
        amount: '',
        memberId: user?.id || '',
        date: new Date()
      });

      // Update remaining amount (in a real app, this would come from an API)
      setRemainingAmount(prev => prev - amount);

      setTimeout(() => navigate('/expenses'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      className={classes.root}
      style={{
        paddingLeft: isMobile ? theme.spacing(2) : 0,
        paddingRight: isMobile ? theme.spacing(2) : 0,
      }}
    >
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}>
          Add New Expense
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <FormControl 
            fullWidth 
            variant="outlined" 
            className={classes.formField}
            required
          >
            <InputLabel className={classes.requiredLabel}>For Member</InputLabel>
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
            label={
              <span>
                Description <span style={{ color: theme.palette.error.main }}>*</span>
              </span>
            }
            name="description"
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            className={classes.formField}
            required
          />

          <Grid container spacing={2} className={classes.formField}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={
                  <span>
                    Amount ($) <span style={{ color: theme.palette.error.main }}>*</span>
                  </span>
                }
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ 
                  step: "0.01", 
                  min: "0.01" 
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label={
                  <span>
                    Expense Date <span style={{ color: theme.palette.error.main }}>*</span>
                  </span>
                }
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
            </Grid>
          </Grid>

          <Box className={classes.amountRemaining}>
            <Typography variant="body1">
              Remaining: ${remainingAmount.toFixed(2)}
            </Typography>
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
              size="large"
              style={{ minWidth: 120 }}
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading || membersLoading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              size="large"
              style={{ minWidth: 120 }}
            >
              {loading ? 'ADDING...' : 'ADD EXPENSE'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddExpense;