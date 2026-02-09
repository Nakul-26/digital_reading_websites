import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Stack, Button, TextField, Divider } from '@mui/material';
import { api } from '../api';
import { AuthContext } from '../AuthContext';
import { INPUT_LIMITS } from '../constants/inputLimits';

interface IChapter {
  _id: string;
  chapterNumber: number;
  title: string;
  content: string | string[];
  work: {
    type: 'manga' | 'novel' | 'comic';
  };
  views: number;
  likes: string[];
  comments: {
    user: string;
    username: string;
    text: string;
    createdAt: string;
  }[];
}

const ChapterReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [chapter, setChapter] = useState<IChapter | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // New loading state
  const [error, setError] = useState<string | null>(null); // New error state
  const [actionError, setActionError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      setError(null);
      setActionError(null);
      try {
        const res = await api.get(`/api/chapters/${id}`);
        const chapterData = res.data as IChapter;
        setChapter(chapterData);
        setLikesCount(chapterData.likes?.length || 0);
        if (auth?.user?._id) {
          setLiked(chapterData.likes?.includes(auth.user._id) || false);
        } else {
          setLiked(false);
        }
        try {
          const viewRes = await api.post(`/api/chapters/${id}/view`);
          setChapter((prev) => (prev ? { ...prev, views: viewRes.data.views } : prev));
        } catch (viewErr) {
          console.error(viewErr);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load chapter.');
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [id, auth?.user?._id]);

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

  const handleToggleLike = async () => {
    if (!auth?.isAuthenticated) {
      setActionError('Please log in to like this chapter.');
      return;
    }
    try {
      setActionError(null);
      if (liked) {
        const res = await api.delete(`/api/chapters/${id}/like`);
        setLiked(false);
        setLikesCount(res.data.likesCount);
      } else {
        const res = await api.post(`/api/chapters/${id}/like`);
        setLiked(true);
        setLikesCount(res.data.likesCount);
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to update like.');
    }
  };

  const handleAddComment = async () => {
    if (!auth?.isAuthenticated) {
      setActionError('Please log in to comment.');
      return;
    }
    if (!commentText.trim()) {
      setActionError('Comment cannot be empty.');
      return;
    }
    try {
      setActionError(null);
      const res = await api.post(`/api/chapters/${id}/comments`, { text: commentText.trim() });
      setChapter((prev) => (prev ? { ...prev, comments: res.data } : prev));
      setCommentText('');
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to add comment.');
    }
  };

  return (
    <Container maxWidth={isNovel ? 'md' : 'lg'}>
      <Paper sx={{ p: { xs: 2, sm: 4, md: 6 }, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chapter {chapter.chapterNumber}: {chapter.title}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Views: {chapter.views || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Likes: {likesCount}
          </Typography>
          <Button variant={liked ? 'contained' : 'outlined'} onClick={handleToggleLike}>
            {liked ? 'Liked' : 'Like'}
          </Button>
        </Stack>
        {actionError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {actionError}
          </Typography>
        )}
        {isNovel && typeof chapter.content === 'string' ? (
          <Typography component="div" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
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
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" gutterBottom>
          Comments ({chapter.comments?.length || 0})
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label={auth?.isAuthenticated ? 'Add a comment' : 'Log in to comment'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!auth?.isAuthenticated}
            inputProps={{ maxLength: INPUT_LIMITS.chapterComment }}
          />
          <Button variant="contained" onClick={handleAddComment} disabled={!auth?.isAuthenticated}>
            Post
          </Button>
        </Stack>
        <Stack spacing={2}>
          {chapter.comments?.map((comment, index) => (
            <Box key={`${comment.user}-${comment.createdAt}-${index}`}>
              <Typography variant="subtitle2">{comment.username}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {comment.text}
              </Typography>
            </Box>
          ))}
          {(!chapter.comments || chapter.comments.length === 0) && (
            <Typography variant="body2" color="text.secondary">
              Be the first to comment.
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ChapterReader;
