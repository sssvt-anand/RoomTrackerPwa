import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import {
  Menu as MenuIcon,
  Info as DetailsIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Person as MemberIcon,
  Description as DescIcon,
  AttachMoney as AmountIcon
} from '@mui/icons-material';

const formatCurrency = (amount) => {
  const number = Number(amount);
  return isNaN(number) ? '$0.00' : new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(number);
};

const ExpenseItem = ({ expense, onDelete, isAdmin }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const safeExpense = {
    ...expense,
    title: expense?.title || 'Untitled Expense',
    amount: expense?.amount || 0,
    description: expense?.description || '',
    memberName: expense?.memberName || 'Unassigned',
    id: expense?.id || null,
    date: expense?.date || new Date().toISOString()
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <IconButton onClick={handleDrawerToggle} size="large">
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Expense Details
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem>
          <ListItemIcon><AmountIcon color="primary" /></ListItemIcon>
          <ListItemText 
            primary="Amount" 
            secondary={formatCurrency(safeExpense.amount)} 
            secondaryTypographyProps={{ color: 'text.primary' }}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><MemberIcon color="primary" /></ListItemIcon>
          <ListItemText 
            primary="Assigned To" 
            secondary={safeExpense.memberName} 
            secondaryTypographyProps={{ color: 'text.primary' }}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon><DescIcon color="primary" /></ListItemIcon>
          <ListItemText 
            primary="Date" 
            secondary={new Date(safeExpense.date).toLocaleDateString()} 
            secondaryTypographyProps={{ color: 'text.primary' }}
          />
        </ListItem>
        {safeExpense.description && (
          <ListItem>
            <ListItemIcon><DescIcon color="primary" /></ListItemIcon>
            <ListItemText 
              primary="Description" 
              secondary={safeExpense.description} 
              secondaryTypographyProps={{ color: 'text.primary' }}
            />
          </ListItem>
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<DetailsIcon />}
          onClick={() => {
            handleDrawerToggle();
            safeExpense.id && navigate(`/expenses/${safeExpense.id}`);
          }}
          sx={{ mb: 1 }}
        >
          Full Details
        </Button>
        {isAdmin && (
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              handleDrawerToggle();
              safeExpense.id && onDelete(safeExpense.id);
            }}
          >
            Delete Expense
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Card sx={{ mb: 2, ':hover': { boxShadow: 3 } }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={10} onClick={handleDrawerToggle} sx={{ cursor: 'pointer' }}>
              <Typography variant="h6" component="div">
                {safeExpense.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(safeExpense.amount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(safeExpense.date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'right' }}>
              <IconButton 
                onClick={handleDrawerToggle} 
                aria-label="expense menu"
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 280,
            boxSizing: 'border-box'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default ExpenseItem;