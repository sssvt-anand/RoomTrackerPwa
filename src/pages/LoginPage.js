import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  styled
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const StyledContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  borderRadius: 15,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  padding: theme.spacing(4),
}));

const StyledHeader = styled('div')(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const StyledTitle = styled(Typography)({
  color: '#2c3e50',
  fontWeight: 600,
  marginBottom: 1,
});

const StyledSubtitle = styled(Typography)({
  color: '#7f8c8d',
});

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  borderRadius: 8,
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: theme.palette.common.white,
  borderRadius: 8,
  fontWeight: 600,
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
  '&:disabled': {
    background: theme.palette.grey[300],
  }
}));

const StyledFooter = styled('div')(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(2),
  color: '#7f8c8d',
}));

const StyledLink = styled(Link)({
  color: '#764ba2',
  fontWeight: 600,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const StyledErrorSnackbar = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.error.dark,
  color: theme.palette.common.white,
  borderRadius: 4,
  padding: '6px 16px',
  display: 'flex',
  alignItems: 'center',
}));

const LoginPage = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(event.target);
    const credentials = {
      username: formData.get('username').trim(),
      password: formData.get('password'),
    };
  
    // Client-side validation
    if (!credentials.username || !credentials.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
  
    try {
      const success = await login(credentials.username, credentials.password);
      if (!success) {
        throw new Error('Invalid credentials');
      }
      navigate('/');  
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || 'Invalid username or password');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <StyledContainer>
      <StyledCard elevation={3}>
        <StyledHeader>
          <StyledTitle variant="h4">
            Welcome Back
          </StyledTitle>
          <StyledSubtitle variant="subtitle1">
            Please login to continue
          </StyledSubtitle>
        </StyledHeader>

        <StyledForm onSubmit={handleSubmit} noValidate>
          <StyledInput
            name="username"
            label="Username"
            variant="outlined"
            fullWidth
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#7f8c8d' }} />
                </InputAdornment>
              ),
            }}
          />

          <StyledInput
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#7f8c8d' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box position="relative">
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
            >
              Log in
            </StyledButton>
            {loading && (
              <CircularProgress 
                size={24} 
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                }}
              />
            )}
          </Box>
        </StyledForm>

        <Divider sx={{ margin: '16px 0' }} />

        <StyledFooter>
          <Typography variant="body1">
            Don't have an account?{' '}
            <StyledLink to="/register">
              Register now
            </StyledLink>
          </Typography>
        </StyledFooter>
      </StyledCard>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <StyledErrorSnackbar>
          <ErrorIcon sx={{ marginRight: 1 }} />
          <Typography variant="body2">{error}</Typography>
          <IconButton 
            size="small" 
            aria-label="close" 
            color="inherit" 
            onClick={handleCloseSnackbar}
            sx={{ marginLeft: 1, padding: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </StyledErrorSnackbar>
      </Snackbar>
    </StyledContainer>
  );
};

export default LoginPage;