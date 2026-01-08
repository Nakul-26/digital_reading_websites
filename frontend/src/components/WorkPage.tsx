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
}

interface IChapter {
  _id: string;
  chapterNumber: number;
  title: string;
}

const WorkPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [work, setWork] = useState<IWork | null>(null);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<IChapter | null>(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const res = await api.get(`/api/works/${id}`);
        setWork(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchChapters = async () => {
      try {
        const res = await api.get(`/api/works/${id}/chapters`);
        setChapters(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWork();
    fetchChapters();
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
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!work) {
    return <Typography>Loading...</Typography>;
  }

  const isAuthor =
    authContext?.user &&
    work.author &&
    authContext.user._id === work.author._id;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <Container>
      <Paper sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 500,
                objectFit: 'cover',
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
            <Typography variant="body1" paragraph>
              {work.description}
            </Typography>
            {isAuthor && (
              <Button
                variant="contained"
                component={RouterLink}
                to={`/upload-chapter?workId=${work._id}`}
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
            {chapters.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 3 }}>
                No chapters published yet.
              </Typography>
            )}
            {chapters.map((chapter, index) => (
              <React.Fragment key={chapter._id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    isAuthor && (
                      <>
                        <IconButton edge="end" aria-label="edit" component={RouterLink} to={`/edit-chapter/${chapter._id}`}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleClickOpen(chapter)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )
                  }
                >
                  <ListItemButton
                    component={RouterLink}
                    to={`/chapters/${chapter._id}`}
                    sx={{
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={chapter.title}
                      secondary={`Chapter ${chapter.chapterNumber}`}
                    />
                  </ListItemButton>
                </ListItem>

                {index < chapters.length - 1 && <Divider />}
              </React.Fragment>
            ))}
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