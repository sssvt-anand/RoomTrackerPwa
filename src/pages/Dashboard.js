import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  CircularProgress,
  Snackbar,
} from '@material-ui/core';
import { useAuth } from '../context/AuthContext';
import { getAllExpenses, getExpenseSummary } from '../api/expenses';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total: 0,
    totalCleared: 0,
    totalRemaining: 0,
    count: 0,
  });
  const [expenses, setExpenses] = useState([]);
  const [memberBalances, setMemberBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all expenses
      const allExpenses = await getAllExpenses();

      // Store in localStorage for offline fallback
      localStorage.setItem('cachedExpenses', JSON.stringify(allExpenses));

      // Calculate totals
      const totalAmount = allExpenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount),
        0
      );
      const totalCleared = allExpenses.reduce(
        (sum, expense) => sum + parseFloat(expense.clearedAmount || 0),
        0
      );
      const totalRemaining = totalAmount - totalCleared;

      setSummary({
        total: totalAmount,
        totalCleared,
        totalRemaining,
        count: allExpenses.length,
      });

      // Recent expenses (last 5)
      setExpenses(allExpenses.slice(-5).reverse());

      // Calculate member balances
      const balances = {};
      allExpenses.forEach((expense) => {
        const memberName = expense.member.name;
        if (!balances[memberName]) {
          balances[memberName] = { total: 0, cleared: 0, remaining: 0 };
        }
        balances[memberName].total += parseFloat(expense.amount);
        balances[memberName].cleared += parseFloat(expense.clearedAmount || 0);
        balances[memberName].remaining += parseFloat(expense.amount) - parseFloat(expense.clearedAmount || 0);
      });

      const memberBalancesArray = Object.keys(balances).map((member) => ({
        member,
        total: balances[member].total,
        cleared: balances[member].cleared,
        remaining: balances[member].remaining,
      }));

      setMemberBalances(memberBalancesArray);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. " + (navigator.onLine ? "Server error." : "You are offline."));
      setSnackbarOpen(true);

      // Fallback to cached data if available
      const cachedExpenses = localStorage.getItem('cachedExpenses');
      if (cachedExpenses) {
        const parsedExpenses = JSON.parse(cachedExpenses);
        setExpenses(parsedExpenses.slice(-5).reverse());
        
        // Recalculate from cache
        const totalAmount = parsedExpenses.reduce(
          (sum, expense) => sum + parseFloat(expense.amount),
          0
        );
        const totalCleared = parsedExpenses.reduce(
          (sum, expense) => sum + parseFloat(expense.clearedAmount || 0),
          0
        );
        
        setSummary({
          total: totalAmount,
          totalCleared,
          totalRemaining: totalAmount - totalCleared,
          count: parsedExpenses.length,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ padding: '24px', textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1">Loading data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom style={{ marginBottom: '24px' }}>
        Dashboard Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} style={{ marginBottom: '24px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper style={{ padding: '16px', height: '100%' }}>
            <Typography variant="h6" gutterBottom style={{ color: '#555' }}>
              Total Expenses
            </Typography>
            <Typography variant="h4" style={{ fontWeight: 600 }}>
              {formatCurrency(summary.total)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper style={{ padding: '16px', height: '100%' }}>
            <Typography variant="h6" gutterBottom style={{ color: '#555' }}>
              Total Cleared
            </Typography>
            <Typography variant="h4" style={{ fontWeight: 600, color: '#2e7d32' }}>
              {formatCurrency(summary.totalCleared)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper style={{ padding: '16px', height: '100%' }}>
            <Typography variant="h6" gutterBottom style={{ color: '#555' }}>
              Total Remaining
            </Typography>
            <Typography variant="h4" style={{ fontWeight: 600, color: '#d32f2f' }}>
              {formatCurrency(summary.totalRemaining)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper style={{ padding: '16px', height: '100%' }}>
            <Typography variant="h6" gutterBottom style={{ color: '#555' }}>
              Total Transactions
            </Typography>
            <Typography variant="h4" style={{ fontWeight: 600 }}>
              {summary.count}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Expenses */}
      <Divider style={{ margin: '24px 0' }} />
      <Typography variant="h5" gutterBottom style={{ marginBottom: '16px' }}>
        Recent Expenses
      </Typography>
      <Paper style={{ marginBottom: '32px', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Member</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="right"><strong>Amount</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense, index) => (
              <TableRow key={index}>
                <TableCell>{expense.member.name}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Member Balances */}
      <Divider style={{ margin: '24px 0' }} />
      <Typography variant="h5" gutterBottom style={{ marginBottom: '16px' }}>
        Member Balances
      </Typography>
      <Paper style={{ marginBottom: '32px', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Member</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell align="right"><strong>Cleared</strong></TableCell>
              <TableCell align="right"><strong>Remaining</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memberBalances.map((member, index) => (
              <TableRow key={index}>
                <TableCell>{member.member}</TableCell>
                <TableCell align="right">{formatCurrency(member.total)}</TableCell>
                <TableCell align="right">{formatCurrency(member.cleared)}</TableCell>
                <TableCell align="right" style={{ 
                  color: member.remaining > 0 ? '#d32f2f' : '#2e7d32' 
                }}>
                  {formatCurrency(member.remaining)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={error}
      />
    </Container>
  );
};

export default Dashboard;