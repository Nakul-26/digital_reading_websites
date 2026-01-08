import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  CardMedia,
} from '@mui/material';
import { api } from '../api';

interface IWork {
  _id: string;
  title: string;
  type: 'manga' | 'novel' | 'comic';
  description?: string;
  coverImageUrl?: string;
  author: {
    username: string;
  };
}

const Home: React.FC = () => {
  const [works, setWorks] = useState<IWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const res = await api.get('/api/works');
        setWorks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  if (loading) {
    return <Typography>Loading works...</Typography>;
  }

  if (works.length === 0) {
    return <Typography>No works published yet.</Typography>;
  }

  const featuredWork = works.length > 0 ? works[0] : null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Novel Website
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover, read, and share amazing stories from around the world.
        </Typography>
      </Box>

      {/* Featured Work */}
      {featuredWork && (
        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Featured Work
          </Typography>
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
            <CardActionArea
              component={RouterLink}
              to={`/works/${featuredWork._id}`}
              sx={{ borderRadius: '16px' }}
            >
              <Grid container>
                <Grid xs={12} md={4}>
                  <CardMedia
                    component="img"
                    sx={{
                      width: '100%',
                      height: 300,
                      objectFit: 'cover',
                      borderTopLeftRadius: '16px',
                      borderBottomLeftRadius: { xs: 0, md: '16px' },
                      borderTopRightRadius: { xs: '16px', md: 0 },
                    }}
                    image={
                      featuredWork.coverImageUrl
                        ? `${apiUrl}/uploads/${featuredWork.coverImageUrl}`
                        : 'https://via.placeholder.com/400x600'
                    }
                    alt={featuredWork.title}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography gutterBottom variant="h4" component="div">
                      {featuredWork.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      by {featuredWork.author.username}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
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
              <CardActionArea
                component={RouterLink}
                to={`/works/${work._id}`}
                sx={{ borderRadius: '16px' }}
              >
                <CardMedia
                  component="img"
                  sx={{ height: 200, objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                  image={
                    work.coverImageUrl
                      ? `${apiUrl}/uploads/${work.coverImageUrl}`
                      : 'https://via.placeholder.com/200x300'
                  }
                  alt={work.title}
                />
                <CardContent sx={{ p: 2 }}>
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
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
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
