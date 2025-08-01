import React, { useState, useCallback } from 'react';
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
  Avatar,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getPaymentHistory } from '../../api/expenses';

// Styled Components
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
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'cleared' ? theme.palette.success.main : 
                  status === 'pending' ? theme.palette.warning.main : 
                  theme.palette.info.main,
  color: theme.palette.common.white,
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

const MemberAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  marginRight: theme.spacing(2),
}));

const PaymentItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const PaymentHistoryLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
    <CircularProgress size={24} />
    <Typography variant="body2" sx={{ ml: 2 }}>
      Loading payment details...
    </Typography>
  </Box>
);

const LoadingRow = () => (
  <StyledTableRow>
    <StyledTableCell><Skeleton variant="text" /></StyledTableCell>
    <StyledTableCell><Skeleton variant="text" width="60%" /></StyledTableCell>
    <StyledTableCell><Skeleton variant="text" width="80%" /></StyledTableCell>
    <StyledTableCell>
      <Box display="flex" alignItems="center">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width="60%" sx={{ ml: 2 }} />
      </Box>
    </StyledTableCell>
    <StyledTableCell><Skeleton variant="text" /></StyledTableCell>
  </StyledTableRow>
);

const ExpenseList = ({ 
  expenses = [], 
  loading = false,
  members = [],
  onClickExpense = () => {}
}) => {
  const [expandedExpenses, setExpandedExpenses] = useState({});
  const [paymentHistories, setPaymentHistories] = useState({});
  const [loadingHistoryIds, setLoadingHistoryIds] = useState([]);

  const formatAmount = useCallback((amount) => {
    try {
      const num = typeof amount === 'number' ? amount : parseFloat(amount || 0);
      return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
    } catch {
      return '₹0.00';
    }
  }, []);

  const formatDate = useCallback((dateString) => {
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
  }, []);

  const getStatusChip = useCallback((expense) => {
    if (!expense) return null;
    
    if (expense.fullyCleared) {
      return <StatusChip label="Fully Cleared" size="small" status="cleared" />;
    } else if ((expense.clearedAmount || 0) > 0) {
      return <StatusChip label="Partially Cleared" size="small" status="partial" />;
    } else {
      return <StatusChip label="Pending" size="small" status="pending" />;
    }
  }, []);

  const renderStatusDetails = useCallback((expense) => {
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
  }, [formatAmount, formatDate]);

  const handleExpand = async (expenseId) => {
    setExpandedExpenses(prev => ({
      ...prev,
      [expenseId]: !prev[expenseId]
    }));

    if (!expandedExpenses[expenseId] && !paymentHistories[expenseId]) {
      try {
        setLoadingHistoryIds(prev => [...prev, expenseId]);
        const history = await getPaymentHistory(expenseId);
        setPaymentHistories(prev => ({
          ...prev,
          [expenseId]: history
        }));
      } catch (error) {
        console.error('Failed to load payment history:', error);
      } finally {
        setLoadingHistoryIds(prev => prev.filter(id => id !== expenseId));
      }
    }
  };

  if (loading && (!expenses || expenses.length === 0)) {
    return (
      <LoadingContainer>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading expenses...</Typography>
      </LoadingContainer>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ p: 2.5 }}>
        No expenses found.
      </Typography>
    );
  }

  return (
    <StyledTableContainer component={Paper}>
      <Table aria-label="expenses table" size="medium">
        <StyledTableHead>
          <TableRow>
            <StyledHeaderCell>Description</StyledHeaderCell>
            <StyledHeaderCell>Amount</StyledHeaderCell>
            <StyledHeaderCell>Status</StyledHeaderCell>
            <StyledHeaderCell>Member</StyledHeaderCell>
            <StyledHeaderCell>Date</StyledHeaderCell>
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {loading && expenses.length === 0 ? (
            Array(5).fill().map((_, i) => <LoadingRow key={`skeleton-${i}`} />)
          ) : (
            expenses.map((expense) => (
              <React.Fragment key={expense.id || `expense-${Math.random()}`}>
                <StyledTableRow
                  hover
                  onClick={() => {
                    onClickExpense(expense.id);
                    handleExpand(expense.id);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <StyledTableCell>{expense.description || '-'}</StyledTableCell>
                  <StyledTableCell>{formatAmount(expense.amount)}</StyledTableCell>
                  <StyledTableCell>
                    <Box>
                      {getStatusChip(expense)}
                      {renderStatusDetails(expense)}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>
  <Box display="flex" alignItems="center">
    <MemberAvatar alt={expense.memberName || expense.member?.name || 'Unknown'}>
      {(expense.memberName || expense.member?.name || 'U').charAt(0)}
    </MemberAvatar>
    {expense.memberName || expense.member?.name || 'Unknown'}
  </Box>
</StyledTableCell>
                  <StyledTableCell>{formatDate(expense.date)}</StyledTableCell>
                </StyledTableRow>
                <TableRow>
                  <TableCell colSpan={5} sx={{ p: 0 }}>
                    <Collapse in={expandedExpenses[expense.id]} timeout="auto" unmountOnExit>
                      <Box sx={{ m: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          Payment History
                          {loadingHistoryIds.includes(expense.id) && (
                            <CircularProgress size={20} sx={{ ml: 2 }} />
                          )}
                        </Typography>
                        {loadingHistoryIds.includes(expense.id) ? (
                          <PaymentHistoryLoader />
                        ) : (
                          <List dense>
                            {paymentHistories[expense.id]?.length > 0 ? (
                              paymentHistories[expense.id].map((payment, index) => (
                                <React.Fragment key={`payment-${index}`}>
                                  <ListItem>
                                    <PaymentItem>
                                      <MemberAvatar alt={payment.clearedBy?.name || 'Unknown'}>
                                        {(payment.clearedBy?.name || 'U').charAt(0)}
                                      </MemberAvatar>
                                      <ListItemText
                                        primary={`${formatAmount(payment.amount)} by ${payment.clearedBy?.name || 'Unknown'}`}
                                        secondary={formatDate(payment.clearedAt)}
                                      />
                                    </PaymentItem>
                                  </ListItem>
                                  {index < paymentHistories[expense.id].length - 1 && <Divider />}
                                </React.Fragment>
                              ))
                            ) : (
                              <ListItem>
                                <ListItemText primary="No payment history available" />
                              </ListItem>
                            )}
                          </List>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default ExpenseList;