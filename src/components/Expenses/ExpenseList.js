import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  Avatar,
  Snackbar,
  styled
} from '@mui/material';
import Alert from '@mui/material/Alert';
import {
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as ClearIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getPaymentHistory } from '../../api/expenses';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'cleared' ? '#4caf50' : 
                  status === 'pending' ? '#ff9800' : '#2196f3',
  color: 'white',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(4),
}));

const StatusText = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  lineHeight: 1.3,
}));

const ActionCell = styled(TableCell)(({ theme }) => ({
  width: 150,
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const DialogContentBox = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const PaymentHistoryItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  marginLeft: 'auto',
}));

const MemberAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  marginRight: theme.spacing(2),
}));

const PaymentItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const ExpenseList = ({ 
  expenses = [], 
  loading = false, 
  refreshData = () => {},
  onDelete = () => {},
  onClearExpense = () => {},
  members = [] 
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentExpense, setCurrentExpense] = useState({
    id: '',
    description: '',
    amount: 0,
    date: '',
    member: { name: '' },
    clearedAmount: 0,
    paymentHistory: []
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [clearAmount, setClearAmount] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [expandedExpenses, setExpandedExpenses] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isClearing, setIsClearing] = useState(false);
  const [localExpenses, setLocalExpenses] = useState(expenses);

  useEffect(() => {
    setLocalExpenses(expenses || []);
  }, [expenses]);

  const formatAmount = (amount) => {
    try {
      const num = typeof amount === 'number' ? amount : parseFloat(amount || 0);
      return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
    } catch {
      return '₹0.00';
    }
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Unknown time';
    }
  };

  const getStatusChip = (expense) => {
    if (!expense) return null;
    
    if (expense.fullyCleared) {
      return <StatusChip label="Fully Cleared" size="small" status="cleared" />;
    } else if ((expense.clearedAmount || 0) > 0) {
      return <StatusChip label="Partially Cleared" size="small" status="partial" />;
    } else {
      return <StatusChip label="Pending" size="small" status="pending" />;
    }
  };

  const renderStatusDetails = (expense) => {
    if (!expense) return null;
    
    const clearedAmount = parseFloat(expense.clearedAmount || 0);
    const totalAmount = parseFloat(expense.amount || 0);
    const remainingAmount = totalAmount - clearedAmount;
  
    if (expense.fullyCleared) {
      return (
        <StatusText>
          <Typography variant="caption" display="block">
            Fully Cleared: {formatAmount(totalAmount)}
          </Typography>
          {expense.lastClearedBy && (
            <Typography variant="caption" display="block">
              By {expense.lastClearedBy.name || 'Unknown'} ({formatDate(expense.lastClearedAt)})
            </Typography>
          )}
        </StatusText>
      );
    } else if (clearedAmount > 0) {
      return (
        <StatusText>
          <Typography variant="caption" display="block">
            Partially Cleared: {formatAmount(clearedAmount)}/{formatAmount(totalAmount)}
          </Typography>
          {expense.lastClearedBy && (
            <Typography variant="caption" display="block">
              Last Payment: {formatAmount(expense.lastPaymentAmount || clearedAmount)} by {expense.lastClearedBy.name || 'Unknown'} ({formatDate(expense.lastClearedAt)})
            </Typography>
          )}
          <Typography variant="caption" display="block" color="error">
            Remaining: {formatAmount(remainingAmount)}
          </Typography>
        </StatusText>
      );
    } else {
      return (
        <Typography variant="caption" display="block">
          Pending Clearance
        </Typography>
      );
    }
  };

  const handleMenuOpen = (event, expense) => {
    setAnchorEl(event.currentTarget);
    setCurrentExpense(expense || {
      id: '',
      description: '',
      amount: 0,
      date: '',
      member: { name: '' },
      clearedAmount: 0,
      paymentHistory: []
    });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    if (!currentExpense?.id) {
      showSnackbar('No expense selected', 'error');
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleClearClick = () => {
    if (!currentExpense?.id) {
      showSnackbar('No expense selected', 'error');
      return;
    }
    setClearAmount('');
    setSelectedMember('');
    setClearDialogOpen(true);
  };

  const handleHistoryClick = async () => {
    try {
      if (!currentExpense?.id) {
        throw new Error('No expense selected');
      }
      const history = await getPaymentHistory(currentExpense.id);
      setPaymentHistory(history || []);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      showSnackbar('Failed to load payment history', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const toggleExpand = (expenseId) => {
    if (!expenseId) return;
    setExpandedExpenses(prev => ({
      ...prev,
      [expenseId]: !prev[expenseId]
    }));
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!currentExpense?.id) {
        throw new Error('No expense selected');
      }
      await onDelete(currentExpense.id);
      setDeleteDialogOpen(false);
      showSnackbar('Expense deleted successfully');
      await refreshData();
    } catch (error) {
      showSnackbar(error.message || 'Failed to delete expense', 'error');
    }
  };

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      if (!currentExpense?.id) throw new Error('No expense selected');
      
      const amountToClear = parseFloat(clearAmount);
      const remainingAmount = currentExpense.remainingAmount || 
                         (currentExpense.amount - (currentExpense.clearedAmount || 0));

      if (isNaN(amountToClear) || amountToClear <= 0) {
        throw new Error('Please enter a valid positive amount');
      }
      
      if (amountToClear > remainingAmount) {
        throw new Error(`Cannot clear more than remaining ₹${remainingAmount.toFixed(2)}`);
      }
      
      if (!selectedMember) throw new Error('Please select a member');
      const clearingMember = members.find(m => m.id === selectedMember);
      if (!clearingMember) throw new Error('Selected member not found');

      // Optimistically update the UI
      const tempExpense = {
        ...currentExpense,
        clearedAmount: (currentExpense.clearedAmount || 0) + amountToClear,
        remainingAmount: remainingAmount - amountToClear,
        lastClearedBy: { 
          id: clearingMember.id, 
          name: clearingMember.name  
        },
        lastClearedAt: new Date().toISOString(),
        paymentHistory: [
          ...(currentExpense.paymentHistory || []),
          {
            amount: amountToClear,
            clearedBy: { 
              id: clearingMember.id, 
              name: clearingMember.name 
            },
            clearedAt: new Date().toISOString()
          }
        ]
      };

      setLocalExpenses(prev => 
        prev.map(exp => exp.id === currentExpense.id ? tempExpense : exp)
      );

      // Make the API call
      const updatedExpense = await onClearExpense(
        currentExpense.id,
        selectedMember,
        amountToClear
      );

      // Update with actual response from server
      setLocalExpenses(prev => 
        prev.map(exp => exp.id === currentExpense.id ? (updatedExpense || tempExpense) : exp)
      );

      setClearDialogOpen(false);
      setClearAmount('');
      setSelectedMember('');
      showSnackbar(`Successfully cleared ₹${amountToClear.toFixed(2)}`);
      
      // Force refresh data from server
      await refreshData();
    } catch (error) {
      console.error('Clear Expense Error:', error);
      showSnackbar(error.message, 'error');
      // Revert optimistic update if error occurs
      await refreshData();
    } finally {
      setIsClearing(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && (!localExpenses || localExpenses.length === 0)) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (!localExpenses || localExpenses.length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ p: 2.5 }}>
        No expenses found.
      </Typography>
    );
  }

  return (
    <>
      <StyledTableContainer component={Paper}>
        <Table aria-label="expenses table">
          <StyledTableHead>
            <TableRow>
              <StyledHeaderCell>Member</StyledHeaderCell>
              <StyledHeaderCell>Description</StyledHeaderCell>
              <StyledHeaderCell>Amount</StyledHeaderCell>
              <StyledHeaderCell>Date</StyledHeaderCell>
              <StyledHeaderCell>Status</StyledHeaderCell>
              <StyledHeaderCell>Actions</StyledHeaderCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {localExpenses.map((expense) => (
              expense && (
                <React.Fragment key={expense.id || `expense-${Math.random()}`}>
                  <StyledTableRow>
                    <StyledTableCell>
                      <Box display="flex" alignItems="center">
                        <MemberAvatar 
                          alt={expense.member?.name || 'Unknown'} 
                        >
                          {(expense.member?.name || 'U').charAt(0)}
                        </MemberAvatar>
                        {expense.member?.name || 'Unknown'}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>{expense.description || '-'}</StyledTableCell>
                    <StyledTableCell>{formatAmount(expense.amount)}</StyledTableCell>
                    <StyledTableCell>{formatDate(expense.date)}</StyledTableCell>
                    <StyledTableCell>
                      <Box>
                        {getStatusChip(expense)}
                        {renderStatusDetails(expense)}
                      </Box>
                    </StyledTableCell>
                    <ActionCell>
                      <Box display="flex" alignItems="center">
                        <ExpandButton
                          onClick={() => toggleExpand(expense.id)}
                          disabled={!expense.id}
                        >
                          {expandedExpenses[expense.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ExpandButton>
                        <MenuButton
                          aria-label="actions"
                          onClick={(e) => handleMenuOpen(e, expense)}
                        >
                          <MoreIcon />
                        </MenuButton>
                      </Box>
                    </ActionCell>
                  </StyledTableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0 }}>
                      <Collapse in={expandedExpenses[expense.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            Payment History
                          </Typography>
                          <List dense>
                            {(expense.paymentHistory || []).length > 0 ? (
                              (expense.paymentHistory || []).map((payment, index) => (
                                <React.Fragment key={index}>
                                  <PaymentHistoryItem>
                                    <PaymentItem>
                                      <MemberAvatar 
                                        alt={payment.clearedBy?.name || 'Unknown'}
                                      >
                                        {(payment.clearedBy?.name || 'U').charAt(0)}
                                      </MemberAvatar>
                                      <ListItemText
                                        primary={`${formatAmount(payment.amount)} by ${payment.clearedBy?.name || 'Unknown'}`}
                                        secondary={formatDate(payment.clearedAt)}
                                      />
                                    </PaymentItem>
                                  </PaymentHistoryItem>
                                  {index < (expense.paymentHistory || []).length - 1 && <Divider />}
                                </React.Fragment>
                              ))
                            ) : (
                              <ListItem>
                                <ListItemText primary="No payment history available" />
                              </ListItem>
                            )}
                          </List>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              )
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'expense-actions-menu',
        }}
      >
        {isAdmin && [
          !currentExpense.fullyCleared && (
            <MenuItem 
              key="edit"
              onClick={() => {
                handleMenuClose();
                navigate(`/expenses/edit/${currentExpense.id}`);
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
          ),
          <MenuItem 
            key="delete"
            onClick={() => {
              handleMenuClose();
              handleDeleteClick();
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>,
          !currentExpense.fullyCleared && (
            <MenuItem 
              key="clear"
              onClick={() => {
                handleMenuClose();
                handleClearClick();
              }}
            >
              <ClearIcon fontSize="small" sx={{ mr: 1 }} />
              Clear
            </MenuItem>
          )
        ].filter(Boolean)}
        <MenuItem 
          key="history"
          onClick={handleHistoryClick}
        >
          <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
          View Full History
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{currentExpense.description || 'this'}" expense?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear Expense</DialogTitle>
        <DialogContentBox>
          <Typography variant="subtitle1">
            {currentExpense.description || 'Expense'} (Total: {formatAmount(currentExpense.amount)})
          </Typography>
          <Typography color="textSecondary">
            Remaining: {formatAmount(currentExpense.remainingAmount || 
                          (currentExpense.amount - (currentExpense.clearedAmount || 0)))}
          </Typography>
          <TextField
            label="Amount to Clear"
            type="number"
            value={clearAmount}
            onChange={(e) => setClearAmount(e.target.value)}
            fullWidth
            inputProps={{ 
              max: currentExpense.remainingAmount || 
                   (currentExpense.amount - (currentExpense.clearedAmount || 0)),
              step: "0.01",
              min: "0.01"
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Cleared By</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              required
            >
              {members.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContentBox>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleClearConfirm} 
            color="primary" 
            variant="contained"
            disabled={!clearAmount || !selectedMember || isClearing}
          >
            {isClearing ? <CircularProgress size={24} /> : 'Confirm Clear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Payment History for "{currentExpense.description || 'Expense'}" (Total: {formatAmount(currentExpense.amount)})
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <PaymentItem>
                      <MemberAvatar 
                        alt={payment.clearedBy?.name || 'Unknown'}
                      >
                        {(payment.clearedBy?.name || 'U').charAt(0)}
                      </MemberAvatar>
                      <ListItemText
                        primary={`${formatAmount(payment.amount)} by ${payment.clearedBy?.name || 'Unknown'}`}
                        secondary={
                          <>
                            {formatDateTime(payment.timestamp || payment.clearedAt)}
                            {payment.expense?.description && ` • For: ${payment.expense.description}`}
                          </>
                        }
                      />
                    </PaymentItem>
                  </ListItem>
                  {index < paymentHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No payment history available" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default ExpenseList;