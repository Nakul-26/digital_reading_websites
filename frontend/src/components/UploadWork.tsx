import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { api } from '../api';

const UploadWork: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'novel',
    description: '',
    genres: '',
    tags: '',
    status: 'ongoing',
    language: '',
    isPublished: false,
    contentWarnings: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const { title, type, description, genres, tags, status, language, isPublished, contentWarnings } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSelectChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const onSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

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
        const res = await api.post('/api/upload', uploadData, {
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
      coverImageUrl: coverImageUrl,
      genres: genres.split(',').map(g => g.trim()),
      tags: tags.split(',').map(t => t.trim()),
      status,
      language,
      isPublished,
      contentWarnings: contentWarnings.split(',').map(cw => cw.trim()),
    };

    try {
      const token = localStorage.getItem('token'); // Assumes token is stored in localStorage
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };
      const res = await api.post('/api/works', workData, config);
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
        <TextField
          label="Genres (comma-separated)"
          name="genres"
          value={genres}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tags (comma-separated)"
          name="tags"
          value={tags}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            name="status"
            value={status}
            onChange={onSelectChange}
            label="Status"
          >
            <MenuItem value="ongoing">Ongoing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="hiatus">Hiatus</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Language"
          name="language"
          value={language}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Content Warnings (comma-separated)"
          name="contentWarnings"
          value={contentWarnings}
          onChange={onChange}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublished}
                  onChange={onSwitchChange}
                  name="isPublished"
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: (theme) => theme.palette.grey[500],
                      '&:hover': {
                        backgroundColor: (theme) => `${theme.palette.grey[500]}14`,
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: (theme) => theme.palette.grey[500],
                    },
                  }}
                />
              }
              label="Published"
            />
            <FormHelperText>If published, the work will be visible to all users.</FormHelperText>
          </Box>
          <Button variant="contained" component="label">
            Upload Cover Image
            <input type="file" hidden onChange={onFileChange} />
          </Button>
        </Box>
        {coverImage && <Typography sx={{ mt: 1 }}>{coverImage.name}</Typography>}
        <Button
          type="submit"
          variant="contained"
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
