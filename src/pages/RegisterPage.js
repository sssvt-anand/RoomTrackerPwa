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
  IconButton
} from '@material-ui/core';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@material-ui/icons';
import { register } from '../api/auth';
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

const RegisterPage = () => {
  const classes = useStyles();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      await register(userData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <div className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            Create Account
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            Join us to get started
          </Typography>
        </div>

        {error && (
          <Typography variant="body2" className={classes.error}>
            {error}
          </Typography>
        )}

        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            name="name"
            label="Full Name"
            variant="outlined"
            fullWidth
            required
            className={classes.input}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon style={{ color: '#7f8c8d' }} />
                </InputAdornment>
              ),
              style: { borderRadius: 8 },
            }}
          />

          <TextField
            name="email"
            label="Email"
            type="email"
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
            Register
          </Button>
        </form>

        <Divider style={{ margin: '16px 0' }} />

        <div className={classes.footer}>
          <Typography variant="body1">
            Already have an account?{' '}
            <Link to="/login" className={classes.link}>
              Login here
            </Link>
          </Typography>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;