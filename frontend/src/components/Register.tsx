import React, { useState, useContext } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { api } from '../api';
import { INPUT_LIMITS } from '../constants/inputLimits';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false); // New loading state
  const [error, setError] = useState<string | null>(null); // New error state

  const { username, password } = formData;
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error on input change
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < INPUT_LIMITS.passwordMin) {
      setError(`Password must be at least ${INPUT_LIMITS.passwordMin} characters long.`);
      return;
    }
    setLoading(true); // Set loading to true
    setError(null); // Clear previous errors
    try {
      await api.post('/api/auth/register', formData);
      await authContext?.checkAuth();
      navigate('/upload-work');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Register / Sign up
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={onChange}
            disabled={loading} // Disable during loading
            inputProps={{ maxLength: INPUT_LIMITS.username }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={onChange}
            disabled={loading} // Disable during loading
            inputProps={{
              minLength: INPUT_LIMITS.passwordMin,
              maxLength: INPUT_LIMITS.password,
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading} // Disable during loading
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="secondary">
                  Already have an account? Sign in / Login
                </Typography>
              </RouterLink>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
