import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Import axios for isAxiosError check
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { api } from '../api';
import { INPUT_LIMITS } from '../constants/inputLimits';

const EditChapter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    workId: '',
  });
  const [loadingFetch, setLoadingFetch] = useState(true); // New loading state for fetching chapter data
  const [errorFetch, setErrorFetch] = useState<string | null>(null); // New error state for fetching chapter data
  const [loadingSubmit, setLoadingSubmit] = useState(false); // New loading state for form submission
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null); // New error state for form submission
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New success message state

  const resetMessages = () => {
    setErrorSubmit(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    const fetchChapter = async () => {
      setLoadingFetch(true);
      setErrorFetch(null);
      try {
        const res = await api.get(`/api/chapters/${id}`);
        setFormData({
          title: res.data.title,
          content: res.data.content,
          workId: res.data.work,
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrorFetch(err.response?.data?.message || 'Failed to load chapter data.');
        } else {
          setErrorFetch('An unexpected error occurred while loading chapter data.');
        }
      } finally {
        setLoadingFetch(false);
      }
    };
    fetchChapter();
  }, [id]);

  const { title, content } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    resetMessages();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);
    resetMessages();
    try {
      await api.put(`/api/chapters/${id}`, { title, content });
      setSuccessMessage('Chapter updated successfully!');
      // navigate(`/works/${workId}`); // Optionally navigate after success
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorSubmit(err.response?.data?.message || 'Failed to update chapter.');
      } else {
        setErrorSubmit('An unexpected error occurred during chapter update.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) {
    return <Typography>Loading chapter details for editing...</Typography>;
  }

  if (errorFetch) {
    return <Typography color="error">Error: {errorFetch}</Typography>;
  }

  if (!formData.title) { // Fallback if formData is empty and no fetch error
    return <Typography>Chapter not found or unauthorized.</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Chapter
        </Typography>
        {successMessage && (
          <Typography color="success.main" variant="body2" sx={{ mb: 2 }}>
            {successMessage}
          </Typography>
        )}
        {errorSubmit && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {errorSubmit}
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
          disabled={loadingSubmit}
          inputProps={{ maxLength: INPUT_LIMITS.chapterTitle }}
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
          disabled={loadingSubmit}
          inputProps={{ maxLength: INPUT_LIMITS.chapterContent }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </Box>
    </Container>
  );
};

export default EditChapter;
