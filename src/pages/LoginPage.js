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
  Snackbar
} from '@material-ui/core';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@material-ui/icons';
import { useAuth } from '../context/AuthContext';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: theme.spacing(3),
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 15,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    padding: theme.spacing(4),
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  title: {
    color: '#2c3e50',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: '#7f8c8d',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  input: {
    borderRadius: 8,
    marginBottom: theme.spacing(2),
  },
  button: {
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
  },
  footer: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
    color: '#7f8c8d',
  },
  link: {
    color: '#764ba2',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  errorSnackbar: {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.common.white,
    borderRadius: 4,
    padding: '6px 16px',
    display: 'flex',
    alignItems: 'center',
  },
}));

const LoginPage = () => {
  const classes = useStyles();
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
      navigate('/dashboard');
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
    <div className={classes.container}>
      <Card className={classes.card} elevation={3}>
        <div className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            Please login to continue
          </Typography>
        </div>

        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <TextField
            name="username"
            label="Username"
            variant="outlined"
            fullWidth
            required
            className={classes.input}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon style={{ color: '#7f8c8d' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            required
            className={classes.input}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon style={{ color: '#7f8c8d' }} />
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              className={classes.button}
              disabled={loading}
            >
              Log in
            </Button>
            {loading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </Box>
        </form>

        <Divider style={{ margin: '16px 0' }} />

        <div className={classes.footer}>
          <Typography variant="body1">
            Don't have an account?{' '}
            <Link to="/register" className={classes.link}>
              Register now
            </Link>
          </Typography>
        </div>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <div className={classes.errorSnackbar}>
          <ErrorIcon style={{ marginRight: 8 }} />
          <Typography variant="body2">{error}</Typography>
          <IconButton 
            size="small" 
            aria-label="close" 
            color="inherit" 
            onClick={handleCloseSnackbar}
            style={{ marginLeft: 8, padding: 4 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </Snackbar>
    </div>
  );
};

export default LoginPage;