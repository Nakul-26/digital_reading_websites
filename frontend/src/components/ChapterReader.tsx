import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box } from '@mui/material';
import { api } from '../api';

interface IChapter {
  _id: string;
  chapterNumber: number;
  title: string;
  content: string | string[];
  work: {
    type: 'manga' | 'novel' | 'comic';
  };
}

const ChapterReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [chapter, setChapter] = useState<IChapter | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // New loading state
  const [error, setError] = useState<string | null>(null); // New error state

  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/chapters/${id}`);
        setChapter(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load chapter.');
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [id]);

  if (loading) {
    return <Typography>Loading chapter...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!chapter) {
    // This case should ideally be covered by error handling or loading, but as a fallback
    return <Typography>Chapter not found.</Typography>;
  }

  const isNovel = chapter.work.type === 'novel';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <Container maxWidth={isNovel ? 'md' : 'lg'}>
      <Paper sx={{ p: { xs: 2, sm: 4, md: 6 }, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chapter {chapter.chapterNumber}: {chapter.title}
        </Typography>
        {isNovel && typeof chapter.content === 'string' ? (
          <Typography component="div" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.1rem' }}>
            {chapter.content}
          </Typography>
        ) : (
          <Box>
            {Array.isArray(chapter.content) && chapter.content.map((imageUrl, index) => (
              <Box
                key={index}
                component="img"
                src={`${apiUrl}/uploads/${imageUrl}`}
                alt={`Page ${index + 1}`}
                sx={{
                  display: 'block',
                  maxWidth: '100%',
                  mx: 'auto',
                  mb: 1,
                }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ChapterReader;
