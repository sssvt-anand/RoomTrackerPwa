import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import { getAllMembersWithBudgets } from '../api/members';
import { Chart } from 'chart.js/auto';

const AllMembersBudgetPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersData = await getAllMembersWithBudgets();
        setMembers(membersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load members data');
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      renderBudgetChart();
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [members]);

  const renderBudgetChart = () => {
    const ctx = document.getElementById('allBudgetsChart');
    if (!ctx) return;

    // Prepare data for the chart
    const labels = members.map(member => member.name);
    const budgets = members.map(member => member.monthlyBudget || 0);
    const usedBudgets = members.map(member => (member.monthlyBudget || 0) * 0.6); // Example usage

    const newChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Monthly Budget',
            data: budgets,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Used Budget',
            data: usedBudgets,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)'
            }
          }
        }
      }
    });

    setChartInstance(newChartInstance);
  };

  const handleViewDetails = (memberId) => {
    navigate(`/members/${memberId}/budget`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/members" onClick={(e) => {
          e.preventDefault();
          navigate('/members');
        }}>
          Members
        </Link>
        <Typography color="text.primary">All Members Budgets</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        All Members Budget Overview
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Budget Distribution
        </Typography>
        <Box sx={{ height: '400px' }}>
          <canvas id="allBudgetsChart"></canvas>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Members Budget Details
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member Name</TableCell>
                <TableCell align="right">Monthly Budget</TableCell>
                <TableCell align="right">Used Budget</TableCell>
                <TableCell align="right">Remaining Budget</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell align="right">
                    ${(member.monthlyBudget || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${((member.monthlyBudget || 0) * 0.6).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${((member.monthlyBudget || 0) * 0.4).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewDetails(member.id)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AllMembersBudgetPage;