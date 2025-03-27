import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Typography
} from '@material-ui/core';
import {
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  Dashboard as DashboardIcon,
  Receipt as ExpensesIcon,
  People as MembersIcon,
  Assessment as ReportsIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as LoginIcon,
  HowToReg as RegisterIcon
} from '@material-ui/icons';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 100;
const collapsedWidth = 72;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopToggle = () => {
    setDesktopCollapsed(!desktopCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (collapsed = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Collapse/Expand Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '8px',
        height: '64px'
      }}>
        <IconButton onClick={isMobile ? handleDrawerToggle : handleDesktopToggle}>
          {collapsed ? <ExpandIcon /> : <CollapseIcon />}
        </IconButton>
      </div>
      
      <Divider />
      
      {!collapsed && (
        <>
          <div style={{ padding: '16px' }}>
            <Typography variant="h6" noWrap>
              Room Expenses
            </Typography>
          </div>
          <Divider />
          
          <List>
            {user ? (
              <>
                <ListItem button component={Link} to="/">
                  <ListItemIcon><DashboardIcon /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={Link} to="/expenses">
                  <ListItemIcon><ExpensesIcon /></ListItemIcon>
                  <ListItemText primary="Expenses" />
                </ListItem>
                <ListItem button component={Link} to="/members">
                  <ListItemIcon><MembersIcon /></ListItemIcon>
                  <ListItemText primary="Members" />
                </ListItem>
                <ListItem button component={Link} to="/reports">
                  <ListItemIcon><ReportsIcon /></ListItemIcon>
                  <ListItemText primary="Reports" />
                </ListItem>
                <Divider />
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button component={Link} to="/login">
                  <ListItemIcon><LoginIcon /></ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button component={Link} to="/register">
                  <ListItemIcon><RegisterIcon /></ListItemIcon>
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            )}
          </List>
        </>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component="nav"
        sx={{ 
          width: { sm: desktopCollapsed ? collapsedWidth : drawerWidth },
          flexShrink: { sm: 0 },
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawerContent()}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: desktopCollapsed ? collapsedWidth : drawerWidth,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawerContent(desktopCollapsed)}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${desktopCollapsed ? collapsedWidth : drawerWidth}px)` },
          ml: { sm: `${desktopCollapsed ? collapsedWidth : drawerWidth}px` },
        }}
      >
        {/* Page content will render here */}
      </Box>
    </Box>
  );
};

export default Navbar;