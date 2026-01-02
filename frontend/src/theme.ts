import { alpha, createTheme, type Theme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark'): Theme => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        primary: {
          main: '#ffffff', // White
        },
        secondary: {
          main: '#000000', // Black
        },
        text: {
          primary: '#000000', // Black
          secondary: '#333333', // Dark Gray
        },
        background: {
          default: '#ffffff', // White
          paper: '#f5f5f5', // Light Gray
        },
      }
      : {
        primary: {
          main: '#000000', // Black
        },
        secondary: {
          main: '#ffffff', // White
        },
        text: {
          primary: '#ffffff', // White
          secondary: '#cccccc', // Light Gray
        },
        background: {
          default: '#000000', // Black
          paper: '#1a1a1a', // Dark Gray
        },
      }),
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.secondary.main,
          boxShadow: 'none',
          borderBottom: `2px solid ${theme.palette.divider}`,
        }),
      },
    },

    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${alpha(theme.palette.text.secondary, 0.25)}`,
          },
        }),
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
        },
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? '#333333' : '#cccccc', // Slightly darker/lighter secondary on hover
            boxShadow: `0 0 8px ${alpha(theme.palette.text.secondary, 0.4)}`,
          },
        }),
      },
    },

    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: theme.palette.text.secondary,
          },
        }),
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& input': {
              color: theme.palette.text.primary, // Set default text color
            },
            '& fieldset': {
              borderColor: alpha(theme.palette.text.primary, 0.3),
            },
            '&:hover fieldset': {
              borderColor: theme.palette.text.secondary,
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`, // Set background to paper color
              WebkitTextFillColor: theme.palette.text.primary, // Set text color to primary
              caretColor: theme.palette.text.primary, // Set caret color
              transition: 'background-color 50000s ease-in-out 0s', // Prevent transition
            },
            '& input:-webkit-autofill:hover': {
              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
              WebkitTextFillColor: theme.palette.text.primary,
              caretColor: theme.palette.text.primary,
            },
            '& input:-webkit-autofill:focus': {
              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
              WebkitTextFillColor: theme.palette.text.primary,
              caretColor: theme.palette.text.primary,
            },
            '& input:-webkit-autofill:active': {
              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
              WebkitTextFillColor: theme.palette.text.primary,
              caretColor: theme.palette.text.primary,
            },

          },
        }),
      },
    },
  },
});

export { getTheme };
