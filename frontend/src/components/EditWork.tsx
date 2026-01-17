import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Switch,
  FormControlLabel,
  FormHelperText, // Added FormHelperText for messages
} from '@mui/material';
import { AuthContext } from '../AuthContext';
import { api } from '../api';

const EditWork: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genres: '',
    tags: '',
    status: 'ongoing',
    language: '',
    isPublished: false,
    contentWarnings: '',
  });
  const [loadingFetch, setLoadingFetch] = useState(true); // New loading state for fetching work data
  const [errorFetch, setErrorFetch] = useState<string | null>(null); // New error state for fetching work data
  const [loadingSubmit, setLoadingSubmit] = useState(false); // New loading state for form submission
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null); // New error state for form submission
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New success message state
  const authContext = useContext(AuthContext);

  const resetMessages = () => {
    setErrorSubmit(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    const fetchWork = async () => {
      setLoadingFetch(true);
      setErrorFetch(null);
      try {
        const res = await api.get(`/api/works/${id}`);
        // Check if the current user is the author or admin before allowing edit
        if (authContext?.user?._id !== res.data.author._id && authContext?.user?.role !== 'admin') {
            setErrorFetch('You are not authorized to edit this work.');
            setLoadingFetch(false);
            return;
        }

        setFormData({
          title: res.data.title,
          description: res.data.description,
          genres: res.data.genres.join(', '),
          tags: res.data.tags.join(', '),
          status: res.data.status,
          language: res.data.language,
          isPublished: res.data.isPublished,
          contentWarnings: res.data.contentWarnings.join(', '),
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrorFetch(err.response?.data?.message || 'Failed to load work data.');
        } else {
          setErrorFetch('An unexpected error occurred while loading work data.');
        }
      } finally {
        setLoadingFetch(false);
      }
    };
    fetchWork();
  }, [id, authContext?.user]); // Added authContext.user as dependency to re-check authorization if user changes

  const { title, description, genres, tags, status, language, isPublished, contentWarnings } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    resetMessages();
  };

  const onSelectChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    resetMessages();
  }

  const onSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
    resetMessages();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);
    resetMessages();
    try {
      const workData = {
        ...formData,
        genres: genres.split(',').map(g => g.trim()),
        tags: tags.split(',').map(t => t.trim()),
        contentWarnings: contentWarnings.split(',').map(cw => cw.trim()),
      };
      await api.put(`/api/works/${id}`, workData);
      setSuccessMessage('Work updated successfully!');
      // navigate(`/works/${id}`); // Optionally navigate after success
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorSubmit(err.response?.data?.message || 'Failed to update work.');
      } else {
        setErrorSubmit('An unexpected error occurred during work update.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) {
    return <Typography>Loading work details for editing...</Typography>;
  }

  if (errorFetch) {
    return <Typography color="error">Error: {errorFetch}</Typography>;
  }

  if (!formData.title) { // Fallback if formData is empty and no fetch error
    return <Typography>Work not found or unauthorized.</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Work
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
          disabled={loadingSubmit}
        />
        <TextField
          label="Genres (comma-separated)"
          name="genres"
          value={genres}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled={loadingSubmit}
        />
        <TextField
          label="Tags (comma-separated)"
          name="tags"
          value={tags}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled={loadingSubmit}
        />
        <FormControl fullWidth margin="normal" disabled={loadingSubmit}>
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
          disabled={loadingSubmit}
        />
        <TextField
          label="Content Warnings (comma-separated)"
          name="contentWarnings"
          value={contentWarnings}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled={loadingSubmit}
        />
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
                      disabled={loadingSubmit}
                    />        <FormHelperText>If published, the work will be visible to all users.</FormHelperText>
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

export default EditWork;