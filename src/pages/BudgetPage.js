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
  CircularProgress,
  Snackbar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { Add, Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getMemberBudgets, updateMemberBudget, createBudget } from '../api/budget';
import { getAllMembers } from '../api/members';

const BudgetPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newBudget, setNewBudget] = useState({
    memberId: '',
    amount: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgets, allMembersList] = await Promise.all([
        getMemberBudgets(user.token),
        getAllMembers(user.token)
      ]);
      setMembers(budgets);
      setAllMembers(allMembersList);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleEditClick = (memberId, currentBudget) => {
    setEditingId(memberId);
    setEditValue(currentBudget.toString());
  };

  const handleSaveClick = async (memberId) => {
    try {
      const amount = parseFloat(editValue);
      if (isNaN(amount)) {
        setError('Please enter a valid number');
        return;
      }
      await updateMemberBudget(memberId, amount, user.token);
      setSuccess('Budget updated successfully');
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update budget');
    }
  };

  const handleAddBudget = async () => {
    try {
      setLoading(true);
      await createBudget(
        newBudget.memberId,
        { amount: parseFloat(newBudget.amount) },
        user.token
      );
      setSuccess('Budget added successfully');
      setOpenDialog(false);
      setNewBudget({ memberId: '', amount: '' });
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add budget');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading && !members.length) {
    return (
      <Container maxWidth="lg" style={{ padding: '24px', textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading budget data...</Typography>
      </Container>
    );
  }

  // Get members without existing budgets
  const getAvailableMembers = () => {
  // Get IDs of members who already have non-zero budgets
  const budgetedMemberIds = members
    .filter(member => member.monthlyBudget > 0)
    .map(member => member.id);
  
  // Return members not in that list
  return allMembers.filter(member => 
    !budgetedMemberIds.includes(member.id)
  );
};

  return (
    <Container maxWidth="lg" style={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom>Budget Management</Typography>

      {user?.isAdmin && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Member Budgets</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            Add Budget
          </Button>
        </Box>
      )}

      <Paper style={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Member</strong></TableCell>
              <TableCell align="right"><strong>Monthly Budget</strong></TableCell>
              {user?.isAdmin && <TableCell align="center"><strong>Actions</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell align="right">
                  {editingId === member.id ? (
                    <TextField
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                  ) : (
                    formatCurrency(member.monthlyBudget || 0)
                  )}
                </TableCell>
                {user?.isAdmin && (
                  <TableCell align="center">
                    {editingId === member.id ? (
                      <>
                        <Button
                          startIcon={<Save />}
                          onClick={() => handleSaveClick(member.id)}
                          color="primary"
                          size="small"
                          style={{ marginRight: 8 }}
                        >
                          Save
                        </Button>
                        <Button
                          startIcon={<Cancel />}
                          onClick={() => setEditingId(null)}
                          size="small"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        startIcon={<Edit />}
                        onClick={() => handleEditClick(member.id, member.monthlyBudget || 0)}
                        size="small"
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Add Budget Dialog - Only for Admins */}
      {user?.isAdmin && (
  <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle>Add New Budget</DialogTitle>
  <DialogContent>
    <FormControl fullWidth margin="normal">
      <InputLabel id="member-select-label">Member</InputLabel>
      <Select
        labelId="member-select-label"
        value={newBudget.memberId}
        onChange={(e) => setNewBudget({ ...newBudget, memberId: e.target.value })}
        label="Member"
      >
        {getAvailableMembers().map((member) => (
          <MenuItem key={member.id} value={member.id}>
            {member.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <TextField
      margin="normal"
      fullWidth
      label="Amount (₹)"
      type="number"
      value={newBudget.amount}
      onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
      inputProps={{ min: 0 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
    <Button 
      onClick={handleAddBudget}
      disabled={!newBudget.memberId || !newBudget.amount}
      variant="contained"
      color="primary"
    >
      Add Budget
    </Button>
  </DialogActions>
</Dialog>
)}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error" onClose={handleCloseSnackbar}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="success" onClose={handleCloseSnackbar}>{success}</Alert>
      </Snackbar>
    </Container>
  );
};

export default BudgetPage;