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
  makeStyles
} from '@material-ui/core';
import { Phone, Security } from '@material-ui/icons'; // Using Security icon instead
import { getAllMembers } from '../api/members';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  memberCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  adminChip: {
    marginLeft: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    color: 'white',
  },
  phoneNumber: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(7),
    height: theme.spacing(7),
    fontSize: '1.5rem',
  },
}));

const MembersPage = () => {
  const classes = useStyles();
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
      <Typography variant="h4" gutterBottom style={{ marginTop: 24, fontWeight: 600 }}>
        Members
      </Typography>
      
      <List className={classes.root}>
        {members.map((member) => (
          <Paper key={member.id} className={classes.memberCard}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar className={classes.avatar}>
                  {member.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" component="span">
                      {member.name}
                    </Typography>
                    {member.admin && (
                      <Chip
                        icon={<Security style={{ color: 'white' }} />}
                        label="Admin"
                        className={classes.adminChip}
                        size="small"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <div className={classes.phoneNumber}>
                    <Phone fontSize="small" style={{ marginRight: 8 }} />
                    <Typography variant="body1" component="span">
                      {member.mobileNumber}
                    </Typography>
                  </div>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Container>
  );
};

export default MembersPage;