import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Typography,
  Avatar,
  Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paymentItem: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
  },
  amountText: {
    fontWeight: 500,
  },
  secondaryText: {
    display: 'block',
    marginTop: theme.spacing(0.5),
  }
}));

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown date';
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
    return 'Unknown date';
  }
};

const PaymentHistory = ({ payments }) => {
  const classes = useStyles();

  if (!payments || payments.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No payment history available
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {payments.map((payment, index) => (
        <React.Fragment key={payment.id || `payment-${index}`}>
          <ListItem>
            <Box className={classes.paymentItem}>
              <Avatar className={classes.avatar}>
                {(payment.clearedBy?.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={
                  <Typography className={classes.amountText}>
                    {formatAmount(payment.amount)}
                  </Typography>
                }
                secondary={
                  <>
                    <span className={classes.secondaryText}>
                      Paid by {payment.clearedBy?.name || 'Unknown'}
                    </span>
                    <span className={classes.secondaryText}>
                      {formatDateTime(payment.timestamp)}
                    </span>
                    {payment.expense?.description && (
                      <span className={classes.secondaryText}>
                        For: {payment.expense.description}
                      </span>
                    )}
                  </>
                }
              />
            </Box>
          </ListItem>
          {index < payments.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default PaymentHistory;