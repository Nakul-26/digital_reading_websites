import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

const UploadChapter: React.FC = () => {
  const [formData, setFormData] = useState({
    chapterNumber: 1,
    title: '',
    content: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [loadingFetchWorkType, setLoadingFetchWorkType] = useState(true); // New loading state
  const [errorFetchWorkType, setErrorFetchWorkType] = useState<string | null>(null); // New error state
  const [loadingSubmit, setLoadingSubmit] = useState(false); // New loading state for submission
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New success message state
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New error message state
  const location = useLocation();
  const [workId, setWorkId] = useState<string | null>(null);
  const [workType, setWorkType] = useState<'novel' | 'manga' | 'comic' | null>(null);

  const resetMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('workId');
    if (id) {
      setWorkId(id);
      setLoadingFetchWorkType(true);
      setErrorFetchWorkType(null);
      // Fetch work type to conditionally show content/upload field
      api.get(`/api/works/${id}`)
        .then(res => {
          setWorkType(res.data.type);
          setLoadingFetchWorkType(false);
        })
        .catch((err: any) => {
          console.error('Failed to fetch work type', err);
          setErrorFetchWorkType(err.response?.data?.message || 'Failed to fetch work type.');
          setLoadingFetchWorkType(false);
        });
    } else {
        setLoadingFetchWorkType(false); // No workId, so no need to fetch
        setErrorFetchWorkType('Work ID is missing in URL.');
    }
  }, [location]);

  const { chapterNumber, title, content } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    resetMessages();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    resetMessages();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);
    resetMessages();

    if (!workId) {
      setErrorMessage('Work ID is missing.');
      setLoadingSubmit(false);
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
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
              setErrorMessage(err.response?.data?.message || 'File upload failed.');
            } else {
              setErrorMessage('An unexpected error occurred during file upload.');
            }
            setLoadingSubmit(false);
            return;
        }
    }


    const chapterData = {
      ...formData,
      content: chapterContent,
    };

    try {
      await api.post(
        `/api/works/${workId}/chapters`,
        chapterData
      );
      setSuccessMessage('Chapter uploaded successfully!');
      setFormData({ // Optionally reset form data on success
        chapterNumber: 1, title: '', content: '',
      });
      setFiles(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || 'Failed to upload chapter.');
      } else {
        setErrorMessage('An unexpected error occurred during chapter upload.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetchWorkType) {
    return <Typography>Loading work details...</Typography>;
  }

  if (errorFetchWorkType) {
    return <Typography color="error">Error: {errorFetchWorkType}</Typography>;
  }

  if (!workId) {
    return <Typography sx={{ mt: 4 }}>Work not specified. Please navigate from a work page.</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload New Chapter
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
          label="Chapter Number"
          name="chapterNumber"
          type="number"
          value={chapterNumber}
          onChange={onChange}
          fullWidth
          required
          margin="normal"
          disabled={loadingSubmit}
          inputProps={{
            min: INPUT_LIMITS.chapterNumberMin,
            max: INPUT_LIMITS.chapterNumberMax,
            step: 1,
          }}
        />
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
            disabled={loadingSubmit}
            inputProps={{ maxLength: INPUT_LIMITS.chapterContent }}
          />
        ) : (
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" component="label" disabled={loadingSubmit}>
              Upload Chapter Pages
              <input type="file" hidden multiple onChange={onFileChange} disabled={loadingSubmit} />
            </Button>
            {files && <Typography sx={{ mt: 1 }}>{files.length} files selected</Typography>}
          </Box>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? 'Creating Chapter...' : 'Create Chapter'}
        </Button>
      </Box>
    </Container>
  );
};

export default UploadChapter;
