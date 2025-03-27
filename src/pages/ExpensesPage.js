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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box
} from '@mui/material';
import { Alert } from '@mui/material';
import { getAllExpenses, deleteExpense, clearExpense, createExpense, updateExpense } from '../api/expenses';
import { useAuth } from '../context/AuthContext';
import ExpenseList from '../components/Expenses/ExpenseList';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { token, isAdmin, user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
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

  const members = [
    { id: user?.id, name: 'Me' },
    { id: '1', name: 'Anand' },
    { id: '2', name: 'Jio' },
    { id: '3', name: 'Srikanth' }
  ].filter(m => m.id);

  const fetchData = async () => {
    try {
      setLoading(true);
      const expensesData = await getAllExpenses();
      setExpenses(expensesData);
    } catch (err) {
      console.error('Failed to fetch data', err);
      showSnackbar('Failed to load expenses. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleEditClick = (expense) => {
    if (!isAdmin) {
      showSnackbar('Admin privileges required to edit expenses', 'error');
      return;
    }
    setCurrentExpense({
      ...expense,
      amount: parseFloat(expense.amount).toString(),
      date: new Date(expense.date)
    });
    setEditDialogOpen(true);
  };

  const handleUpdateExpense = async () => {
    try {
      setIsEditing(true);
      const amount = parseFloat(currentExpense.amount);
      if (isNaN(amount)) throw new Error('Invalid amount');
      
      const formattedDate = currentExpense.date.toISOString().split('T')[0];
      
      await updateExpense(currentExpense.id, {
        description: currentExpense.description,
        amount: amount.toFixed(2),
        memberId: currentExpense.memberId,
        date: formattedDate
      }, token);
      
      showSnackbar('Expense updated successfully!', 'success');
      setEditDialogOpen(false);
      await fetchData();
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
      await fetchData();
      showSnackbar('Expense deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete expense', error);
      showSnackbar(error.response?.data?.message || 'Failed to delete expense', 'error');
    }
  };

  const handleClearExpense = async (expenseId, memberId, amount) => {
    try {
      if (!isAdmin) {
        showSnackbar('Admin privileges required to clear expenses', 'error');
        return;
      }
      
      if (!token) throw new Error('Authentication token missing');
      
      const amountNum = Number(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      setIsClearing(true);
      await clearExpense(expenseId, memberId, amountNum.toFixed(2), token);
      await fetchData();
      showSnackbar(`Successfully cleared ₹${amountNum.toFixed(2)}`, 'success');
    } catch (error) {
      console.error('Clear expense error:', error);
      showSnackbar(error.response?.data?.message || error.message, 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const handleAddExpense = async () => {
    try {
      setIsAdding(true);
      const amount = parseFloat(newExpense.amount);
      if (isNaN(amount)) throw new Error('Invalid amount');
      
      const formattedDate = newExpense.date.toISOString().split('T')[0];
      
      await createExpense({
        description: newExpense.description,
        amount: amount.toFixed(2),
        memberId: newExpense.memberId,
        date: formattedDate
      }, token);
      
      showSnackbar('Expense added successfully!', 'success');
      setAddDialogOpen(false);
      setNewExpense({
        description: '',
        amount: '',
        memberId: user?.id || '',
        date: new Date()
      });
      await fetchData();
    } catch (error) {
      console.error('Add expense error:', error);
      showSnackbar(error.response?.data?.message || error.message, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading && !expenses.length) {
    return (
      <Container style={{ textAlign: 'center', padding: 40 }}>
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
          style={{ marginBottom: 20 }}
        >
          Add New Expense
        </Button>
        
        <ExpenseList 
          expenses={expenses} 
          onDelete={isAdmin ? handleDelete : null}
          onClearExpense={isAdmin ? handleClearExpense : null}
          onEdit={handleEditClick}
          loading={loading}
          refreshData={fetchData}
        />

        {/* Add Expense Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>For Member</InputLabel>
              <Select
                name="memberId"
                value={newExpense.memberId}
                onChange={(e) => setNewExpense({...newExpense, memberId: e.target.value})}
                label="For Member"
              >
                {members.map(member => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddExpense} 
            color="primary" 
            variant="contained"
            disabled={isAdding || !newExpense.description || !newExpense.amount || !newExpense.memberId}
          >
            {isAdding ? <CircularProgress size={24} /> : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>

        {/* Edit Expense Dialog */}
        {currentExpense && (
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>For Member</InputLabel>
                  <Select
                    name="memberId"
                    value={currentExpense.memberId}
                    onChange={(e) => setCurrentExpense({...currentExpense, memberId: e.target.value})}
                    label="For Member"
                  >
                    {members.map(member => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                disabled={isEditing || !currentExpense.description || !currentExpense.amount || !currentExpense.memberId}
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default ExpensesPage;