import React from 'react';
import { 
  CircularProgress,
  Box,
  Typography,
  styled
} from '@mui/material';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <LoadingContainer>
      <StyledCircularProgress size={60} thickness={4} />
      {message && (
        <LoadingText variant="h6">
          {message}
        </LoadingText>
      )}
    </LoadingContainer>
  );
};

export default LoadingIndicator;