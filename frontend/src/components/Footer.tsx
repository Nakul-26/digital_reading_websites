import React from 'react';
import { AppBar, Toolbar, Typography, useTheme } from '@mui/material';

const Footer: React.FC = () => {
  const theme = useTheme();
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        mt: 'auto', // Pushes the footer to the bottom
        borderTop: `2px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="body2" color="inherit">
          &copy; {new Date().getFullYear()} Novel Website. All rights reserved.
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
