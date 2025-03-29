import React, { useState } from 'react';
import { getMonthlyExports, getYearlyExports, getExportHistory } from '../api/exports';
import { saveAs } from 'file-saver';
import { Button, Card, Form, Row, Col, Table } from 'react-bootstrap';

const ExportForm = () => {
  const [monthlyDates, setMonthlyDates] = useState({ start: '', end: '' });
  const [yearlyDates, setYearlyDates] = useState({ start: '', end: '' });
  const [memberId, setMemberId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await getMonthlyExports(monthlyDates.start, monthlyDates.end);
      saveAs(new Blob([response]), `monthly-export-${new Date().toISOString()}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Monthly export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleYearlySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await getYearlyExports(yearlyDates.start, yearlyDates.end);
      saveAs(new Blob([response]), `yearly-export-${new Date().toISOString()}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Yearly export failed');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getExportHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      alert('Failed to load export history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Expenses Export</h2>
      
      <Card className="mb-4">
        <Card.Header>Monthly Export</Card.Header>
        <Card.Body>
          <Form onSubmit={handleMonthlySubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="monthlyStart">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={monthlyDates.start}
                    onChange={(e) => setMonthlyDates({...monthlyDates, start: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="monthlyEnd">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={monthlyDates.end}
                    onChange={(e) => setMonthlyDates({...monthlyDates, end: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Exporting...' : 'Export Monthly'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Yearly Export</Card.Header>
        <Card.Body>
          <Form onSubmit={handleYearlySubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="yearlyStart">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={yearlyDates.start}
                    onChange={(e) => setYearlyDates({...yearlyDates, start: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="yearlyEnd">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={yearlyDates.end}
                    onChange={(e) => setYearlyDates({...yearlyDates, end: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Exporting...' : 'Export Yearly'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Export History</Card.Header>
        <Card.Body>
          <Button variant="secondary" onClick={loadHistory} disabled={loading} className="mb-3">
            {loading ? 'Loading...' : 'Load Export History'}
          </Button>
          {history.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date Range</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td>{item.type}</td>
                    <td>
                      {item.startDate && new Date(item.startDate).toLocaleDateString()}
                      {item.endDate && ` to ${new Date(item.endDate).toLocaleDateString()}`}
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No export history available</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExportForm;