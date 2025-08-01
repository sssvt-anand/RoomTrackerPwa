import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  CircularProgress,
  Snackbar,
  TablePagination,
  useMediaQuery,
  Grid,
  useTheme
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { useAuth } from '../context/AuthContext';
import { getAllExpenses } from '../api/expenses';
import { getBudgetStatus } from '../api/budget';

const Dashboard = () => {
  const { user } = useAuth();
  const [allExpenses, setAllExpenses] = useState([]);
  const [paginatedExpenses, setPaginatedExpenses] = useState([]);
  const [memberBalances, setMemberBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [budget, setBudget] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showSnackbar = (message, severity = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [expensesResponse, budgetResponse] = await Promise.all([
        getAllExpenses(),
        getBudgetStatus()
      ]);

      localStorage.setItem('cachedExpenses', JSON.stringify(expensesResponse));
      localStorage.setItem('cachedBudget', JSON.stringify(budgetResponse));

      setAllExpenses(expensesResponse);
      setBudget(budgetResponse);
      updatePaginatedExpenses(expensesResponse, page, rowsPerPage);
      calculateSummary(expensesResponse);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. " + (navigator.onLine ? "Server error." : "You are offline."));
      
      const cachedExpenses = localStorage.getItem('cachedExpenses');
      const cachedBudget = localStorage.getItem('cachedBudget');
      
      if (cachedExpenses) {
        const parsedExpenses = JSON.parse(cachedExpenses);
        setAllExpenses(parsedExpenses);
        updatePaginatedExpenses(parsedExpenses, page, rowsPerPage);
        calculateSummary(parsedExpenses);
      }
      
      if (cachedBudget) {
        setBudget(JSON.parse(cachedBudget));
      }
      
      showSnackbar('Showing cached data. You are offline.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const updatePaginatedExpenses = (expenses, page, rowsPerPage) => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPaginatedExpenses(expenses.slice(startIndex, endIndex));
  };

  const calculateSummary = (expenses) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalCleared = expenses.reduce((sum, expense) => sum + parseFloat(expense.clearedAmount || 0), 0);

    setSummary({
      total: totalAmount,
      totalCleared,
      totalRemaining: totalAmount - totalCleared,
      count: expenses.length,
    });

    const balances = {};
    expenses.forEach((expense) => {
      const memberName = expense.memberName || expense.member?.name || 'Unknown';
      if (!balances[memberName]) {
        balances[memberName] = { total: 0, cleared: 0, remaining: 0 };
      }
      balances[memberName].total += parseFloat(expense.amount);
      balances[memberName].cleared += parseFloat(expense.clearedAmount || 0);
      balances[memberName].remaining += parseFloat(expense.amount) - parseFloat(expense.clearedAmount || 0);
    });

    setMemberBalances(Object.keys(balances).map((member) => ({
      member,
      total: balances[member].total,
      cleared: balances[member].cleared,
      remaining: balances[member].remaining,
    })));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [summary, setSummary] = useState({
    total: 0,
    totalCleared: 0,
    totalRemaining: 0,
    count: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updatePaginatedExpenses(allExpenses, page, rowsPerPage);
  }, [page, rowsPerPage, allExpenses]);

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
    <Container maxWidth="lg" style={{ padding: isMobile ? '16px' : '24px' }}>
  <Typography variant="h4" gutterBottom style={{ marginBottom: '24px' }}>
    Dashboard Overview
  </Typography>

  {/* Financial Summary Tables */}
  <Grid container spacing={3} style={{ marginBottom: '24px' }}>
    {/* First Row - Two tables side by side */}
    <Grid container item spacing={3} xs={12}>
      <Grid item xs={12} sm={6}>
        <Paper elevation={2} style={{ padding: '16px' }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell><strong>Total Expenses</strong></TableCell>
                <TableCell align="right">
                  <strong style={{ fontSize: '1.1rem' }}>{formatCurrency(summary.total)}</strong>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Total Cleared</strong></TableCell>
                <TableCell align="right">
                  <strong style={{ fontSize: '1.1rem', color: '#2e7d32' }}>
                    {formatCurrency(summary.totalCleared)}
                  </strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper elevation={2} style={{ padding: '16px' }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell><strong>Total Remaining</strong></TableCell>
                <TableCell align="right">
                  <strong style={{ fontSize: '1.1rem', color: '#d32f2f' }}>
                    {formatCurrency(summary.totalRemaining)}
                  </strong>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Total Transactions</strong></TableCell>
                <TableCell align="right">
                  <strong style={{ fontSize: '1.1rem' }}>{summary.count}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>

    {/* Budget Summary - Full width */}
    <Grid item xs={12}>
      <Paper elevation={2} style={{ padding: '16px' }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Total Budget</strong></TableCell>
              <TableCell align="right">
                <strong style={{ fontSize: '1.1rem' }}>
                  {budget ? formatCurrency(budget.totalBudget) : '--'}
                </strong>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Remaining Budget</strong></TableCell>
              <TableCell align="right">
                <strong style={{ 
                  fontSize: '1.1rem', 
                  color: budget?.remainingBudget < 0 ? '#d32f2f' : '#2e7d32'
                }}>
                  {budget ? formatCurrency(budget.remainingBudget) : '--'}
                </strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Grid>
  </Grid>


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
            {paginatedExpenses.map((expense, index) => (
              <TableRow key={index}>
                <TableCell>{expense.memberName || expense.member?.name || 'Unknown'}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={allExpenses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10]}
          labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
        />
      </Paper>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;