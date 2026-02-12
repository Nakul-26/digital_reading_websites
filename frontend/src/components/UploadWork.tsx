import React, { useState } from 'react';
import axios from 'axios'; // Import axios for isAxiosError check
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
import { api } from '../api';
import { INPUT_LIMITS } from '../constants/inputLimits';

const UploadWork: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'novel',
    description: '',
    genres: '',
    tags: '',
    status: 'ongoing',
    language: '',
    contentWarnings: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // New loading state
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New success message state
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New error message state

  const { title, type, description, genres, tags, status, language, contentWarnings } = formData;

  const resetMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    resetMessages(); // Clear messages on input change
  };
  
  const onSelectChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    resetMessages(); // Clear messages on input change
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCoverImage(e.target.files[0]);
      resetMessages(); // Clear messages on file change
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Set loading to true
    resetMessages(); // Clear previous messages

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
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrorMessage(err.response?.data?.message || 'Cover image upload failed.');
        } else {
          setErrorMessage('An unexpected error occurred during image upload.');
        }
        setLoading(false); // Stop loading if file upload fails
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
      contentWarnings: contentWarnings.split(',').map(cw => cw.trim()),
    };

    try {
      // Auth cookie is sent automatically because axios is configured with withCredentials.
      await api.post('/api/works', workData);
      setSuccessMessage('Work created successfully!');
      setFormData({ // Optionally reset form data on success
        title: '', type: 'novel', description: '', genres: '', tags: '',
        status: 'ongoing', language: '', contentWarnings: '',
      });
      setCoverImage(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || 'Failed to create work.');
      } else {
        setErrorMessage('An unexpected error occurred during work creation.');
      }
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload New Work
        </Typography>
        {successMessage && (
          <Typography color="success.main" variant="body2" sx={{ mb: 2 }}>
            {successMessage}
          </Typography>
        )}
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <TextField
          label="Title"
          name="title"
          value={title}
          onChange={onChange}
          fullWidth
          required
          margin="normal"
          disabled={loading}
          inputProps={{ maxLength: INPUT_LIMITS.workTitle }}
        />
        <FormControl fullWidth margin="normal" disabled={loading}>
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
          disabled={loading}
          inputProps={{ maxLength: INPUT_LIMITS.workDescription }}
        />
        <TextField
          label="Genres (comma-separated)"
          name="genres"
          value={genres}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled={loading}
          inputProps={{ maxLength: INPUT_LIMITS.workListField }}
        />
        <TextField
          label="Tags (comma-separated)"
          name="tags"
          value={tags}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled={loading}
          inputProps={{ maxLength: INPUT_LIMITS.workListField }}
        />
        <FormControl fullWidth margin="normal" disabled={loading}>
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
          disabled={loading}
          inputProps={{ maxLength: INPUT_LIMITS.workLanguage }}
        />
        <TextField
          label="Content Warnings (comma-separated)"
          name="contentWarnings"
          value={contentWarnings}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled={loading}
          inputProps={{ maxLength: INPUT_LIMITS.workListField }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <FormHelperText>
            New works are submitted for admin review and become public after approval.
          </FormHelperText>
          <Button variant="contained" component="label" disabled={loading}>
            Upload Cover Image
            <input type="file" hidden onChange={onFileChange} disabled={loading} />
          </Button>
        </Box>
        {coverImage && <Typography sx={{ mt: 1 }}>{coverImage.name}</Typography>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Creating Work...' : 'Create Work'}
        </Button>
      </Box>
    </Container>
  );
};

export default UploadWork;
