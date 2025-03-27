// src/components/Expenses/ExpensesTable.js
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
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
  Button
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  table: {
    minWidth: 650,
  },
  tableHeader: {
    backgroundColor: theme.palette.primary.main,
    '& th': {
      color: theme.palette.common.white,
      fontWeight: 'bold',
    },
  },
  partiallyCleared: {
    backgroundColor: '#fff3e0',
  },
  fullyCleared: {
    backgroundColor: '#e8f5e9',
  },
  pending: {
    backgroundColor: '#ffebee',
  },
  statusChip: {
    margin: theme.spacing(0.5),
    fontSize: '0.75rem',
  },
  amountCell: {
    fontWeight: 'bold',
  },
  actionButton: {
    marginRight: theme.spacing(1),
  },
}));

const ExpensesTable = ({ expenses, onEdit, onDelete, onClear, isAdmin, onRowClick }) => {
  const classes = useStyles();

  const getRowClass = (status) => {
    if (status === 'FULLY_CLEARED') return classes.fullyCleared;
    if (status === 'PARTIALLY_CLEARED') return classes.partiallyCleared;
    if (status === 'PENDING') return classes.pending;
    return '';
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'FULLY_CLEARED':
        return <Chip label="Fully Cleared" color="primary" size="small" className={classes.statusChip} />;
      case 'PARTIALLY_CLEARED':
        return <Chip label="Partially Cleared" color="secondary" size="small" className={classes.statusChip} />;
      case 'PENDING':
        return <Chip label="Pending" style={{ backgroundColor: '#f44336', color: 'white' }} size="small" className={classes.statusChip} />;
      default:
        return null;
    }
  };

  return (
    <TableContainer component={Paper} className={classes.root}>
      <Table className={classes.table} aria-label="expenses table">
        <TableHead className={classes.tableHeader}>
          <TableRow>
            <TableCell>Member</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            {isAdmin && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow 
              key={expense.id} 
              className={getRowClass(expense.status)}
              hover
              onClick={() => onRowClick && onRowClick(expense.id)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              <TableCell component="th" scope="row">
                {expense.memberName || 'Unassigned'}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell align="right" className={classes.amountCell}>
                ₹{expense.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                {new Date(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getStatusChip(expense.status)}
                <Typography variant="body2">
                  Cleared: ₹{expense.clearedAmount.toFixed(2)} / ₹{expense.amount.toFixed(2)}
                </Typography>
                {expense.status !== 'FULLY_CLEARED' && (
                  <Typography variant="caption" color="textSecondary" display="block">
                    Remaining: ₹{(expense.amount - expense.clearedAmount).toFixed(2)}
                  </Typography>
                )}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    className={classes.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(expense.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    className={classes.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear(expense.id, expense.memberId, expense.amount - expense.clearedAmount);
                    }}
                    disabled={expense.status === 'FULLY_CLEARED'}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(expense.id);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExpensesTable;