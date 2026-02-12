import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  CardMedia,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CardHeader,
  IconButton,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../AuthContext';
import { api } from '../api';

interface IWork {
  _id: string;
  title: string;
  type: 'manga' | 'novel' | 'comic';
  description?: string;
  coverImageUrl?: string;
  author: {
    _id: string;
    username: string;
  };
  status: string;
  moderationStatus?: 'pending' | 'published' | 'rejected';
  isPublished: boolean;
}

const MyWorks: React.FC = () => {
  const [works, setWorks] = useState<IWork[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(true); // New loading state for fetching works
  const [errorWorks, setErrorWorks] = useState<string | null>(null); // New error state for fetching works
  const [loadingDelete, setLoadingDelete] = useState(false); // New loading state for delete operation
  const [errorDelete, setErrorDelete] = useState<string | null>(null); // New error state for delete operation
  const [open, setOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<IWork | null>(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchWorks = async () => {
      setLoadingWorks(true);
      setErrorWorks(null);
      try {
        const res = await api.get('/api/works/my-works');
        setWorks(res.data);
      } catch (err: any) {
        console.error(err);
        setErrorWorks(err.response?.data?.message || 'Failed to load your works.');
      } finally {
        setLoadingWorks(false);
      }
    };
    fetchWorks();
  }, []);

  const handleClickOpen = (work: IWork) => {
    setSelectedWork(work);
    setOpen(true);
    setErrorDelete(null); // Clear previous delete errors
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWork(null);
  };

  const handleDelete = async () => {
    if (selectedWork) {
      setLoadingDelete(true); // Set loading for delete
      setErrorDelete(null);
      try {
        await api.delete(`/api/works/${selectedWork._id}`);
        setWorks(works.filter((work) => work._id !== selectedWork._id));
        handleClose();
      } catch (err: any) {
        console.error(err);
        setErrorDelete(err.response?.data?.message || 'Failed to delete work.');
      } finally {
        setLoadingDelete(false); // Clear loading for delete
      }
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const getModerationStatus = (work: IWork) => work.moderationStatus || (work.isPublished ? 'published' : 'pending');

  if (loadingWorks) {
    return <Typography>Loading your works...</Typography>;
  }

  if (errorWorks) {
    return <Typography color="error">Error: {errorWorks}</Typography>;
  }

  if (works.length === 0) {
    return (
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          My Works
        </Typography>
        <Typography>You haven't created any works yet.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        My Works
      </Typography>
      {errorDelete && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorDelete}
        </Typography>
      )}
      <Grid container spacing={3}>
        {works.map((work) => {
          const isAuthor = authContext?.user?._id === work.author._id;
          return (
            <Grid key={work._id} item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  minWidth: 275,
                  borderRadius: '16px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardHeader
                  action={
                    isAuthor && (
                      <>
                        <IconButton aria-label="edit" component={RouterLink} to={`/edit-work/${work._id}`}>
                          <EditIcon />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => handleClickOpen(work)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )
                  }
                  title={work.title}
                  subheader={`by ${work.author.username}`}
                />
                <CardActionArea
                  component={RouterLink}
                  to={`/works/${work._id}`}
                  sx={{ borderRadius: '16px' }}
                >
                  <CardMedia
                    component="img"
                    sx={{ height: 200, objectFit: 'cover' }}
                    image={
                      work.coverImageUrl
                        ? `${apiUrl}/uploads/${work.coverImageUrl}`
                        : 'https://via.placeholder.com/200x300'
                    }
                    alt={work.title}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {work.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Chip label={work.status} size="small" />
                      <Chip
                        label={getModerationStatus(work)}
                        size="small"
                        color={getModerationStatus(work) === 'published' ? 'success' : getModerationStatus(work) === 'rejected' ? 'error' : 'warning'}
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Work?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this work? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyWorks;
