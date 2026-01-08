import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { api } from '../api';

const EditChapter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    workId: '',
  });

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await api.get(`/api/chapters/${id}`);
        setFormData({
          title: res.data.title,
          content: res.data.content,
          workId: res.data.work,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchChapter();
  }, [id]);

  const { title, content, workId } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.put(`/api/chapters/${id}`, { title, content });
      navigate(`/works/${workId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Chapter
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
          label="Content"
          name="content"
          value={content}
          onChange={onChange}
          fullWidth
          multiline
          rows={10}
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

export default EditChapter;