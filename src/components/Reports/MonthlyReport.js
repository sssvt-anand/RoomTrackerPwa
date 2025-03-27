import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Typography, Paper } from '@material-ui/core';

const MonthlyReport = ({ data }) => {
  if (!data) return <Typography>No monthly data available</Typography>;

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.values(data),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Paper style={{ padding: 20, marginBottom: 20 }}>
      <Typography variant="h6" gutterBottom>
        Monthly Expenses
      </Typography>
      <Bar data={chartData} options={options} />
    </Paper>
  );
};

export default MonthlyReport;