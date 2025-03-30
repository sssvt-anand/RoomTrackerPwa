import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Skeleton,
  Divider,
  useTheme
} from '@mui/material';

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const SummaryCard = ({ summary, loading }) => {
  const theme = useTheme();

  const getAmountColor = (amount) => {
    if (amount > 0) return theme.palette.error.main;
    if (amount < 0) return theme.palette.success.main;
    return theme.palette.text.secondary;
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {[...Array(3)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="80%" height={24} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (!summary || Object.keys(summary).length === 0) {
    return (
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No summary data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Expense Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {Object.entries(summary).map(([memberName, amounts]) => (
            <Grid item xs={12} sm={6} md={4} key={memberName}>
              <Box
                sx={{
                  p: 2,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                  {memberName}
                </Typography>
                <Typography>
                  <Box component="span" sx={{ fontWeight: 'bold' }}>Total:</Box> {formatCurrency(amounts?.total)}
                </Typography>
                <Typography sx={{ color: theme.palette.success.main }}>
                  <Box component="span" sx={{ fontWeight: 'bold' }}>Cleared:</Box> {formatCurrency(amounts?.cleared)}
                </Typography>
                <Typography sx={{ color: getAmountColor(amounts?.remaining) }}>
                  <Box component="span" sx={{ fontWeight: 'bold' }}>Remaining:</Box> {formatCurrency(amounts?.remaining)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;