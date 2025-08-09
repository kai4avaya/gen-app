import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const TypingText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Inter", sans-serif',
  fontSize: '1.5rem',
  fontWeight: 300,
  color: theme.palette.text.primary,
  letterSpacing: '0.02em',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  zIndex: 10,
  '&::after': {
    content: '"|"',
    animation: 'blink 1s infinite',
    marginLeft: '2px'
  },
  '@keyframes blink': {
    '0%, 50%': {
      opacity: 1
    },
    '51%, 100%': {
      opacity: 0
    }
  }
}));

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ 
  text, 
  speed = 100, 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <TypingText variant="h2">
      {displayedText}
    </TypingText>
  );
};

export default TypingEffect;