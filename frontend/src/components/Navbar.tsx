import { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  useTheme,
  Box,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { ColorModeContext } from '../ColorModeContext';
import BookIcon from '@mui/icons-material/Book';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!authContext) {
    return null; // or a loading spinner
  }

  const { isAuthenticated, user, checkAuth } = authContext;

  const handleLogout = () => {
    localStorage.removeItem('token');
    checkAuth();
    navigate('/');
    setDrawerOpen(false); // Close drawer on logout
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerLinks = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle} onKeyDown={handleDrawerToggle}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/">
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/feedback">
            <ListItemText primary="Feedback" />
          </ListItemButton>
        </ListItem>
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/my-works">
                <ListItemText primary="My Works" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/upload-work">
                <ListItemText primary="Upload Work" />
              </ListItemButton>
            </ListItem>
            {user?.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/admin">
                  <ListItemText primary="Admin" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/login">
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <BookIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Novel Website
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {isMobile ? (
            <>
              <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component={RouterLink} to="/" color="inherit">
                Home
              </Button>
              <Button component={RouterLink} to="/feedback" color="inherit">
                Feedback
              </Button>
              {isAuthenticated ? (
                <>
                  <Typography>Hi, {user?.username}</Typography>
                  <Button component={RouterLink} to="/my-works" color="inherit">
                    My Works
                  </Button>
                  <Button component={RouterLink} to="/upload-work" color="inherit">
                    Upload Work
                  </Button>
                  {user?.role === 'admin' && (
                    <Button component={RouterLink} to="/admin" color="inherit">
                      Admin
                    </Button>
                  )}
                  <Button variant="contained" disableElevation onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" color="inherit">
                    Login
                  </Button>
                </>
              )}
            </Stack>
          )}
          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
        {drawerLinks}
      </Drawer>
    </>
  );
};

export default Navbar;