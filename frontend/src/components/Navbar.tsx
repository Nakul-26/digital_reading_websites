import { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  useTheme,
  Box,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../ColorModeContext';
import BookIcon from '@mui/icons-material/Book';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContext) {
    return null; // or a loading spinner
  }

  const { isAuthenticated, user, checkAuth } = authContext;

  const handleLogout = () => {
    localStorage.removeItem('token');
    checkAuth();
    navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
    >
      <Toolbar>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <BookIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Novel Website
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Button component={RouterLink} to="/" color="inherit">
            Home
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
              <Button variant="contained" disableElevation onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login" color="inherit">
                Login
              </Button>
              <Button component={RouterLink} to="/register" color="inherit">
                Register
              </Button>
            </>
          )}
          <IconButton
            sx={{ ml: 1 }}
            onClick={colorMode.toggleColorMode}
            color="inherit"
          >
            {theme.palette.mode === 'dark' ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;