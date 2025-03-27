import React from 'react';
import { Card, CardContent, Typography, Grid } from '@material-ui/core';

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toFixed(2);
};

const SummaryCard = ({ summary }) => {
  if (!summary) {
    return (
      <Card style={{ marginBottom: 16 }}>
        <CardContent>
          <Typography variant="h6">Loading summary...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Expense Summary
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(summary).map(([memberName, amounts]) => (
            <Grid item xs={12} sm={6} md={4} key={memberName}>
              <Typography variant="subtitle1">{memberName}</Typography>
              <Typography>Total: ₹{formatCurrency(amounts?.total)}</Typography>
              <Typography>Cleared: ₹{formatCurrency(amounts?.cleared)}</Typography>
              <Typography>Remaining: ₹{formatCurrency(amounts?.remaining)}</Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;