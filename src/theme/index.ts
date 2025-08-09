import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#333333',
      contrastText: '#ffffff'
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#f0f0f0',
      300: '#eeeeee',
      400: '#e8e8e8',
      500: '#e0e0e0',
      600: '#d5d5d5',
      700: '#cccccc',
      800: '#999999',
      900: '#666666'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
      lineHeight: 1.3
    },
    body1: {
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.6
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5
    }
  },
  shape: {
    borderRadius: 8
  }
});

export default theme;