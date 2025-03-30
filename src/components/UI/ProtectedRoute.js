import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  CircularProgress, 
  Box, 
  Typography,
  Backdrop
} from '@mui/material';

const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  roles = [], 
  redirectPath = '/login',
  showLoadingBackdrop = true
}) => {
  const { user, isAdmin, userRoles, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return showLoadingBackdrop ? (
      <Backdrop
        open={true}
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">Authenticating...</Typography>
      </Backdrop>
    ) : (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (roles.length > 0 && !roles.some(role => userRoles?.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;