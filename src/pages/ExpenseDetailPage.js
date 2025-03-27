// src/pages/ExpenseDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Snackbar,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { 
  getExpenseDetails, 
  getPaymentHistory,
  updateExpense,
  deleteExpense,
  clearExpense
} from '../api/expenses';
import { getAllMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from '../components/Expenses/ExpenseForm';
import PaymentHistory from '../components/Expenses/PaymentHistory';

const useStyles = makeStyles((theme) => ({
  detailContainer: {
    marginTop: theme.spacing(4),
  },
  detailPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    '& > *': {
      marginRight: theme.spacing(2),
    },
  },
}));

const CurrencyDisplay = ({ value, label }) => (
  <Typography variant="h6" gutterBottom>
    {label}: ₹{(value || 0).toFixed(2)}
  </Typography>
);

const ExpenseDetailPage = () => {
  const classes = useStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [expense, setExpense] = useState({
    amount: 0,
    clearedAmount: 0,
    remainingAmount: 0,
    description: '',
    memberName: '',
    status: 'PENDING'
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [expenseData, membersData, historyData] = await Promise.all([
          getExpenseDetails(id),
          getAllMembers(),
          getPaymentHistory(id)
        ]);
        
        setExpense(expenseData);
        setMembers(membersData);
        setPaymentHistory(historyData);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError(err.response?.data?.message || 'Failed to load expense details. Please try again.');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const updatedExpense = await updateExpense(id, values);
      setSuccessMessage('Expense updated successfully!');
      setSnackbarOpen(true);
      
      // Refresh the data
      const [expenseData, historyData] = await Promise.all([
        getExpenseDetails(id),
        getPaymentHistory(id)
      ]);
      setExpense(expenseData);
      setPaymentHistory(historyData);
      setIsEditing(false);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update expense');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearExpense = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const amountToClear = expense.remainingAmount || 0;
      if (amountToClear <= 0) {
        throw new Error('No amount to clear');
      }
      
      await clearExpense(id, expense.member?.id, amountToClear);
      // Refresh the data
      const [expenseData, historyData] = await Promise.all([
        getExpenseDetails(id),
        getPaymentHistory(id)
      ]);
      setExpense(expenseData);
      setPaymentHistory(historyData);
      setSuccessMessage('Expense cleared successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to clear expense', err);
      setError(err.response?.data?.message || err.message || 'Failed to clear expense. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await deleteExpense(id);
      setSuccessMessage('Expense deleted successfully!');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/expenses'), 1500);
    } catch (err) {
      console.error('Failed to delete expense', err);
      setError(err.response?.data?.message || 'Failed to delete expense. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container style={{ textAlign: 'center', padding: 40 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isEditing) {
    return (
      <Container className={classes.detailContainer}>
        <Typography variant="h4" gutterBottom>
          Edit Expense
        </Typography>
        <ExpenseForm
          initialValues={expense}
          onSubmit={handleSubmit}
          members={members}
          loading={submitting}
        />
        <div className={classes.buttonGroup}>
          <Button
            variant="contained"
            color="default"
            onClick={() => setIsEditing(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={error ? 'error' : 'success'}
            elevation={6}
            variant="filled"
          >
            {error || successMessage}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  return (
    <Container className={classes.detailContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className={classes.detailPaper}>
            <Typography variant="h4" gutterBottom>
              {expense.description || 'Expense Details'}
            </Typography>
            
            <CurrencyDisplay value={expense.amount} label="Amount" />
            <CurrencyDisplay value={expense.clearedAmount} label="Cleared" />
            <CurrencyDisplay value={expense.remainingAmount} label="Remaining" />
            
            {expense.date && (
              <Typography gutterBottom>
                Date: {new Date(expense.date).toLocaleDateString()}
              </Typography>
            )}
            
            {expense.memberName && (
              <Typography>Assigned to: {expense.memberName}</Typography>
            )}

            <div className={classes.buttonGroup}>
              {isAdmin && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsEditing(true)}
                    disabled={submitting}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleClearExpense}
                    disabled={!(expense.remainingAmount > 0) || submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Clear'}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteExpense}
                    disabled={submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Delete'}
                  </Button>
                </>
              )}
              <Button
                variant="contained"
                onClick={() => navigate('/expenses')}
                disabled={submitting}
              >
                Back to List
              </Button>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={classes.detailPaper}>
            <Typography variant="h6" gutterBottom>
              Payment History
            </Typography>
            <PaymentHistory payments={paymentHistory} />
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={error ? 'error' : 'success'}
          elevation={6}
          variant="filled"
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ExpenseDetailPage;