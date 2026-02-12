import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../api';

interface IUser {
  _id: string;
  username: string;
  role: 'user' | 'admin';
}

const emptyCreateForm = {
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin',
};

const emptyEditForm = {
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin',
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } else {
        setError('Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEdit = (user: IUser) => {
    setEditTarget(user);
    setEditForm({
      username: user.username,
      password: '',
      role: user.role,
    });
    setEditOpen(true);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        username: createForm.username,
        password: createForm.password,
        role: createForm.role,
      };
      const res = await api.post('/api/admin/users', payload);
      setUsers((prev) => [...prev, res.data]);
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to create user.');
      } else {
        setError('Failed to create user.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string> = {
        username: editForm.username,
        role: editForm.role,
      };
      if (editForm.password.trim().length > 0) {
        payload.password = editForm.password;
      }

      const res = await api.put(`/api/admin/users/${editTarget._id}`, payload);
      setUsers((prev) => prev.map((user) => (user._id === editTarget._id ? res.data : user)));
      setEditOpen(false);
      setEditTarget(null);
      setEditForm(emptyEditForm);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update user.');
      } else {
        setError('Failed to update user.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: IUser) => {
    if (!window.confirm(`Delete "${user.username}"? This cannot be undone.`)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.delete(`/api/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((item) => item._id !== user._id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to delete user.');
      } else {
        setError('Failed to delete user.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Manage Users</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Add User
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Typography>Loading users...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" color={user.role === 'admin' ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEdit(user)} disabled={submitting}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user)} disabled={submitting}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={createForm.username}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={createForm.password}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Select
            fullWidth
            value={createForm.role}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={submitting}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={editForm.username}
            onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
          />
          <TextField
            label="New Password (optional)"
            type="password"
            fullWidth
            margin="normal"
            value={editForm.password}
            onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Select
            fullWidth
            value={editForm.role}
            onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={submitting}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;
