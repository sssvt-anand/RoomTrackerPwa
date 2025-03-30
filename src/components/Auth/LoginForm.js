import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  TextField, 
  Button, 
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5),
}));

const LoginForm = ({ onSubmit }) => {
  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  return (
    <StyledForm onSubmit={formik.handleSubmit}>
      <Typography variant="h5" gutterBottom component="h1" align="center">
        Login
      </Typography>
      
      <TextField
        fullWidth
        id="username"
        name="username"
        label="Username"
        value={formik.values.username}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
        margin="normal"
        variant="outlined"
        autoComplete="username"
      />
      
      <TextField
        fullWidth
        id="password"
        name="password"
        label="Password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        margin="normal"
        variant="outlined"
        autoComplete="current-password"
      />
      
      <Box display="flex" justifyContent="center">
        <SubmitButton
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          size="large"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Logging in...' : 'Login'}
        </SubmitButton>
      </Box>
    </StyledForm>
  );
};

export default LoginForm;