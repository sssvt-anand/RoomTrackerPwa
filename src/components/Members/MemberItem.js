import React from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';

const MemberItem = ({ member }) => {
  return (
    <Card style={{ marginBottom: 15 }}>
      <CardContent>
        <Typography variant="h6">{member.name}</Typography>
        <Typography color="textSecondary">{member.email}</Typography>
        <Typography variant="body2" style={{ marginTop: 10 }}>
          Joined: {new Date(member.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MemberItem;