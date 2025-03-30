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
  styled
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { register } from '../api/auth';

const Container = styled('div')(({ theme }) => ({
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
  border: 'none',
  padding: theme.spacing(4),
}));

const Header = styled('div')(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const Title = styled(Typography)({
  color: '#2c3e50',
  fontWeight: 600,
  marginBottom: 1,
});

const Subtitle = styled(Typography)({
  color: '#7f8c8d',
  margin: 0,
});

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const Footer = styled('div')(({ theme }) => ({
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

const RegisterPage = () => {
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
    <Container>
      <StyledCard>
        <Header>
          <Title variant="h4">
            Create Account
          </Title>
          <Subtitle variant="subtitle1">
            Join us to get started
          </Subtitle>
        </Header>

        {error && (
          <ErrorText variant="body2">
            {error}
          </ErrorText>
        )}

        <Form onSubmit={handleSubmit}>
          <StyledTextField
            name="name"
            label="Full Name"
            variant="outlined"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#7f8c8d' }} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#7f8c8d' }} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            required
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
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
          >
            Register
          </StyledButton>
        </Form>

        <Divider sx={{ margin: '16px 0' }} />

        <Footer>
          <Typography variant="body1">
            Already have an account?{' '}
            <StyledLink to="/login">
              Login here
            </StyledLink>
          </Typography>
        </Footer>
      </StyledCard>
    </Container>
  );
};

export default RegisterPage;