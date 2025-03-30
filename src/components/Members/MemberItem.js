import React from 'react';
import { 
  Typography, 
  Chip,
  Box,
  Avatar
} from '@mui/material';
import { 
  AdminPanelSettings as AdminPanelSettingsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const MemberCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const MemberAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(6),
  height: theme.spacing(6),
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
}));

const MemberInfo = styled(Box)({
  flex: 1,
});

const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  '& svg': {
    fontSize: '1rem',
    marginRight: theme.spacing(0.5),
  },
}));

const AdminChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  '& .MuiChip-icon': {
    color: theme.palette.secondary.contrastText,
  },
}));

const MemberItem = ({ member }) => {
  return (
    <MemberCard>
      <MemberAvatar>
        {member.name.charAt(0).toUpperCase()}
      </MemberAvatar>
      
      <MemberInfo>
        <Box display="flex" alignItems="center">
          <Typography variant="subtitle1" fontWeight="medium">
            {member.name}
          </Typography>
          {member.admin && (
            <AdminChip
              icon={<AdminPanelSettingsIcon />}
              label="Admin"
              color="secondary"
              size="small"
            />
          )}
        </Box>

        {member.mobileNumber && (
          <ContactInfo>
            <PhoneIcon fontSize="inherit" />
            <Typography variant="body2" component="span">
              {member.mobileNumber}
            </Typography>
          </ContactInfo>
        )}

        {member.email && (
          <ContactInfo>
            <EmailIcon fontSize="inherit" />
            <Typography variant="body2" component="span">
              {member.email}
            </Typography>
          </ContactInfo>
        )}
      </MemberInfo>
    </MemberCard>
  );
};

export default MemberItem;