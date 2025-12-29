import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';

const UploadWork: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'novel',
    description: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const { title, type, description } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSelectChange = (e: any) => {
    setFormData({ ...formData, type: e.target.value });
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCoverImage(e.target.files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let coverImageUrl = '';

    if (coverImage) {
      const uploadData = new FormData();
      uploadData.append('file', coverImage);
      try {
        const res = await axios.post('http://localhost:3000/api/upload', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        coverImageUrl = res.data.filename;
      } catch (err) {
        console.error(err);
        setMessage('File upload failed.');
        return;
      }
    }

    const workData = {
      title,
      type,
      description,
      coverImage: coverImageUrl,
    };

    try {
      const token = localStorage.getItem('token'); // Assumes token is stored in localStorage
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };
      const res = await axios.post('http://localhost:3000/api/works', workData, config);
      console.log(res.data);
      setMessage('Work created successfully!');
    } catch (err: any) {
      console.error(err.response.data);
      setMessage('Failed to create work.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload New Work
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
        <FormControl fullWidth margin="normal">
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            name="type"
            value={type}
            onChange={onSelectChange}
            label="Type"
          >
            <MenuItem value="novel">Novel</MenuItem>
            <MenuItem value="manga">Manga</MenuItem>
            <MenuItem value="comic">Comic</MenuItem>
          </Select>
        </FormControl>
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
        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Upload Cover Image
          <input type="file" hidden onChange={onFileChange} />
        </Button>
        {coverImage && <Typography sx={{ mt: 1 }}>{coverImage.name}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Create Work
        </Button>
        {message && <FormHelperText sx={{ mt: 2 }}>{message}</FormHelperText>}
      </Box>
    </Container>
  );
};

export default UploadWork;