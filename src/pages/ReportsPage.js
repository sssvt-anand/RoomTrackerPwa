import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Tabs, Tab, Box } from '@material-ui/core';
import { getMonthlyExports, getYearlyExports } from '../api/exports';
import MonthlyReport from '../components/Reports/MonthlyReport';
import YearlyReport from '../components/Reports/YearlyReport';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const ReportsPage = () => {
  const [value, setValue] = useState(0);
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [monthly, yearly] = await Promise.all([
          getMonthlyExports(),
          getYearlyExports()
        ]);
        setMonthlyData(monthly);
        setYearlyData(yearly);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Container style={{ textAlign: 'center', padding: 40 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Monthly" />
        <Tab label="Yearly" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <MonthlyReport data={monthlyData} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <YearlyReport data={yearlyData} />
      </TabPanel>
    </Container>
  );
};

export default ReportsPage;