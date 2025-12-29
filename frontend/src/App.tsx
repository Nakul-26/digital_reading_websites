import React, { useState, useMemo, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Container, createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './components/Home';
import WorkPage from './components/WorkPage';
import ChapterReader from './components/ChapterReader';
import UploadWork from './components/UploadWork';
import UploadChapter from './components/UploadChapter';
import Login from './components/Login';
import Register from './components/Register';
import { ColorModeContext } from './ColorModeContext';
import { AuthContext } from './AuthContext';
import getTheme from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import './App.css';

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(() => createTheme(getTheme(mode)), [mode]);
  const authContext = useContext(AuthContext);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            {/* Temporarily disable authentication for testing */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/works/:id" element={<WorkPage />} />
              <Route path="/chapters/:id" element={<ChapterReader />} />
              <Route path="/upload-work" element={<UploadWork />} />
              <Route path="/upload-chapter" element={<UploadChapter />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Container>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
