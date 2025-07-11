import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  CssBaseline  
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  Dashboard as DashboardIcon,
  Receipt as ExpensesIcon,
  People as MembersIcon,
  Assessment as ReportsIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as LoginIcon,
  HowToReg as RegisterIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;
const collapsedWidth = 72;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDesktopToggle = () => setDesktopCollapsed(!desktopCollapsed);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItemStyle = (path) => ({
    backgroundColor: location.pathname === path ? '#2563eb' : 'transparent',
    color: location.pathname === path ? '#ffffff' : '#cbd5e1',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#1e293b',
    },
    margin: '4px 8px',
  });

  const drawerContent = (collapsed = false) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: isMobile ? '#ffffff' : '#0d1b2a',
      color: isMobile ? '#000000' : '#ffffff',
      pt: { xs: '64px', sm: 0 }
    }}>
      {/* Collapse/Expand Button */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '8px', height: '64px' }}>
          <IconButton sx={{ color: '#ffffff' }} onClick={handleDesktopToggle}>
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
        </Box>
      )}
      
      <Divider sx={{ backgroundColor: isMobile ? '#e0e0e0' : '#374151' }} />
      
      <List sx={{ px: collapsed ? 1 : 2 }}>
        {user ? (
          <>
            <ListItem button component={Link} to="/" sx={getMenuItemStyle('/')}>
              <ListItemIcon sx={{ color: isMobile ? '#000000' : 'inherit', minWidth: collapsed ? '40px' : '56px' }}>
                <DashboardIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Dashboard" sx={{ color: isMobile ? '#000000' : 'inherit' }} />}
            </ListItem>
            <ListItem button component={Link} to="/expenses" sx={getMenuItemStyle('/expenses')}>
              <ListItemIcon sx={{ color: isMobile ? '#000000' : 'inherit', minWidth: collapsed ? '40px' : '56px' }}>
                <ExpensesIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Expenses" sx={{ color: isMobile ? '#000000' : 'inherit' }} />}
            </ListItem>
            <ListItem button component={Link} to="/members" sx={getMenuItemStyle('/members')}>
              <ListItemIcon sx={{ color: isMobile ? '#000000' : 'inherit', minWidth: collapsed ? '40px' : '56px' }}>
                <MembersIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Members" sx={{ color: isMobile ? '#000000' : 'inherit' }} />}
            </ListItem>
            <ListItem button component={Link} to="/budget" sx={getMenuItemStyle('/budget')}>
  <ListItemIcon sx={{ color: isMobile ? '#000000' : 'inherit', minWidth: collapsed ? '40px' : '56px' }}>
    <AccountBalanceWalletIcon />
  </ListItemIcon>
  {!collapsed && <ListItemText primary="Budget" sx={{ color: isMobile ? '#000000' : 'inherit' }} />}
</ListItem>
            <ListItem button component={Link} to="/reports" sx={getMenuItemStyle('/reports')}>
              <ListItemIcon sx={{ color: isMobile ? '#000000' : 'inherit', minWidth: collapsed ? '40px' : '56px' }}>
                <ReportsIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Reports" sx={{ color: isMobile ? '#000000' : 'inherit' }} />}
            </ListItem>
             

            {/* Optional Budgets link - you can remove this if not needed */}
            
            <Divider sx={{ backgroundColor: isMobile ? '#e0e0e0' : '#374151', my: 1 }} />
            <ListItem button onClick={handleLogout} sx={getMenuItemStyle('/logout')}>
              <ListItemIcon sx={{ color: isMobile ? '#000000' : 'inherit', minWidth: collapsed ? '40px' : '56px' }}>
                <LogoutIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Logout" sx={{ color: isMobile ? '#000000' : 'inherit' }} />}
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" sx={getMenuItemStyle('/login')}>
              <ListItemIcon sx={{ color: isMobile ? '#000000' : 'inherit', minWidth: collapsed ? '40px' : '56px' }}>
                <LoginIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Login" sx={{ color: isMobile ? '#000000' : 'inherit' }} />}
            </ListItem>
            <ListItem button component={Link} to="/register" sx={getMenuItemStyle('/register')}>
              <ListItemIcon sx={{ color: isMobile ? '#000000' : 'inherit', minWidth: collapsed ? '40px' : '56px' }}>
                <RegisterIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Register" sx={{ color: isMobile ? '#000000' : 'inherit' }} />}
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Mobile menu button - changed to black */}
      {isMobile && (
        <IconButton 
          sx={{ 
            position: 'fixed',
            top: 16,
            left: 16,
            color: '#000000',
            zIndex: theme.zIndex.drawer + 2,
          }} 
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      <Box component="nav" sx={{ width: { sm: desktopCollapsed ? collapsedWidth : drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ 
            keepMounted: true,
            BackdropProps: {
              style: {
                backgroundColor: 'rgba(0,0,0,0.5)'
              }
            }
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              backgroundColor: '#ffffff',
              color: '#000000',
              boxSizing: 'border-box',
              zIndex: theme.zIndex.drawer + 1,
            },
          }}
        >
          {drawerContent(false)}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              width: desktopCollapsed ? collapsedWidth : drawerWidth,
              overflowX: 'hidden',
              backgroundColor: '#0d1b2a',
              color: '#ffffff',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: 'border-box',
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
          pt: { xs: '80px', sm: 3 },
        }}
      >
        {/* Page content */}
      </Box>
    </Box>
  );
};

export default Navbar;