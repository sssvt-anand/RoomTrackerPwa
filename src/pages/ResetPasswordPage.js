import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment  // Added InputAdornment import
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { resetPassword, requestPasswordReset } from '../api/auth';  // Added requestPasswordReset import

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'info' });
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formik = useFormik({
    initialValues: {
      otp: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      otp: Yup.string().length(6, 'Must be 6 digits').required('Required'),
      newPassword: Yup.string()
        .min(8, 'Must be at least 8 characters')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Required')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setMessage({ text: '', severity: 'info' });
      
      try {
        const { success, error } = await resetPassword(
          email,
          values.otp,
          values.newPassword
        );
        
        if (success) {
          setMessage({ text: 'Password updated successfully!', severity: 'success' });
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setMessage({ text: error, severity: 'error' });
        }
      } catch (err) {
        setMessage({ text: 'Failed to reset password', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  });

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { success, error } = await requestPasswordReset(email);
      if (success) {
        setMessage({ text: 'New OTP sent to your email', severity: 'success' });
        setTimeLeft(600);
      } else {
        setMessage({ text: error, severity: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to resend OTP', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Password
        </Typography>
        
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            name="otp"
            label="OTP Code"
            value={formik.values.otp}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.otp && !!formik.errors.otp}
            helperText={formik.touched.otp && formik.errors.otp}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            OTP expires in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </Typography>
          <TextField
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.newPassword && !!formik.errors.newPassword}
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            sx={{ mb: 2 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
          
          <Button
            fullWidth
            onClick={handleResendOTP}
            disabled={loading || timeLeft > 540}
          >
            Resend OTP
          </Button>
        </form>
      </Card>

      <Snackbar
        open={!!message.text}
        autoHideDuration={6000}
        onClose={() => setMessage({ text: '', severity: 'info' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={message.severity}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPasswordPage;