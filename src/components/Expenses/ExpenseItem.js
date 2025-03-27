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
  Divider
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  Info as DetailsIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Person as MemberIcon,
  Description as DescIcon,
  AttachMoney as AmountIcon
} from '@material-ui/icons';

const formatCurrency = (amount) => {
  const number = Number(amount);
  return isNaN(number) ? '$0.00' : `$${number.toFixed(2)}`;
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
    id: expense?.id || null
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
        <IconButton onClick={handleDrawerToggle}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" style={{ marginLeft: 8 }}>
          Expense Details
        </Typography>
      </div>
      <Divider />
      <List>
        <ListItem>
          <ListItemIcon><AmountIcon /></ListItemIcon>
          <ListItemText primary="Amount" secondary={formatCurrency(safeExpense.amount)} />
        </ListItem>
        <ListItem>
          <ListItemIcon><MemberIcon /></ListItemIcon>
          <ListItemText primary="Assigned To" secondary={safeExpense.memberName} />
        </ListItem>
        {safeExpense.description && (
          <ListItem>
            <ListItemIcon><DescIcon /></ListItemIcon>
            <ListItemText primary="Description" secondary={safeExpense.description} />
          </ListItem>
        )}
      </List>
      <Divider />
      <div style={{ padding: 16 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<DetailsIcon />}
          onClick={() => {
            handleDrawerToggle();
            safeExpense.id && navigate(`/expenses/${safeExpense.id}`);
          }}
          style={{ marginBottom: 8 }}
        >
          Full Details
        </Button>
        {isAdmin && (
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={() => {
              handleDrawerToggle();
              safeExpense.id && onDelete(safeExpense.id);
            }}
          >
            Delete Expense
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Card style={{ marginBottom: 15 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={10} onClick={handleDrawerToggle} style={{ cursor: 'pointer' }}>
              <Typography variant="h6">{safeExpense.title}</Typography>
              <Typography color="textSecondary">
                {formatCurrency(safeExpense.amount)}
              </Typography>
            </Grid>
            <Grid item xs={2} style={{ textAlign: 'right' }}>
              <IconButton onClick={handleDrawerToggle}>
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
        style={{ width: 280 }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default ExpenseItem;