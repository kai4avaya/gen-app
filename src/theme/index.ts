import { createTheme, PaletteMode } from '@mui/material/styles';

export const createAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#333333' : '#ffffff',
      contrastText: mode === 'light' ? '#ffffff' : '#000000'
    },
    background: {
      default: mode === 'light' ? '#fafafa' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e'
    },
    text: {
      primary: mode === 'light' ? '#333333' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#aaaaaa'
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

const theme = createAppTheme('light');
export default theme;