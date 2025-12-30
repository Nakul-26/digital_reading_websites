import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  CardMedia,
  Paper,
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

const Home: React.FC = () => {
  const [works, setWorks] = useState<IWork[]>([]);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/works');
        setWorks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWorks();
  }, []);

  const featuredWork = works.length > 0 ? works[0] : null;

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Novel Website
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover, read, and share amazing stories from around the world.
        </Typography>
      </Paper>

      {/* Featured Work */}
      {featuredWork && (
        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Featured Work
          </Typography>
          <Card raised>
            <CardActionArea component={RouterLink} to={`/works/${featuredWork._id}`}>
              <Grid container>
                <Grid item xs={12} md={4}>
                  <CardMedia
                    component="img"
                    sx={{
                      width: '100%',
                      height: 300,
                      objectFit: 'cover',
                    }}
                    image={
                      featuredWork.coverImage
                        ? `http://localhost:3000/uploads/${featuredWork.coverImage}`
                        : 'https://via.placeholder.com/400x600'
                    }
                    alt={featuredWork.title}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <CardContent>
                    <Typography gutterBottom variant="h4" component="div">
                      {featuredWork.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      by {featuredWork.author.username}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }} noWrap>
                      {featuredWork.description}
                    </Typography>
                  </CardContent>
                </Grid>
              </Grid>
            </CardActionArea>
          </Card>
        </Box>
      )}

      {/* All Works */}
      <Typography variant="h4" component="h2" gutterBottom>
        All Works
      </Typography>
      <Grid container spacing={3}>
        {works.slice(1).map((work) => (
          <Grid item key={work._id} xs={12} sm={6} md={4} lg={3}>
            <Card raised>
              <CardActionArea component={RouterLink} to={`/works/${work._id}`}>
                <CardMedia
                  component="img"
                  sx={{ height: 200, objectFit: 'cover' }}
                  image={
                    work.coverImage
                      ? `http://localhost:3000/uploads/${work.coverImage}`
                      : 'https://via.placeholder.com/200x300'
                  }
                  alt={work.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {work.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    by {work.author.username}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {work.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;