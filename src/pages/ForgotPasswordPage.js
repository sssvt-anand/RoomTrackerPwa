import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { requestPasswordReset, resetPassword } from '../api/auth';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: request OTP, 2: reset password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'info' });
  const [email, setEmail] = useState('');
  const [otpData, setOtpData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();

  // Timer effect for OTP expiration
  useEffect(() => {
    let timer;
    if (step === 2 && otpData) {
      timer = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - otpData.sentAt) / 1000);
        const remaining = Math.max(0, 600 - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpData]);

  const requestOTP = async (email) => {
    setLoading(true);
    setMessage({ text: '', severity: 'info' });
    
    const { success, error } = await requestPasswordReset(email);
    
    if (success) {
      setEmail(email);
      setOtpData({
        email,
        sentAt: new Date().getTime()
      });
      setStep(2);
      setMessage({ text: 'OTP sent to your email', severity: 'success' });
    } else {
      setMessage({ text: error, severity: 'error' });
    }
    setLoading(false);
  };

  const handleResetPassword = async (values) => {
    setLoading(true);
    setMessage({ text: '', severity: 'info' });
    
    const { success, error } = await resetPassword(
      values.email || email,
      values.otp,
      values.newPassword
    );
    
    if (success) {
      setMessage({ text: 'Password updated successfully!', severity: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage({ text: error, severity: 'error' });
    }
    setLoading(false);
  };

  const handleResendOTP = () => {
    if (email) {
      requestOTP(email);
    }
  };

  const RequestOTPForm = ({ onSubmit, loading }) => {
    const formik = useFormik({
      initialValues: { email: '' },
      validationSchema: Yup.object({
        email: Yup.string().email('Invalid email').required('Required')
      }),
      onSubmit: values => onSubmit(values.email)
    });

    return (
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          name="email"
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && !!formik.errors.email}
          helperText={formik.touched.email && formik.errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Send OTP'}
        </Button>
      </form>
    );
  };

  const ResetPasswordForm = ({ onSubmit, loading, email, onBack, remainingTime }) => {
    const formik = useFormik({
      initialValues: {
        email: email || '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
      },
      validationSchema: Yup.object({
        email: Yup.string().email('Invalid email').required('Required'),
        otp: Yup.string().length(6, 'Must be 6 digits').required('Required'),
        newPassword: Yup.string()
          .min(8, 'Must be at least 8 characters')
          .required('Required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
          .required('Required')
      }),
      onSubmit
    });

    return (
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          name="email"
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          disabled={!!email}
          sx={{ mb: 2 }}
        />
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
          OTP expires in: {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
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
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={onBack}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </Box>
        
        <Button
          fullWidth
          onClick={handleResendOTP}
          disabled={loading || remainingTime > 540}
          sx={{ mt: 2 }}
        >
          Resend OTP
        </Button>
      </form>
    );
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {step === 1 ? 'Reset Password' : 'Create New Password'}
        </Typography>
        
        {step === 1 ? (
          <RequestOTPForm onSubmit={requestOTP} loading={loading} />
        ) : (
          <ResetPasswordForm
            onSubmit={handleResetPassword}
            loading={loading}
            email={email}
            onBack={() => setStep(1)}
            remainingTime={timeLeft}
          />
        )}
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

export default ForgotPasswordPage;