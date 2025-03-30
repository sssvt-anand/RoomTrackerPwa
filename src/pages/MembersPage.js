import React, { useState, useEffect } from 'react';
import { 
  Container,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  styled
} from '@mui/material';
import { Phone, Security } from '@mui/icons-material';
import { getAllMembers } from '../api/members';

const RootList = styled(List)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const MemberCard = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const AdminChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
  color: 'white',
}));

const PhoneNumber = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
}));

const MemberAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: theme.spacing(7),
  height: theme.spacing(7),
  fontSize: '1.5rem',
}));

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
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ marginTop: 3, fontWeight: 600 }}>
        Members
      </Typography>
      
      <RootList>
        {members.map((member) => (
          <MemberCard key={member.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <MemberAvatar>
                  {member.name.charAt(0)}
                </MemberAvatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" component="span">
                      {member.name}
                    </Typography>
                    {member.admin && (
                      <AdminChip
                        icon={<Security sx={{ color: 'white' }} />}
                        label="Admin"
                        size="small"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <PhoneNumber>
                    <Phone fontSize="small" sx={{ marginRight: 1 }} />
                    <Typography variant="body1" component="span">
                      {member.mobileNumber}
                    </Typography>
                  </PhoneNumber>
                }
              />
            </ListItem>
          </MemberCard>
        ))}
      </RootList>
    </Container>
  );
};

export default MembersPage;