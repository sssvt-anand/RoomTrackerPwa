import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Typography,
  Avatar,
  Box,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const AmountText = styled(Typography)({
  fontWeight: 500,
});

const SecondaryText = styled('span')(({ theme }) => ({
  display: 'block',
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'Unknown date';
  }
};

const PaymentHistory = ({ payments }) => {
  if (!payments || payments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No payment history available
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {payments.map((payment, index) => (
        <React.Fragment key={payment.id || `payment-${index}`}>
          <ListItem sx={{ px: 0 }}>
            <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
              <StyledAvatar>
                {(payment.clearedBy?.name || 'U').charAt(0).toUpperCase()}
              </StyledAvatar>
              <ListItemText
                primary={
                  <AmountText>
                    {formatAmount(payment.amount)}
                  </AmountText>
                }
                secondary={
                  <>
                    <SecondaryText>
                      Paid by {payment.clearedBy?.name || 'Unknown'}
                    </SecondaryText>
                    <SecondaryText>
                      {formatDateTime(payment.timestamp)}
                    </SecondaryText>
                    {payment.expense?.description && (
                      <SecondaryText>
                        For: {payment.expense.description}
                      </SecondaryText>
                    )}
                  </>
                }
                sx={{ my: 0.5 }}
              />
            </Stack>
          </ListItem>
          {index < payments.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default PaymentHistory;