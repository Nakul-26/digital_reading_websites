import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormHelperText,
} from '@mui/material';
import { api } from '../api';

const UploadChapter: React.FC = () => {
  const [formData, setFormData] = useState({
    chapterNumber: 1,
    title: '',
    content: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState<string>('');
  const location = useLocation();
  const [workId, setWorkId] = useState<string | null>(null);
  const [workType, setWorkType] = useState<'novel' | 'manga' | 'comic' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('workId');
    if (id) {
      setWorkId(id);
      // Fetch work type to conditionally show content/upload field
      api.get(`/api/works/${id}`)
        .then(res => setWorkType(res.data.type))
        .catch(err => console.error('Failed to fetch work type', err));
    }
  }, [location]);

  const { chapterNumber, title, content } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workId) {
      setMessage('Work ID is missing.');
      return;
    }

    let chapterContent: string | string[] = content;

    if (workType !== 'novel' && files) {
        const uploadedFiles = new FormData();
        for (let i = 0; i < files.length; i++) {
            uploadedFiles.append('files', files[i]);
        }
        try {
            const res = await api.post('/api/upload-multiple', uploadedFiles, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            chapterContent = res.data.filenames;
        } catch (err) {
            console.error(err);
            setMessage('File upload failed.');
            return;
        }
    }


    const chapterData = {
      ...formData,
      content: chapterContent,
    };

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };
      const res = await api.post(
        `/api/works/${workId}/chapters`,
        chapterData,
        config
      );
      console.log(res.data);
      setMessage('Chapter uploaded successfully!');
    } catch (err: any) {
      console.error(err.response.data);
      setMessage('Failed to upload chapter.');
    }
  };

  if (!workId) {
    return <Typography sx={{ mt: 4 }}>Work not specified.</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload New Chapter
        </Typography>
        <TextField
          label="Chapter Number"
          name="chapterNumber"
          type="number"
          value={chapterNumber}
          onChange={onChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Title"
          name="title"
          value={title}
          onChange={onChange}
          fullWidth
          required
          margin="normal"
        />
        {workType === 'novel' ? (
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
        ) : (
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" component="label">
              Upload Chapter Pages
              <input type="file" hidden multiple onChange={onFileChange} />
            </Button>
            {files && <Typography sx={{ mt: 1 }}>{files.length} files selected</Typography>}
          </Box>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
        >
          Create Chapter
        </Button>
        {message && <FormHelperText sx={{ mt: 2 }}>{message}</FormHelperText>}
      </Box>
    </Container>
  );
};

export default UploadChapter;
