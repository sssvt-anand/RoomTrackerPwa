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
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as ClearIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useAuth } from '../../context/AuthContext';
import { getPaymentHistory } from '../../api/expenses';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    marginTop: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  table: {
    minWidth: 650,
  },
  tableHeader: {
    backgroundColor: theme.palette.primary.main,
  },
  headerCell: {
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  cell: {
    padding: theme.spacing(2),
  },
  statusCleared: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  statusPending: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  statusPartial: {
    backgroundColor: '#2196f3',
    color: 'white',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  statusText: {
    marginTop: theme.spacing(0.5),
    lineHeight: 1.3,
  },
  actionCell: {
    width: 150,
  },
  menuButton: {
    padding: theme.spacing(1),
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  paymentHistoryItem: {
    paddingLeft: theme.spacing(4),
  },
  expandButton: {
    marginLeft: 'auto',
  },
  nestedList: {
    paddingLeft: theme.spacing(4),
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(2),
  },
  paymentItem: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const ExpenseList = ({ 
  expenses = [], 
  loading = false, 
  refreshData = () => {},
  onDelete = () => {},
  onClearExpense = () => {}
}) => {
  const classes = useStyles();
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

  const getStatusChip = (expense) => {
    if (!expense) return null;
    
    if (expense.fullyCleared) {
      return <Chip label="Fully Cleared" size="small" className={classes.statusCleared} />;
    } else if ((expense.clearedAmount || 0) > 0) {
      return <Chip label="Partially Cleared" size="small" className={classes.statusPartial} />;
    } else {
      return <Chip label="Pending" size="small" className={classes.statusPending} />;
    }
  };

  const renderStatusDetails = (expense) => {
    if (!expense) return null;
    
    const clearedAmount = parseFloat(expense.clearedAmount || 0);
    const totalAmount = parseFloat(expense.amount || 0);
    const remainingAmount = totalAmount - clearedAmount;
  
    if (expense.fullyCleared) {
      return (
        <Box className={classes.statusText}>
          <Typography variant="caption" display="block">
            Fully Cleared: {formatAmount(totalAmount)}
          </Typography>
          {expense.lastClearedBy && (
            <Typography variant="caption" display="block">
              By {expense.lastClearedBy.name || 'Unknown'} ({formatDate(expense.lastClearedAt)})
            </Typography>
          )}
        </Box>
      );
    } else if (clearedAmount > 0) {
      return (
        <Box className={classes.statusText}>
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
        </Box>
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

      // Optimistically update the UI
      const tempExpense = {
        ...currentExpense,
        clearedAmount: (currentExpense.clearedAmount || 0) + amountToClear,
        remainingAmount: remainingAmount - amountToClear,
        lastClearedBy: { 
          id: selectedMember, 
          name: selectedMember === '1' ? 'Anand' : 
                selectedMember === '2' ? 'Jio' : 'Srikanth' 
        },
        lastClearedAt: new Date().toISOString(),
        paymentHistory: [
          ...(currentExpense.paymentHistory || []),
          {
            amount: amountToClear,
            clearedBy: { 
              id: selectedMember, 
              name: selectedMember === '1' ? 'Anand' : 
                    selectedMember === '2' ? 'Jio' : 'Srikanth' 
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
      <Box className={classes.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (!localExpenses || localExpenses.length === 0) {
    return (
      <Typography variant="body1" align="center" style={{ padding: 20 }}>
        No expenses found.
      </Typography>
    );
  }

  return (
    <>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="expenses table">
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell className={classes.headerCell}>Member</TableCell>
              <TableCell className={classes.headerCell}>Description</TableCell>
              <TableCell className={classes.headerCell}>Amount</TableCell>
              <TableCell className={classes.headerCell}>Date</TableCell>
              <TableCell className={classes.headerCell}>Status</TableCell>
              <TableCell className={classes.headerCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {localExpenses.map((expense) => (
              expense && (
                <React.Fragment key={expense.id || `expense-${Math.random()}`}>
                  <TableRow className={classes.row}>
                    <TableCell className={classes.cell}>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          className={classes.avatar}
                          alt={expense.member?.name || 'Unknown'} 
                        >
                          {(expense.member?.name || 'U').charAt(0)}
                        </Avatar>
                        {expense.member?.name || 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell className={classes.cell}>{expense.description || '-'}</TableCell>
                    <TableCell className={classes.cell}>{formatAmount(expense.amount)}</TableCell>
                    <TableCell className={classes.cell}>{formatDate(expense.date)}</TableCell>
                    <TableCell className={classes.cell}>
                      <Box>
                        {getStatusChip(expense)}
                        {renderStatusDetails(expense)}
                      </Box>
                    </TableCell>
                    <TableCell className={classes.actionCell}>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          onClick={() => toggleExpand(expense.id)}
                          className={classes.expandButton}
                          disabled={!expense.id}
                        >
                          {expandedExpenses[expense.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <IconButton
                          aria-label="actions"
                          onClick={(e) => handleMenuOpen(e, expense)}
                          className={classes.menuButton}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} style={{ padding: 0 }}>
                      <Collapse in={expandedExpenses[expense.id]} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                          <Typography variant="h6" gutterBottom>
                            Payment History
                          </Typography>
                          <List dense>
                            {(expense.paymentHistory || []).length > 0 ? (
                              (expense.paymentHistory || []).map((payment, index) => (
                                <React.Fragment key={index}>
                                  <ListItem className={classes.paymentHistoryItem}>
                                    <Box className={classes.paymentItem}>
                                      <Avatar 
                                        className={classes.avatar}
                                        alt={payment.clearedBy?.name || 'Unknown'}
                                      >
                                        {(payment.clearedBy?.name || 'U').charAt(0)}
                                      </Avatar>
                                      <ListItemText
                                        primary={`${formatAmount(payment.amount)} by ${payment.clearedBy?.name || 'Unknown'}`}
                                        secondary={formatDate(payment.clearedAt)}
                                      />
                                    </Box>
                                  </ListItem>
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
      </TableContainer>

      <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleMenuClose}
  MenuListProps={{
    'aria-labelledby': 'expense-actions-menu',
  }}
>
  {isAdmin && [
    <MenuItem 
      key="edit"
      onClick={() => navigate(`/expenses/edit/${currentExpense.id}`)}
    >
      <EditIcon fontSize="small" style={{ marginRight: 8 }} />
      Edit
    </MenuItem>,
    <MenuItem 
      key="delete"
      onClick={handleDeleteClick}
    >
      <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
      Delete
    </MenuItem>,
    <MenuItem 
      key="clear"
      onClick={handleClearClick}
    >
      <ClearIcon fontSize="small" style={{ marginRight: 8 }} />
      Clear
    </MenuItem>
  ]}
  <MenuItem 
    key="history"
    onClick={handleHistoryClick}
  >
    <HistoryIcon fontSize="small" style={{ marginRight: 8 }} />
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
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear Expense</DialogTitle>
        <DialogContent className={classes.dialogContent}>
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
              <MenuItem value={1}>Anand</MenuItem>
              <MenuItem value={2}>Jio</MenuItem>
              <MenuItem value={3}>Srikanth</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
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
                    <Box className={classes.paymentItem}>
                      <Avatar 
                        className={classes.avatar}
                        alt={payment.clearedBy?.name || 'Unknown'}
                      >
                        {(payment.clearedBy?.name || 'U').charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={`${formatAmount(payment.amount)} by ${payment.clearedBy?.name || 'Unknown'}`}
                        secondary={formatDate(payment.date)}
                      />
                    </Box>
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