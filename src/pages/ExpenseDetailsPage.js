import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  CircularProgress,
  Divider,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormHelperText
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { 
  getExpenseDetails, 
  getPaymentHistory, 
  deleteExpense, 
  clearExpense,
  updateExpense
} from '../api/expenses';
import { getAllMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';

const ExpenseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAdmin, user, logout } = useAuth();
  
  // State management
  const [expense, setExpense] = useState(null);
  const [originalExpense, setOriginalExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [clearAmount, setClearAmount] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [processing, setProcessing] = useState(false);

  // Helper functions
  const formatAmount = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!token) {
          throw new Error('Authentication token missing');
        }

        // Verify token validity
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
            throw new Error('Session expired');
          }
        } catch (decodeError) {
          logout();
          throw new Error('Invalid token');
        }

        const [expenseData, history, membersData] = await Promise.all([
          getExpenseDetails(id, token),
          getPaymentHistory(id, token),
          getAllMembers(token)
        ]);

        setExpense(expenseData);
        setOriginalExpense(expenseData);
        setPaymentHistory(history || []);
        
        // Add current user to members list if not present
        const updatedMembers = user?.id && !membersData.some(m => m.id === user.id) 
          ? [...membersData, { id: user.id, name: 'Me' }] 
          : membersData;
        setMembers(updatedMembers);
        
        // Set default selected member to current user
        if (user?.id) {
          setSelectedMember(user.id);
        }
        
      } catch (err) {
        console.error('Data fetch error:', err);
        setError(err.message.includes('token') ? 'Session expired. Please login again.' : 'Failed to load data');
        
        if (err.message.includes('token')) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
        setMembersLoading(false);
      }
    };

    fetchData();
  }, [id, token, user, logout, navigate]);

  // Menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Expense operations
  const handleDelete = async () => {
    try {
      setProcessing(true);
      if (!token) {
        throw new Error('Authentication token missing');
      }

      await deleteExpense(id, token);
      setSnackbar({
        open: true,
        message: 'Expense deleted successfully',
        severity: 'success'
      });
      navigate('/expenses');
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete expense',
        severity: 'error'
      });
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setDeleteDialogOpen(false);
      setProcessing(false);
    }
  };

  const handleClearExpense = async () => {
    try {
      setProcessing(true);
      if (!token) {
        throw new Error('Authentication token missing');
      }

      if (!selectedMember) {
        throw new Error('Please select a member');
      }

      const amount = parseFloat(clearAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amount > expense.remainingAmount) {
        throw new Error(`Cannot clear more than remaining ${formatAmount(expense.remainingAmount)}`);
      }

      // Execute clear
      await clearExpense(id, selectedMember, amount.toFixed(2), token);

      // Refresh data
      const [expenseData, history] = await Promise.all([
        getExpenseDetails(id, token),
        getPaymentHistory(id, token)
      ]);
      
      setExpense(expenseData);
      setPaymentHistory(history || []);
      
      setSnackbar({
        open: true,
        message: `Successfully cleared ${formatAmount(amount)}`,
        severity: 'success'
      });
      setClearDialogOpen(false);
    } catch (error) {
      console.error('Clear error:', error);
      
      let message = error.message;
      if (error.response?.status === 401) {
        message = 'Session expired. Please login again.';
      } else if (error.response?.status === 403) {
        message = 'You do not have permission to perform this action';
      }

      setSnackbar({
        open: true,
        message,
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setProcessing(true);
      if (!token) {
        throw new Error('Authentication token missing');
      }
  
      // Validate inputs
      if (!expense?.description?.trim()) {
        throw new Error('Description is required');
      }
  
      const newAmount = parseFloat(expense.amount);
      if (isNaN(newAmount) || newAmount <= 0) {
        throw new Error('Amount must be positive');
      }
  
      const memberId = expense.memberId || expense.member?.id;
      if (!memberId) {
        throw new Error('Member is required');
      }
  
      if (!expense.date) {
        throw new Error('Date is required');
      }
  
      // Calculate new remaining amount
      const currentClearedAmount = parseFloat(expense.clearedAmount) || 0;
      const newRemainingAmount = Math.max(0, newAmount - currentClearedAmount);
  
      // Prepare payload
      const payload = {
        description: expense.description.trim(),
        amount: newAmount,
        memberId,
        date: new Date(expense.date).toISOString(),
        remainingAmount: newRemainingAmount
      };
  
      // Make API call
      const updatedExpense = await updateExpense(id, payload, token);
  
      // Update state
      setExpense(updatedExpense);
      setOriginalExpense(updatedExpense);
      
      // Refresh payment history
      const history = await getPaymentHistory(id, token);
      setPaymentHistory(history || []);
      
      setSnackbar({
        open: true,
        message: 'Expense updated successfully',
        severity: 'success'
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Update error:', error);
      
      let message = error.message;
      if (error.response?.status === 401) {
        message = 'Session expired. Please login again.';
      } else if (error.response?.status === 403) {
        message = 'You do not have permission to perform this action';
      }
  
      setSnackbar({
        open: true,
        message,
        severity: 'error',
        autoHideDuration: 10000
      });
    } finally {
      setProcessing(false);
    }
  };

  const isFullyCleared = () => {
    return expense?.clearedAmount >= expense?.amount;
  };

  // Status helpers
  const getStatusColor = () => {
    if (isFullyCleared()) return 'success'; 
    if (expense?.clearedAmount > 0) return 'warning'; 
    return 'error';
  };
  
  const getStatusText = () => {
    if (isFullyCleared()) return `Fully Cleared: ${formatAmount(expense.amount)}`;
    if (expense?.clearedAmount > 0) return `Partially Cleared: ${formatAmount(expense.clearedAmount)}/${formatAmount(expense.amount)}`;
    return 'Pending Clearance';
  };

  // Loading and error states
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ padding: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (!expense) {
    return (
      <Container sx={{ padding: 4 }}>
        <Typography>Expense not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header and navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back to Expenses
        </Button>
        
        { (
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>

      {/* Expense details */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            {expense.description}
          </Typography>
          <Chip label={getStatusText()} color={getStatusColor()} />
        </Box>

        <Box mb={3}>
          <Typography variant="subtitle1" color="textSecondary">
            Added by: {expense.member?.name || 'Unknown'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Date: {formatDate(expense.createdAt)}
          </Typography>
        </Box>

        {/* Amount summary table */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">Total Amount</TableCell>
                <TableCell align="right">{formatAmount(expense.amount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Cleared Amount</TableCell>
                <TableCell align="right" sx={{ 
                  color: expense.clearedAmount > 0 ? (isFullyCleared() ? 'success.main' : 'warning.main') : 'text.secondary',
                  fontWeight: expense.clearedAmount > 0 ? 'bold' : 'normal'
                }}>
                  {formatAmount(expense.clearedAmount)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Remaining Amount</TableCell>
                <TableCell align="right" sx={{ 
                  color: expense.remainingAmount > 0 ? 'error.main' : 'success.main',
                  fontWeight: 'bold'
                }}>
                  {formatAmount(expense.remainingAmount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Payment history */}
        <Typography variant="h6" gutterBottom>
          Payment History
        </Typography>
        
        {paymentHistory.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Cleared By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentHistory.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatAmount(payment.amount)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                          {(payment.clearedBy?.name || 'U').charAt(0)}
                        </Avatar>
                        {payment.clearedBy?.name || 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(payment.clearedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No payment history available
          </Typography>
        )}

        {/* Clear expense button */}
        {!isFullyCleared() &&  (
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setClearAmount(expense.remainingAmount.toString());
                setClearDialogOpen(true);
              }}
              startIcon={<CheckIcon />}
              disabled={membersLoading}
            >
              Clear Expense
            </Button>
          </Box>
        )}
      </Paper>

      {/* Action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setEditDialogOpen(true);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          setDeleteDialogOpen(true);
          handleMenuClose();
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{expense.description}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear expense dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Clear Expense</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {expense.description} (Total: {formatAmount(expense.amount)})
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Remaining: {formatAmount(expense.remainingAmount)}
          </Typography>
          
          <TextField
            label="Amount to Clear"
            type="number"
            fullWidth
            margin="normal"
            value={clearAmount}
            onChange={(e) => setClearAmount(e.target.value)}
            inputProps={{ 
              min: "0.01", 
              step: "0.01",
              max: expense.remainingAmount
            }}
            required
            error={clearAmount && (parseFloat(clearAmount) > expense.remainingAmount || parseFloat(clearAmount) <= 0)}
            helperText={
              clearAmount && (parseFloat(clearAmount) > expense.remainingAmount 
                ? `Cannot exceed remaining ${formatAmount(expense.remainingAmount)}`
                : parseFloat(clearAmount) <= 0 
                  ? 'Amount must be positive'
                  : '')
            }
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Cleared By</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              label="Cleared By"
            >
              {members.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleClearExpense} 
            color="primary"
            disabled={
              !clearAmount || 
              !selectedMember || 
              membersLoading || 
              processing ||
              parseFloat(clearAmount) > expense.remainingAmount ||
              parseFloat(clearAmount) <= 0
            }
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit expense dialog */}
      <Dialog open={editDialogOpen} onClose={() => {
        setExpense(originalExpense);
        setEditDialogOpen(false);
      }} fullWidth maxWidth="sm">
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <TextField
            label="Description *"
            fullWidth
            margin="normal"
            value={expense.description || ''}
            onChange={(e) => setExpense({...expense, description: e.target.value})}
            required
            error={!expense.description}
            helperText={!expense.description ? "Required" : ""}
          />
          
          <TextField
            label="Amount *"
            type="number"
            fullWidth
            margin="normal"
            value={expense.amount || ''}
            onChange={(e) => setExpense({...expense, amount: e.target.value})}
            inputProps={{ min: "0.01", step: "0.01" }}
            required
            error={!expense.amount || isNaN(expense.amount) || expense.amount <= 0}
            helperText={
              !expense.amount ? "Required" :
              isNaN(expense.amount) || expense.amount <= 0 ? "Must be a positive number" : ""
            }
          />
          
          <FormControl fullWidth margin="normal" required error={!expense.memberId && !expense.member?.id}>
            <InputLabel>Member *</InputLabel>
            <Select
              value={expense.memberId || expense.member?.id || ''}
              onChange={(e) => setExpense({...expense, memberId: e.target.value})}
              label="Member *"
            >
              {members.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
            {!expense.memberId && !expense.member?.id && (
              <FormHelperText>Required</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Date & Time *"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={expense.date ? new Date(expense.date).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setExpense({...expense, date: date.toISOString()});
            }}
            InputLabelProps={{
              shrink: true,
            }}
            required
            error={!expense.date}
            helperText={!expense.date ? "Required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setExpense(originalExpense);
            setEditDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit}
            color="primary"
            disabled={
              !expense.description || 
              !expense.amount || 
              isNaN(expense.amount) || 
              expense.amount <= 0 ||
              (!expense.memberId && !expense.member?.id) || 
              !expense.date ||
              processing
            }
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration || 6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ExpenseDetailsPage;