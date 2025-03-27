import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress } from '@material-ui/core';
import { getAllMembers } from '../api/members';
import MemberItem from '../components/Members/MemberItem';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersData = await getAllMembers();
        setMembers(membersData);
      } catch (error) {
        console.error('Failed to fetch members', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

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
        Members
      </Typography>
      {members.map((member) => (
        <MemberItem key={member.id} member={member} />
      ))}
    </Container>
  );
};

export default MembersPage;