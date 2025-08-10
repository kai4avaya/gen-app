import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createAppTheme } from './theme';
import MainContainer from './components/MainContainer/MainContainer';

const createEmotionCache = () => {
  return createCache({
    key: 'mui',
    prepend: true,
  });
};

const emotionCache = createEmotionCache();

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const theme = createAppTheme(isDarkMode ? 'dark' : 'light')

  const handleThemeChange = (isDark: boolean) => {
    setIsDarkMode(isDark)
  }

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MainContainer onThemeChange={handleThemeChange} />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;