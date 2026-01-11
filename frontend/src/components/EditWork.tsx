import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const res = await api.get(`/api/works/${id}`);
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
      } catch (err) {
        console.error(err);
      }
    };
    fetchWork();
  }, [id]);

  const { title, description, genres, tags, status, language, isPublished, contentWarnings } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSelectChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const onSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const workData = {
        ...formData,
        genres: genres.split(',').map(g => g.trim()),
        tags: tags.split(',').map(t => t.trim()),
        contentWarnings: contentWarnings.split(',').map(cw => cw.trim()),
      };
      await api.put(`/api/works/${id}`, workData);
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
                    />        <FormHelperText>If published, the work will be visible to all users.</FormHelperText>
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