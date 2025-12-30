import { alpha, createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,

    ...(mode === 'light'
      ? {
          primary: {
            main: '#007bff', // A standard, clear blue
          },
          secondary: {
            main: '#6c757d', // A neutral secondary color
          },
          background: {
            default: '#f8f9fa', // A very light grey
            paper: '#ffffff',
          },
          text: {
            primary: '#212529',
            secondary: '#6c757d',
          },
        }
      : {
          primary: {
            main: '#58a6ff', // A lighter blue for dark mode
          },
          secondary: {
            main: '#8b949e',
          },
          background: {
            default: '#0f1827ff', // GitHub dark mode background
            paper: '#1f2e44ff',   // GitHub dark mode paper
          },
          text: {
            primary: '#c9d1d9',
            secondary: '#8b949e',
          },
        }),
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',

    h1: { fontSize: '2.25rem', fontWeight: 500 },
    h2: { fontSize: '2rem', fontWeight: 500 },
    h3: { fontSize: '1.75rem', fontWeight: 500 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
  },

  shape: {
    borderRadius: 6, // Standard GitHub border radius
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          transition: 'background-color 0.2s ease, color 0.2s ease',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          color: theme.palette.text.primary,
        }),
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          transition:
            'background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        },
      },
    },

    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }),
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }),
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: theme.palette.divider,
            },
            '&:hover fieldset': {
              borderColor: alpha(theme.palette.text.primary, 0.5),
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
        }),
      },
    },
  },
});

export default getTheme;
