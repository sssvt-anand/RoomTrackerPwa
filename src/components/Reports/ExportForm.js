import React, { useState } from 'react';
import { getMonthlyExports, getYearlyExports, getExportHistory } from '../api/exports';
import { saveAs } from 'file-saver';
import {
  Container,
  Typography,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,
  CircularProgress,
  Alert,
  styled
} from '@mui/material';
import { 
  Event as EventIcon,
  History as HistoryIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[2],
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 600,
}));

const ExportForm = () => {
  const [monthlyDates, setMonthlyDates] = useState({ start: '', end: '' });
  const [yearlyDates, setYearlyDates] = useState({ start: '', end: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await getMonthlyExports(monthlyDates.start, monthlyDates.end);
      saveAs(new Blob([response]), `monthly-export-${new Date().toISOString()}.csv`);
      setSuccess('Monthly export downloaded successfully');
    } catch (error) {
      console.error('Export failed:', error);
      setError('Monthly export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleYearlySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await getYearlyExports(yearlyDates.start, yearlyDates.end);
      saveAs(new Blob([response]), `yearly-export-${new Date().toISOString()}.csv`);
      setSuccess('Yearly export downloaded successfully');
    } catch (error) {
      console.error('Export failed:', error);
      setError('Yearly export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExportHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      setError('Failed to load export history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <SectionTitle variant="h4" gutterBottom>
        Expenses Export
      </SectionTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <StyledCard>
        <CardHeader 
          title="Monthly Export" 
          avatar={<EventIcon />}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Box component="form" onSubmit={handleMonthlySubmit}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={monthlyDates.start}
                  onChange={(e) => setMonthlyDates({...monthlyDates, start: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={monthlyDates.end}
                  onChange={(e) => setMonthlyDates({...monthlyDates, end: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
            >
              {loading ? 'Exporting...' : 'Export Monthly'}
            </Button>
          </Box>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardHeader 
          title="Yearly Export" 
          avatar={<EventIcon />}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Box component="form" onSubmit={handleYearlySubmit}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={yearlyDates.start}
                  onChange={(e) => setYearlyDates({...yearlyDates, start: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={yearlyDates.end}
                  onChange={(e) => setYearlyDates({...yearlyDates, end: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
            >
              {loading ? 'Exporting...' : 'Export Yearly'}
            </Button>
          </Box>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardHeader 
          title="Export History" 
          avatar={<HistoryIcon />}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Button
            variant="outlined"
            onClick={loadHistory}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <HistoryIcon />}
            sx={{ mb: 3 }}
          >
            {loading ? 'Loading...' : 'Load Export History'}
          </Button>
          
          {history.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        {formatDate(item.startDate)}
                        {item.endDate && ` to ${formatDate(item.endDate)}`}
                      </TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No export history available
            </Typography>
          )}
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default ExportForm;