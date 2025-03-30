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
  TablePagination,
  useMediaQuery,
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { useAuth } from '../context/AuthContext';
import { getAllExpenses } from '../api/expenses';

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
      const allExpenses = await getAllExpenses();
      localStorage.setItem('cachedExpenses', JSON.stringify(allExpenses));

      setAllExpenses(allExpenses);
      updatePaginatedExpenses(allExpenses, page, rowsPerPage);
      calculateSummary(allExpenses);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. " + (navigator.onLine ? "Server error." : "You are offline."));
      setSnackbarOpen(true);

      const cachedExpenses = localStorage.getItem('cachedExpenses');
      if (cachedExpenses) {
        const parsedExpenses = JSON.parse(cachedExpenses);
        setAllExpenses(parsedExpenses);
        updatePaginatedExpenses(parsedExpenses, page, rowsPerPage);
        calculateSummary(parsedExpenses);
        showSnackbar('Showing cached data. You are offline.', 'warning');
      }
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
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    );
    const totalCleared = expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.clearedAmount || 0),
      0
    );
    const totalRemaining = totalAmount - totalCleared;

    setSummary({
      total: totalAmount,
      totalCleared,
      totalRemaining,
      count: expenses.length,
    });

    const balances = {};
    expenses.forEach((expense) => {
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ padding: '24px', textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1">Loading data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ padding: isMobile ? '16px' : '24px' }}>
      <Typography variant="h4" gutterBottom sx={{ marginBottom: '24px' }}>
        Dashboard Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ marginBottom: '24px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#555' }}>
                Total Expenses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {formatCurrency(summary.total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#555' }}>
                Total Cleared
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {formatCurrency(summary.totalCleared)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#555' }}>
                Total Remaining
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {formatCurrency(summary.totalRemaining)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#555' }}>
                Total Transactions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {summary.count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Expenses */}
      <Divider sx={{ margin: '24px 0' }} />
      <Typography variant="h5" gutterBottom sx={{ marginBottom: '16px' }}>
        Recent Expenses
      </Typography>
      <Paper sx={{ marginBottom: '32px', overflowX: 'auto' }}>
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
                <TableCell>{expense.member.name}</TableCell>
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

      {/* Member Balances */}
      <Divider sx={{ margin: '24px 0' }} />
      <Typography variant="h5" gutterBottom sx={{ marginBottom: '16px' }}>
        Member Balances
      </Typography>
      <Paper sx={{ marginBottom: '32px', overflowX: 'auto' }}>
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
                <TableCell align="right" sx={{ 
                  color: member.remaining > 0 ? 'error.main' : 'success.main' 
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;