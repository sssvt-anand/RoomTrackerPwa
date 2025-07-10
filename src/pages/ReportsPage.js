import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { getMonthlyExports, exportByMember } from '../api/exports';
import { getAllMembers } from '../api/members';
import { saveAs } from 'file-saver';

const ReportsPage = () => {
  // Monthly report state
  const [dates, setDates] = useState({ start: '', end: '' });
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState(null);
  const [monthlySuccess, setMonthlySuccess] = useState(false);

  // Member report state
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState(null);
  const [memberSuccess, setMemberSuccess] = useState(false);

  // Fetch members on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getAllMembers();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, []);

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    
    if (dates.start && dates.end && new Date(dates.start) > new Date(dates.end)) {
      setMonthlyError('End date must be after start date');
      return;
    }

    setMonthlyLoading(true);
    setMonthlyError(null);
    setMonthlySuccess(false);
    
    try {
      const response = await getMonthlyExports(dates.start, dates.end);
      saveAs(new Blob([response]), `monthly-expenses-${dates.start || 'all'}-${dates.end || 'all'}.csv`);
      setMonthlySuccess(true);
    } catch (error) {
      console.error('Export failed:', error);
      setMonthlyError('Export failed. Please try again or contact support.');
    } finally {
      setMonthlyLoading(false);
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMember) {
      setMemberError('Please select a member');
      return;
    }

    setMemberLoading(true);
    setMemberError(null);
    setMemberSuccess(false);
    
    try {
      const response = await exportByMember(selectedMember);
      const member = members.find(m => m.id === selectedMember);
      const memberName = member ? member.name.replace(/\s+/g, '-') : 'member';
      saveAs(new Blob([response]), `expenses-${memberName}-${new Date().toISOString().split('T')[0]}.csv`);
      setMemberSuccess(true);
    } catch (error) {
      console.error('Export failed:', error);
      setMemberError('Export failed. Please try again or contact support.');
    } finally {
      setMemberLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Financial Reports</h1>
        <p className="reports-subtitle">Generate and download expense reports</p>
      </div>
      
      <Tabs defaultActiveKey="monthly" id="report-tabs" className="mb-4">
        <Tab eventKey="monthly" title="Monthly Expenses">
          <Card className="reports-card mt-3">
            <Card.Body>
              <div className="report-section">
                <div className="section-header">
                  <i className="bi bi-calendar-range section-icon"></i>
                  <h2>Monthly Expense Report</h2>
                </div>
                <p className="section-description">
                  Export a detailed breakdown of expenses between selected dates.
                </p>
                
                {monthlyError && <Alert variant="danger" onClose={() => setMonthlyError(null)} dismissible>{monthlyError}</Alert>}
                {monthlySuccess && (
                  <Alert variant="success" onClose={() => setMonthlySuccess(false)} dismissible>
                    Report generated successfully! Your download should start automatically.
                  </Alert>
                )}

                <Form onSubmit={handleMonthlySubmit}>
                  <Row className="date-selection">
                    <Col md={6}>
                      <Form.Group controlId="startDate" className="date-picker">
                        <Form.Label>
                          <i className="bi bi-calendar-date"></i> Start Date
                          <span className="optional-label">(Optional)</span>
                        </Form.Label>
                        <Form.Control 
                          type="date"
                          value={dates.start}
                          onChange={(e) => setDates({...dates, start: e.target.value})}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="endDate" className="date-picker">
                        <Form.Label>
                          <i className="bi bi-calendar-date"></i> End Date
                          <span className="optional-label">(Optional)</span>
                        </Form.Label>
                        <Form.Control 
                          type="date"
                          value={dates.end}
                          onChange={(e) => setDates({...dates, end: e.target.value})}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <div className="action-buttons">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={monthlyLoading}
                      className="export-button"
                    >
                      {monthlyLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download me-2"></i>
                          Export Monthly Expenses
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setDates({ start: '', end: '' })}
                      className="clear-button"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Clear Dates
                    </Button>
                  </div>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="member" title="Member Expenses">
          <Card className="reports-card mt-3">
            <Card.Body>
              <div className="report-section">
                <div className="section-header">
                  <i className="bi bi-people section-icon"></i>
                  <h2>Member Expense Report</h2>
                </div>
                <p className="section-description">
                  Export all expenses for a specific member.
                </p>
                
                {memberError && <Alert variant="danger" onClose={() => setMemberError(null)} dismissible>{memberError}</Alert>}
                {memberSuccess && (
                  <Alert variant="success" onClose={() => setMemberSuccess(false)} dismissible>
                    Report generated successfully! Your download should start automatically.
                  </Alert>
                )}

                <Form onSubmit={handleMemberSubmit}>
                  <Form.Group controlId="memberSelect" className="mb-4">
                    <Form.Label>
                      <i className="bi bi-person-circle me-2"></i>
                      Select Member
                    </Form.Label>
                    <Form.Select
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value)}
                      className="form-control-lg"
                      disabled={members.length === 0}
                    >
                      <option value="">Choose a member...</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} {member.email && `(${member.email})`}
                        </option>
                      ))}
                    </Form.Select>
                    {members.length === 0 && (
                      <div className="text-muted small mt-2">Loading members...</div>
                    )}
                  </Form.Group>
                  
                  <div className="action-buttons">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={memberLoading || !selectedMember}
                      className="export-button"
                    >
                      {memberLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download me-2"></i>
                          Export Member Expenses
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSelectedMember('')}
                      disabled={!selectedMember}
                      className="clear-button"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Clear Selection
                    </Button>
                  </div>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      <div className="reports-footer">
        <p className="help-text">
          <i className="bi bi-info-circle"></i> Need help? Contact ganand9603@gmail.com
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;