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
  Grid,
  Alert,
  styled
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Person as PersonIcon } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 12,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: 0,
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  textAlign: 'center',
  width: '100%',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

const FormField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column-reverse',
  },
}));

const AmountRemaining = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: 8,
  textAlign: 'center',
  fontWeight: 'bold',
}));

const RequiredAsterisk = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: theme.spacing(0.5),
}));

const renderLabelWithAsterisk = (labelText) => (
  <span>
    {labelText}
    <RequiredAsterisk>*</RequiredAsterisk>
  </span>
);

const AddExpense = () => {
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container 
        maxWidth="sm" 
        sx={{ 
          pt: 4,
          pb: 4,
          [theme.breakpoints.down('sm')]: {
            pt: 8,
            px: 2,
          }
        }}
        disableGutters={isMobile}
      >
        <StyledPaper elevation={3}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <FormTitle variant="h5">
              Add New Expense
            </FormTitle>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <FormField>
              <FormControl fullWidth required>
                <InputLabel>{renderLabelWithAsterisk('For Member')}</InputLabel>
                <Select
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  label={renderLabelWithAsterisk('For Member')}
                  disabled={membersLoading}
                  startAdornment={<PersonIcon color="action" sx={{ mr: 1 }} />}
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
            </FormField>

            <FormField>
              <TextField
                fullWidth
                label={renderLabelWithAsterisk('Description')}
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </FormField>

            <FormField>
              <Grid container spacing={2}>
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
            </FormField>

            <AmountRemaining>
              <Typography variant="body1">
                Remaining: ${remainingAmount.toFixed(2)}
              </Typography>
            </AmountRemaining>

            {error && (
              <FormField>
                <Alert severity="error">
                  {error}
                </Alert>
              </FormField>
            )}

            {success && (
              <FormField>
                <Alert severity="success">
                  {success}
                </Alert>
              </FormField>
            )}

            <ButtonGroup>
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
            </ButtonGroup>
          </form>
        </StyledPaper>
      </Container>
    </LocalizationProvider>
  );
};

export default AddExpense;