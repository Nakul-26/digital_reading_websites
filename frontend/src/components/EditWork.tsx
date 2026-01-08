import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { AuthContext } from '../AuthContext';
import { api } from '../api';

const EditWork: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const res = await api.get(`/api/works/${id}`);
        setFormData({
          title: res.data.title,
          description: res.data.description,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchWork();
  }, [id]);

  const { title, description } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.put(`/api/works/${id}`, formData);
      navigate(`/works/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Work
        </Typography>
        <TextField
          label="Title"
          name="title"
          value={title}
          onChange={onChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={description}
          onChange={onChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
        >
          Save Changes
        </Button>
      </Box>
    </Container>
  );
};

export default EditWork;