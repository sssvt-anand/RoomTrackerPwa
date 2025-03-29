import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { exportByMember } from '../api/exports';
import { getAllMembers } from '../api/members';
import { saveAs } from 'file-saver';

const MemberExport = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch members on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getAllMembers();
        setMembers(data);
      } catch (err) {
        setError('Failed to load members');
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMember) {
      setError('Please select a member');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await exportByMember(selectedMember);
      
      // Get member name for filename
      const member = members.find(m => m.id === selectedMember);
      const memberName = member ? member.name.replace(/\s+/g, '-') : 'member';
      
      saveAs(new Blob([response]), `expenses-${memberName}-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      setError('Export failed. Please try again.');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header>
        <h5 className="mb-0">Export Expenses by Member</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Select Member</Form.Label>
            <Form.Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              disabled={loading || members.length === 0}
            >
              <option value="">Choose a member...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email || member.id})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !selectedMember}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Exporting...
                </>
              ) : (
                'Export Expenses'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MemberExport;