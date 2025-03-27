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
  CircularProgress
} from '@material-ui/core';

const ExpenseForm = ({ initialValues, onSubmit, members, loading }) => {
  const validationSchema = Yup.object({
    description: Yup.string().required('Description is required'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive'),
    memberId: Yup.string().required('Member is required')
  });

  const formik = useFormik({
    initialValues: initialValues || {
      description: '',
      amount: '',
      memberId: ''
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        amount: parseFloat(values.amount)
      });
    }
  });

  return (
    <Paper style={{ padding: 20 }}>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="description"
          name="description"
          label="Description*"
          value={formik.values.description}
          onChange={formik.handleChange}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
          margin="normal"
        />

        <TextField
          fullWidth
          id="amount"
          name="amount"
          label="Amount*"
          type="number"
          value={formik.values.amount}
          onChange={formik.handleChange}
          error={formik.touched.amount && Boolean(formik.errors.amount)}
          helperText={formik.touched.amount && formik.errors.amount}
          margin="normal"
        />

        <FormControl fullWidth margin="normal" error={formik.touched.memberId && Boolean(formik.errors.memberId)}>
          <InputLabel id="member-label">Member*</InputLabel>
          <Select
            labelId="member-label"
            id="memberId"
            name="memberId"
            value={formik.values.memberId}
            onChange={formik.handleChange}
            label="Member*"
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
          style={{ marginTop: 20 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </form>
    </Paper>
  );
};

export default ExpenseForm;