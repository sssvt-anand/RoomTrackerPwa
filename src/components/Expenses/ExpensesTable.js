// src/components/Expenses/ExpensesTable.js
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& th': {
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontSize: '0.75rem',
}));

const StyledTableRow = styled(TableRow)(({ status, theme }) => ({
  ...(status === 'FULLY_CLEARED' && {
    backgroundColor: theme.palette.success.light,
  }),
  ...(status === 'PARTIALLY_CLEARED' && {
    backgroundColor: theme.palette.warning.light,
  }),
  ...(status === 'PENDING' && {
    backgroundColor: theme.palette.error.light,
  }),
  '&:hover': {
    cursor: 'pointer',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const ExpensesTable = ({ expenses, onEdit, onDelete, onClear, isAdmin, onRowClick }) => {
  const getStatusChip = (status) => {
    switch (status) {
      case 'FULLY_CLEARED':
        return <StatusChip label="Fully Cleared" color="success" size="small" />;
      case 'PARTIALLY_CLEARED':
        return <StatusChip label="Partially Cleared" color="warning" size="small" />;
      case 'PENDING':
        return <StatusChip label="Pending" color="error" size="small" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <StyledTableContainer component={Paper}>
      <Table aria-label="expenses table">
        <StyledTableHead>
          <TableRow>
            <TableCell>Member</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            {isAdmin && <TableCell>Actions</TableCell>}
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {expenses.map((expense) => (
            <StyledTableRow
              key={expense.id}
              status={expense.status}
              hover
              onClick={() => onRowClick && onRowClick(expense.id)}
            >
              <TableCell component="th" scope="row">
                <Typography fontWeight="medium">
                  {expense.memberName || 'Unassigned'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography noWrap sx={{ maxWidth: 200 }}>
                  {expense.description}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight="bold">
                  {formatCurrency(expense.amount)}
                </Typography>
              </TableCell>
              <TableCell>
                {new Date(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {getStatusChip(expense.status)}
                  <Typography variant="body2">
                    Cleared: {formatCurrency(expense.clearedAmount)} / {formatCurrency(expense.amount)}
                  </Typography>
                  {expense.status !== 'FULLY_CLEARED' && (
                    <Typography variant="caption" color="text.secondary">
                      Remaining: {formatCurrency(expense.amount - expense.clearedAmount)}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <ActionButton
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(expense.id);
                      }}
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClear(expense.id, expense.memberId, expense.amount - expense.clearedAmount);
                      }}
                      disabled={expense.status === 'FULLY_CLEARED'}
                    >
                      Clear
                    </ActionButton>
                    <ActionButton
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(expense.id);
                      }}
                    >
                      Delete
                    </ActionButton>
                  </Box>
                </TableCell>
              )}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default ExpensesTable;