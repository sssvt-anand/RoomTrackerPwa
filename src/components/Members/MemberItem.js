// src/components/Members/MemberItem.js
import React from 'react';
import { Typography, Chip } from '@material-ui/core';
import AdminPanelSettingsIcon from '@material-ui/icons/AdminPanelSettings';

const MemberItem = ({ member }) => {
  return (
    <div style={{ marginBottom: 16, padding: 16, borderBottom: '1px solid #eee' }}>
      <Typography variant="h6">
        {member.name}
        {member.admin && (
          <Chip
            icon={<AdminPanelSettingsIcon />}
            label="Admin"
            color="secondary"
            size="small"
            style={{ marginLeft: 8 }}
          />
        )}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {member.mobileNumber}
      </Typography>
    </div>
  );
};

export default MemberItem;