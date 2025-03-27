import React from 'react';
import { List, ListItem, ListItemText, Divider, Typography } from '@material-ui/core';

const PaymentHistory = ({ payments }) => {
  if (payments.length === 0) {
    return <Typography>No payment history available</Typography>;
  }

  return (
    <List>
      {payments.map((payment, index) => (
        <React.Fragment key={payment.id}>
          <ListItem>
            <ListItemText
              primary={`$${payment.amount.toFixed(2)}`}
              secondary={`Paid by ${payment.payerName} on ${new Date(
                payment.paymentDate
              ).toLocaleDateString()}`}
            />
          </ListItem>
          {index < payments.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default PaymentHistory;