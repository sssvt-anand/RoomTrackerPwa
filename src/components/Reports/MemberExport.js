import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
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
    <Card sx={{ boxShadow: 3, mb: 4 }}>
      <CardHeader
        title={
          <Typography variant="h6" component="h2">
            Export Expenses by Member
          </Typography>
        }
        sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }} error={!selectedMember && !!error}>
            <InputLabel id="member-select-label">Select Member</InputLabel>
            <Select
              labelId="member-select-label"
              id="member-select"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              disabled={loading || members.length === 0}
              label="Select Member"
            >
              <MenuItem value="">
                <em>Choose a member...</em>
              </MenuItem>
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name} ({member.email || member.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              type="submit"
              disabled={loading || !selectedMember}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Exporting...' : 'Export Expenses'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MemberExport;