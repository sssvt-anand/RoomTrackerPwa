import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  TablePagination,
  useMediaQuery,
  useTheme,
  Autocomplete,
  Typography
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { getAllExpenses, deleteExpense, createExpense, updateExpense } from '../api/expenses';
import { getAllMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';
import ExpenseList from '../components/Expenses/ExpenseList';
import { format } from 'date-fns';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { token, isAdmin, user } = useAuth();
  const [allExpenses, setAllExpenses] = useState([]);
  const [paginatedExpenses, setPaginatedExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    memberId: user?.id || '',
    date: new Date()
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const membersData = await getAllMembers();
      if (user?.id && !membersData.some(m => m.id === user.id)) {
        const updatedMembers = [...membersData, { id: user.id, name: 'Me' }];
        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);
      } else {
        setMembers(membersData);
        setFilteredMembers(membersData);
      }
    } catch (err) {
      console.error('Failed to fetch members', err);
      showSnackbar('Failed to load members. Please try again.', 'error');
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchExpenses = async () => {
  try {
    setLoading(true);
    const expensesData = await getAllExpenses();
    
    const expensesWithDates = expensesData.map(expense => ({
      ...expense,
      // Use createdAt for the main display date if available
      date: expense.createdAt ? new Date(expense.createdAt) : new Date(expense.date),
      // Format for display
      formattedDate: format(
        expense.createdAt ? new Date(expense.createdAt) : new Date(expense.date),
        'MMM d, h:mm a' // e.g. "Jun 20, 08:32 PM"
      ),
      // Original date for reference
      originalDate: new Date(expense.date)
    }));
    
    setAllExpenses(expensesWithDates);
    updatePaginatedExpenses(expensesWithDates, page, rowsPerPage);
    
    localStorage.setItem('cachedExpenses', JSON.stringify(expensesWithDates));
  } catch (err) {
      console.error('Failed to fetch expenses', err);
      showSnackbar('Failed to load expenses. Please try again.', 'error');
      
      const cachedExpenses = localStorage.getItem('cachedExpenses');
      if (cachedExpenses) {
        const parsedExpenses = JSON.parse(cachedExpenses);
        // Reconstruct Date objects from cache
        const cachedWithDates = parsedExpenses.map(expense => ({
          ...expense,
          date: new Date(expense.date)
        }));
        setAllExpenses(cachedWithDates);
        updatePaginatedExpenses(cachedWithDates, page, rowsPerPage);
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

  useEffect(() => {
    fetchMembers();
    fetchExpenses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  const handleExpenseClick = (expenseId) => {
    navigate(`/expenses/${expenseId}`);
  };

  const handleEditClick = (expense) => {
    if (!isAdmin) {
      showSnackbar('Admin privileges required to edit expenses', 'error');
      return;
    }
    setCurrentExpense({
      ...expense,
      amount: parseFloat(expense.amount).toString(),
      date: new Date(expense.date),
      memberId: expense.member?.id || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateExpense = async () => {
  try {
    setIsEditing(true);
    const amount = parseFloat(currentExpense.amount);
    if (isNaN(amount)) throw new Error('Invalid amount');
    
    // Send full datetime
    await updateExpense(currentExpense.id, {
      description: currentExpense.description,
      amount: amount.toFixed(2),
      memberId: currentExpense.memberId,
      date: currentExpense.date.toISOString() // Full ISO string
    }, token);
      
      showSnackbar('Expense updated successfully!', 'success');
      setEditDialogOpen(false);
      await fetchExpenses();
    } catch (error) {
      console.error('Update expense error:', error);
      showSnackbar(error.response?.data?.message || error.message, 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!isAdmin) {
        showSnackbar('Admin privileges required to delete expenses', 'error');
        return;
      }
      await deleteExpense(id);
      await fetchExpenses();
      showSnackbar('Expense deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete expense', error);
      showSnackbar(error.response?.data?.message || 'Failed to delete expense', 'error');
    }
  };

  const handleAddExpense = async () => {
  try {
    setIsAdding(true);
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount)) throw new Error('Invalid amount');
    
    // Send full datetime instead of just date
    await createExpense({
      description: newExpense.description,
      amount: amount.toFixed(2),
      memberId: newExpense.memberId,
      date: newExpense.date.toISOString() // Full ISO string
    }, token);
      
      showSnackbar('Expense added successfully!', 'success');
      setAddDialogOpen(false);
      setNewExpense({
        description: '',
        amount: '',
        memberId: user?.id || '',
        date: new Date()
      });
      await fetchExpenses();
    } catch (error) {
      console.error('Add expense error:', error);
      showSnackbar(error.response?.data?.message || error.message, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const filterMembers = (searchText) => {
    if (!searchText) {
      setFilteredMembers(members);
      return;
    }
    const filtered = members.filter(member => 
      member.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredMembers(filtered);
  };

  if (loading && !paginatedExpenses.length) {
    return (
      <Container sx={{ textAlign: 'center', padding: 40 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddDialogOpen(true)}
          fullWidth={isMobile}
          disabled={membersLoading}
          sx={{ mb: 1 }}
        >
          Add New Expense
        </Button>
        
        <ExpenseList 
          expenses={paginatedExpenses} 
          onDelete={isAdmin ? handleDelete : null}
          onEdit={handleEditClick}
          onClickExpense={handleExpenseClick} 
          loading={loading}
          refreshData={fetchExpenses}
          members={members} 
        />

        <TablePagination
          component="div"
          count={allExpenses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
          sx={{ mt: 2 }}
        />

        {/* Add Expense Dialog */}
        <Dialog 
          open={addDialogOpen} 
          onClose={() => setAddDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="center" width="100%">
              <Typography variant="h6" fontWeight="bold">
                Add New Expense
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box mb={2}>
              <Autocomplete
                options={filteredMembers}
                getOptionLabel={(option) => option.name}
                value={members.find(m => m.id === newExpense.memberId) || null}
                onChange={(event, newValue) => {
                  setNewExpense({
                    ...newExpense,
                    memberId: newValue?.id || ''
                  });
                }}
                onInputChange={(event, newInputValue) => {
                  filterMembers(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="For Member"
                    variant="outlined"
                    fullWidth
                  />
                )}
                loading={membersLoading}
                disabled={membersLoading}
              />
            </Box>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                variant="outlined"
                required
              />
            </Box>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Amount (₹)"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                variant="outlined"
                inputProps={{ step: "0.01", min: "0.01" }}
                required
              />
            </Box>
            <Box mb={2}>
              <DatePicker
                label="Expense Date"
                value={newExpense.date}
                onChange={(date) => setNewExpense({...newExpense, date})}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    required: true
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleAddExpense} 
              color="primary" 
              variant="contained"
              disabled={isAdding || membersLoading || !newExpense.description || !newExpense.amount || !newExpense.memberId}
            >
              {isAdding ? <CircularProgress size={24} /> : 'Add Expense'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Expense Dialog */}
        {currentExpense && (
          <Dialog 
            open={editDialogOpen} 
            onClose={() => setEditDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Autocomplete
                  options={filteredMembers}
                  getOptionLabel={(option) => option.name}
                  value={members.find(m => m.id === currentExpense.memberId) || null}
                  onChange={(event, newValue) => {
                    setCurrentExpense({
                      ...currentExpense,
                      memberId: newValue?.id || ''
                    });
                  }}
                  onInputChange={(event, newInputValue) => {
                    filterMembers(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="For Member"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                  loading={membersLoading}
                  disabled={membersLoading}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Description"
                  value={currentExpense.description}
                  onChange={(e) => setCurrentExpense({...currentExpense, description: e.target.value})}
                  variant="outlined"
                  required
                />
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  type="number"
                  value={currentExpense.amount}
                  onChange={(e) => setCurrentExpense({...currentExpense, amount: e.target.value})}
                  variant="outlined"
                  inputProps={{ step: "0.01", min: "0.01" }}
                  required
                />
              </Box>
              <Box mb={2}>
                <DatePicker
                  label="Expense Date"
                  value={currentExpense.date}
                  onChange={(date) => setCurrentExpense({...currentExpense, date})}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      required: true
                    }
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateExpense} 
                color="primary" 
                variant="contained"
                disabled={isEditing || membersLoading || !currentExpense.description || !currentExpense.amount || !currentExpense.memberId}
              >
                {isEditing ? <CircularProgress size={24} /> : 'Update Expense'}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            elevation={6}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default ExpensesPage;