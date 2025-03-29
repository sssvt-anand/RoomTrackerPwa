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
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(8),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: 12,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
      margin: 0,
    },
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(3),
    },
  },
  formTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  formField: {
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    marginTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
  amountRemaining: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  requiredAsterisk: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(0.5),
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
  const [remainingAmount, setRemainingAmount] = useState(440.00);

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

      setRemainingAmount(prev => prev - amount);
      setTimeout(() => navigate('/expenses'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLabelWithAsterisk = (labelText) => (
    <span>
      {labelText}
      <span className={classes.requiredAsterisk}>*</span>
    </span>
  );

  return (
    <Container 
      maxWidth="sm" 
      className={classes.root}
      disableGutters={isMobile}
    >
      <Paper elevation={3} className={classes.paper}>
        <Box className={classes.titleWrapper}>
          <Typography variant="h5" className={classes.formTitle}>
            Add New Expense
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <FormControl 
            fullWidth 
            variant="outlined" 
            className={classes.formField}
            required
          >
            <InputLabel>{renderLabelWithAsterisk('For Member')}</InputLabel>
            <Select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              label={renderLabelWithAsterisk('For Member')}
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
            label={renderLabelWithAsterisk('Description')}
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
                label={renderLabelWithAsterisk('Amount ($)')}
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
                label={renderLabelWithAsterisk('Expense Date')}
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
              fullWidth={isMobile}
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
              fullWidth={isMobile}
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