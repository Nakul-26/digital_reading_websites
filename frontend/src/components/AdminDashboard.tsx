import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  CircularProgress, // Import CircularProgress for loading indicator
  Box, // Import Box for layout
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api, getAdminFeedback } from '../api';

interface IUser {
  _id: string;
  username: string;
  role: 'user' | 'admin';
}

interface IWork {
  _id: string;
  title: string;
  author: {
    _id: string;
    username:string;
  };
  moderationStatus?: 'pending' | 'published' | 'rejected';
  isPublished?: boolean;
}

interface IFeedback {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [works, setWorks] = useState<IWork[]>([]);
  const [feedback, setFeedback] = useState<IFeedback[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true); // New loading state for users
  const [errorUsers, setErrorUsers] = useState<string | null>(null); // New error state for users
  const [loadingWorks, setLoadingWorks] = useState(true); // New loading state for works
  const [errorWorks, setErrorWorks] = useState<string | null>(null); // New error state for works
  const [loadingFeedback, setLoadingFeedback] = useState(true); // New loading state for feedback
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null); // New error state for feedback
  const [loadingDelete, setLoadingDelete] = useState(false); // New loading state for delete operation
  const [errorDelete, setErrorDelete] = useState<string | null>(null); // New error state for delete operation
  const [loadingModerationId, setLoadingModerationId] = useState<string | null>(null);
  const [errorModeration, setErrorModeration] = useState<string | null>(null);


  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        const res = await api.get('/api/admin/users');
        setUsers(res.data);
      } catch (err: any) {
        console.error(err);
        setErrorUsers(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoadingUsers(false);
      }
    };
    const fetchWorks = async () => {
      setLoadingWorks(true);
      setErrorWorks(null);
      try {
        const res = await api.get('/api/admin/works'); // Changed API endpoint
        setWorks(res.data);
      } catch (err: any) {
        console.error(err);
        setErrorWorks(err.response?.data?.message || 'Failed to load works.');
      } finally {
        setLoadingWorks(false);
      }
    };
    const fetchFeedback = async () => {
      setLoadingFeedback(true);
      setErrorFeedback(null);
      try {
        const res = await getAdminFeedback();
        setFeedback(res);
      } catch (err: any) {
        console.error(err);
        setErrorFeedback(err.response?.data?.message || 'Failed to load feedback.');
      } finally {
        setLoadingFeedback(false);
      }
    };
    fetchUsers();
    fetchWorks();
    fetchFeedback();
  }, []);

  const handleDeleteWork = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this work?')) {
      setLoadingDelete(true);
      setErrorDelete(null);
      try {
        await api.delete(`/api/works/${id}`);
        setWorks(works.filter((work) => work._id !== id));
      } catch (err: any) {
        console.error(err);
        setErrorDelete(err.response?.data?.message || 'Failed to delete work.');
      } finally {
        setLoadingDelete(false);
      }
    }
  };

  const resolveModerationStatus = (work: IWork) => {
    if (work.moderationStatus) {
      return work.moderationStatus;
    }
    return work.isPublished ? 'published' : 'pending';
  };

  const handleModerationUpdate = async (id: string, moderationStatus: 'published' | 'rejected') => {
    setLoadingModerationId(id);
    setErrorModeration(null);
    try {
      const res = await api.put(`/api/admin/works/${id}/moderation`, { moderationStatus });
      setWorks((prevWorks) => prevWorks.map((work) => (work._id === id ? res.data : work)));
    } catch (err: any) {
      console.error(err);
      setErrorModeration(err.response?.data?.message || 'Failed to update moderation status.');
    } finally {
      setLoadingModerationId(null);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      {errorDelete && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorDelete}
        </Typography>
      )}
      {errorModeration && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorModeration}
        </Typography>
      )}

      <Typography variant="h5" component="h2" gutterBottom>
        Users
      </Typography>
      {loadingUsers ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : errorUsers ? (
        <Typography color="error">Error: {errorUsers}</Typography>
      ) : users.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h5" component="h2" gutterBottom>
        Works
      </Typography>
      {loadingWorks ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : errorWorks ? (
        <Typography color="error">Error: {errorWorks}</Typography>
      ) : works.length === 0 ? (
        <Typography>No works found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Moderation</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {works.map((work) => (
                <TableRow key={work._id}>
                  <TableCell>{work.title}</TableCell>
                  <TableCell>{work.author.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={resolveModerationStatus(work)}
                      size="small"
                      color={resolveModerationStatus(work) === 'published' ? 'success' : resolveModerationStatus(work) === 'rejected' ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton component={RouterLink} to={`/edit-work/${work._id}`}>
                      <EditIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleModerationUpdate(work._id, 'published')}
                      disabled={loadingModerationId === work._id}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleModerationUpdate(work._id, 'rejected')}
                      disabled={loadingModerationId === work._id}
                      sx={{ mr: 1 }}
                    >
                      Reject
                    </Button>
                    <IconButton onClick={() => handleDeleteWork(work._id)} disabled={loadingDelete}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Feedback
      </Typography>
      {loadingFeedback ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : errorFeedback ? (
        <Typography color="error">Error: {errorFeedback}</Typography>
      ) : feedback.length === 0 ? (
        <Typography>No feedback found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedback.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.message}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminDashboard;
