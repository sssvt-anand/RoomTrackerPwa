// src/components/Expenses/ExpenseForm.js
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  CircularProgress,
  Box
} from '@mui/material';

const ExpenseForm = ({ initialValues, onSubmit, members, loading }) => {
  const validationSchema = Yup.object({
    description: Yup.string().required('Description is required'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive'),
    memberId: Yup.string().required('Member is required'),
    date: Yup.date().required('Date is required').default(() => new Date())
  });

  const formik = useFormik({
    initialValues: initialValues || {
      description: '',
      amount: '',
      memberId: '',
      date: new Date().toISOString().split('T')[0] // Default to today's date
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        amount: parseFloat(values.amount),
        date: new Date(values.date)
      });
    }
  });

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Box 
        component="form" 
        onSubmit={formik.handleSubmit}
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <TextField
          fullWidth
          id="description"
          name="description"
          label="Description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          id="amount"
          name="amount"
          label="Amount"
          type="number"
          value={formik.values.amount}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.amount && Boolean(formik.errors.amount)}
          helperText={formik.touched.amount && formik.errors.amount}
          required
          variant="outlined"
          InputProps={{
            startAdornment: '$'
          }}
        />

        <TextField
          fullWidth
          id="date"
          name="date"
          label="Date"
          type="date"
          value={formik.values.date}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.date && Boolean(formik.errors.date)}
          helperText={formik.touched.date && formik.errors.date}
          required
          variant="outlined"
          InputLabelProps={{
            shrink: true
          }}
        />

        <FormControl 
          fullWidth 
          error={formik.touched.memberId && Boolean(formik.errors.memberId)}
          variant="outlined"
        >
          <InputLabel id="member-label">Member</InputLabel>
          <Select
            labelId="member-label"
            id="memberId"
            name="memberId"
            value={formik.values.memberId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Member"
            required
          >
            {members.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.memberId && formik.errors.memberId && (
            <FormHelperText>{formik.errors.memberId}</FormHelperText>
          )}
        </FormControl>

        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={loading || !formik.isValid}
          size="large"
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ExpenseForm;