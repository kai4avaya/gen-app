import React from 'react';
import { useTheme } from '@mui/material';
import styled, { keyframes } from 'styled-components';

// Amorphous blob animation
const morph = keyframes`
  0% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
  25% {
    border-radius: 50% 50% 30% 70% / 70% 30% 70% 30%;
  }
  50% {
    border-radius: 30% 30% 70% 70% / 50% 50% 50% 50%;
  }
  75% {
    border-radius: 70% 30% 50% 50% / 30% 70% 30% 70%;
  }
  100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
`;

const Blob = styled.div<{ $isLight: boolean }>`
  width: 20px;
  height: 20px;
  background: ${({ $isLight }) => ($isLight ? '#333333' : '#ffffff')};
  animation: ${morph} 2s ease-in-out infinite both;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  position: absolute;
  bottom: 5px;
  right: 5px;
  z-index: 10;
`;

interface AILoaderProps {
  visible: boolean;
}

const AILoader: React.FC<AILoaderProps> = ({ visible }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  
  if (!visible) return null;
  
  return <Blob $isLight={isLight} />;
};

export default AILoader;
