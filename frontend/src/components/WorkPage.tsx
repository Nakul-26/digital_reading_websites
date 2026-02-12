import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Box,
  ListItemButton,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Stack,
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
  genres: string[];
  tags: string[];
  status: string;
  language: string;
  moderationStatus?: 'pending' | 'published' | 'rejected';
  isPublished: boolean;
  contentWarnings: string[];
}

interface IChapter {
  _id: string;
  chapterNumber: number;
  title: string;
  views: number;
}

const WorkPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [work, setWork] = useState<IWork | null>(null);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [loading, setLoading] = useState(true); // New combined loading state
  const [error, setError] = useState<string | null>(null); // New error state
  const [open, setOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<IChapter | null>(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [workRes, chaptersRes] = await Promise.all([
          api.get(`/api/works/${id}`),
          api.get(`/api/works/${id}/chapters`),
        ]);
        setWork(workRes.data);
        setChapters(chaptersRes.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load work data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleClickOpen = (chapter: IChapter) => {
    setSelectedChapter(chapter);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedChapter(null);
  };

  const handleDelete = async () => {
    if (selectedChapter) {
      try {
        await api.delete(`/api/chapters/${selectedChapter._id}`);
        setChapters(chapters.filter((chapter) => chapter._id !== selectedChapter._id));
        handleClose();
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to delete chapter.');
      }
    }
  };

  if (loading) {
    return <Typography>Loading work details...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!work) {
    // This case should ideally be covered by error handling or loading, but as a fallback
    return <Typography>Work not found.</Typography>;
  }

  const isAuthor =
    authContext?.user &&
    work.author &&
    authContext.user._id === work.author._id;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const moderationStatus = work.moderationStatus || (work.isPublished ? 'published' : 'pending');

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 4 }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: { xs: 400, md: 500 },
                objectFit: 'cover',
                borderRadius: 2,
              }}
              src={work.coverImageUrl ? `${apiUrl}/uploads/${work.coverImageUrl}` : 'https://via.placeholder.com/300x450'}
              alt={work.title}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {work.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              by {work.author.username}
            </Typography>
            <Typography variant="body1" paragraph sx={{ my: 2 }}>
              {work.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ alignSelf: 'center', mr: 1 }}>Genres:</Typography>
              {work.genres.map(genre => <Chip key={genre} label={genre} />)}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ alignSelf: 'center', mr: 1 }}>Tags:</Typography>
              {work.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
            </Box>
            <Typography variant="body2">Status: {work.status}</Typography>
            <Typography variant="body2">Language: {work.language}</Typography>
            <Typography variant="body2">Moderation: {moderationStatus}</Typography>
            {work.contentWarnings.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Content Warnings:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {work.contentWarnings.map(warning => <Chip key={warning} label={warning} color="warning" size="small" />)}
                </Box>
              </Box>
            )}
            {isAuthor && (
              <Button
                variant="contained"
                component={RouterLink}
                to={`/upload-chapter?workId=${work._id}`}
                sx={{ mt: 3 }}
              >
                Upload Chapter
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Box mt={5}>
        <Typography variant="h4" component="h2" gutterBottom>
          Chapters
        </Typography>

        <Paper>
          <List disablePadding>
            {chapters.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 3 }}>
                No chapters published yet.
              </Typography>
            ) : (
              chapters.map((chapter, index) => (
                <React.Fragment key={chapter._id}>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      isAuthor && (
                        <Stack direction="row" spacing={1}>
                          <IconButton edge="end" aria-label="edit" component={RouterLink} to={`/edit-chapter/${chapter._id}`}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleClickOpen(chapter)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      )
                    }
                  >
                    <ListItemButton
                      component={RouterLink}
                      to={`/chapters/${chapter._id}`}
                      sx={{
                        px: { xs: 2, md: 3 },
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={chapter.title}
                        secondary={`Chapter ${chapter.chapterNumber} | ${chapter.views || 0} views`}
                      />
                    </ListItemButton>
                  </ListItem>

                  {index < chapters.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Chapter?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this chapter? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkPage;
