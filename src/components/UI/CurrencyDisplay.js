import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CurrencyDisplay = ({ 
  value, 
  label, 
  variant = 'h6', 
  color = 'text.primary',
  fontWeight = 'normal',
  currencySymbol = '₹',
  precision = 2,
  showPositiveSign = false,
  ...props 
}) => {
  const theme = useTheme();
  
  const formattedValue = () => {
    const numericValue = Number(value) || 0;
    const sign = showPositiveSign && numericValue > 0 ? '+' : '';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
      currencyDisplay: 'symbol'
    }).format(numericValue).replace('₹', currencySymbol);
  };

  return (
    <Box component="span" display="inline-flex" alignItems="baseline">
      {label && (
        <Typography 
          component="span" 
          variant={variant}
          color={color}
          fontWeight={fontWeight}
          sx={{ mr: 1 }}
        >
          {label}:
        </Typography>
      )}
      <Typography 
        variant={variant} 
        component="span"
        color={color}
        fontWeight={fontWeight}
        {...props}
      >
        {formattedValue()}
      </Typography>
    </Box>
  );
};

export default CurrencyDisplay;