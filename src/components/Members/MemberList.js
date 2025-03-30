import React from 'react';
import MemberItem from './MemberItem';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Skeleton
} from '@mui/material';

const MembersList = ({ members, loading }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Members
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(5)].map((_, index) => (
            <Skeleton 
              key={`skeleton-${index}`} 
              variant="rectangular" 
              width="100%" 
              height={72} 
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      ) : members.length === 0 ? (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            fontStyle: 'italic'
          }}
        >
          No members found
        </Typography>
      ) : (
        <List disablePadding>
          {members.map(member => (
            <ListItem 
              key={member.id} 
              disablePadding
              sx={{
                '&:not(:last-child)': {
                  mb: 1
                }
              }}
            >
              <MemberItem member={member} />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MembersList;