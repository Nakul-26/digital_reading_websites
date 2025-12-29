import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@mui/material';

interface IWork {
  _id: string;
  title: string;
  type: 'manga' | 'novel' | 'comic';
  description?: string;
  coverImage?: string;
  author: {
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

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/works/${id}`);
        setWork(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchChapters = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/works/${id}/chapters`);
        setChapters(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWork();
    fetchChapters();
  }, [id]);

  if (!work) {
    return <Typography>Loading...</Typography>;
  }

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
              src={work.coverImage ? `http://localhost:3000/uploads/${work.coverImage}` : 'https://via.placeholder.com/300x450'}
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
            <Button
              variant="contained"
              component={RouterLink}
              to={`/upload-chapter?workId=${work._id}`}
            >
              Upload Chapter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box mt={5}>
        <Typography variant="h4" component="h2" gutterBottom>
          Chapters
        </Typography>
        <Paper>
          <List>
            {chapters.map((chapter, index) => (
              <React.Fragment key={chapter._id}>
                <ListItem button component={RouterLink} to={`/chapters/${chapter._id}`}>
                  <ListItemText
                    primary={`Chapter ${chapter.chapterNumber}: ${chapter.title}`}
                  />
                </ListItem>
                {index < chapters.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default WorkPage;