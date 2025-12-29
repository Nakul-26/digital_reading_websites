import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
} from '@mui/material';

interface IWork {
  _id: string;
  title: string;
  type: 'manga' | 'novel' | 'comic';
  description?: string;
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

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        All Works
      </Typography>
      <Grid container spacing={3}>
        {works.map((work) => (
          <Grid item key={work._id} xs={12} sm={6} md={4}>
            <Card>
              <CardActionArea component={RouterLink} to={`/works/${work._id}`}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {work.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    by {work.author.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Type: {work.type}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {work.description?.substring(0, 100)}...
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;