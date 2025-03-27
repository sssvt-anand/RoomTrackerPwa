import React from 'react';
import { Typography } from '@material-ui/core';

const CurrencyDisplay = ({ value, label, variant = 'h6', ...props }) => (
  <Typography variant={variant} {...props}>
    {label && `${label}: `}₹{(value || 0).toFixed(2)}
  </Typography>
);

export default CurrencyDisplay;