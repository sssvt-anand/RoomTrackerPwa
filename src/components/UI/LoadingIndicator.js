import React from 'react';
import { CircularProgress, Box, Typography } from '@material-ui/core';

const LoadingIndicator = ({ message }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{ height: '100vh' }}
    >
      <CircularProgress size={60} />
      {message && (
        <Typography variant="h6" style={{ marginTop: 20 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingIndicator;