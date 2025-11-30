// src/theme.js
import { createTheme } from '@mui/material/styles';

// Корпоративная палитра (Jira-style)
export const corporateTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0747A6', // Синий Atlassian
      light: '#0052CC',
      dark: '#042E5C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5243AA', // Фиолетовый
      light: '#6554C0',
      dark: '#403294',
    },
    error: {
      main: '#DE350B',
      light: '#FF5630',
      dark: '#BF2600',
    },
    warning: {
      main: '#FF991F',
      light: '#FFAB00',
      dark: '#FF8B00',
    },
    success: {
      main: '#00875A',
      light: '#36B37E',
      dark: '#006644',
    },
    info: {
      main: '#0065FF',
      light: '#4C9AFF',
      dark: '#0052CC',
    },
    background: {
      default: '#F4F5F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#172B4D',
      secondary: '#5E6C84',
      disabled: '#A5ADBA',
    },
    divider: '#DFE1E6',
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: '#172B4D',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#172B4D',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#172B4D',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#172B4D',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#172B4D',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#172B4D',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#172B4D',
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      color: '#5E6C84',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 3, // Меньше скругления для корпоративного стиля
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 3,
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 1px rgba(9,30,66,.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          boxShadow: '0 1px 1px rgba(9,30,66,.25), 0 0 1px rgba(9,30,66,.31)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 1px rgba(9,30,66,.25), 0 0 1px rgba(9,30,66,.31)',
        },
        elevation2: {
          boxShadow: '0 2px 4px rgba(9,30,66,.25), 0 0 1px rgba(9,30,66,.31)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 0 rgba(9,30,66,.25)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          fontWeight: 500,
        },
      },
    },
  },
});

export default corporateTheme;