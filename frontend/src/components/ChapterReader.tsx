import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box } from '@mui/material';

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

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/chapters/${id}`);
        setChapter(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChapter();
  }, [id]);

  if (!chapter) {
    return <Typography>Loading...</Typography>;
  }

  const isNovel = chapter.work.type === 'novel';

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
                src={`http://localhost:3000/uploads/${imageUrl}`}
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