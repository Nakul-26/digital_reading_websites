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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api';

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
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [works, setWorks] = useState<IWork[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/admin/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchWorks = async () => {
      try {
        const res = await api.get('/api/works');
        setWorks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
    fetchWorks();
  }, []);

  const handleDeleteWork = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this work?')) {
      try {
        await api.delete(`/api/works/${id}`);
        setWorks(works.filter((work) => work._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Users
      </Typography>
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
      <Typography variant="h5" component="h2" gutterBottom>
        Works
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {works.map((work) => (
              <TableRow key={work._id}>
                <TableCell>{work.title}</TableCell>
                <TableCell>{work.author.username}</TableCell>
                <TableCell>
                  <IconButton component={RouterLink} to={`/edit-work/${work._id}`}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteWork(work._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminDashboard;
