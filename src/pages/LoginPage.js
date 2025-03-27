import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container,
  Card,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
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
    border: 'none',
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
    margin: 0,
  },
  error: {
    color: theme.palette.error.main,
    textAlign: 'center',
    marginBottom: theme.spacing(3),
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
    marginBottom: theme.spacing(2),
    '&:hover': {
      boxShadow: theme.shadows[3],
    },
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
}));

const LoginPage = () => {
  const classes = useStyles();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const credentials = {
      username: formData.get('username'),
      password: formData.get('password'),
    };

    try {
      await login(credentials.username, credentials.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login Error:', err);
    }
  };

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <div className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            Please login to continue
          </Typography>
        </div>

        {error && (
          <Typography variant="body2" className={classes.error}>
            {error}
          </Typography>
        )}

        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            name="username"
            label="Username"
            variant="outlined"
            fullWidth
            required
            className={classes.input}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon style={{ color: '#7f8c8d' }} />
                </InputAdornment>
              ),
              style: { borderRadius: 8 },
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
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { borderRadius: 8 },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            className={classes.button}
          >
            Log in
          </Button>
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
    </div>
  );
};

export default LoginPage;