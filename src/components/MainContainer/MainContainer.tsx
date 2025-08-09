import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import TypingEffect from '../TypingEffect/TypingEffect';
import PolygonBackground from '../PolygonBackground/PolygonBackground';

const AppContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#fafafa',
  cursor: 'text',
  position: 'relative',
  overflow: 'hidden'
}));

const ContentWrapper = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  position: 'relative'
}));

const ClickOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  cursor: 'text'
});

const MainContainer: React.FC = () => {
  const [showTyping, setShowTyping] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);

  const handleClick = () => {
    if (typingComplete) {
      // Here you could add functionality to start a text editor or input field
      console.log('Starting typing mode...');
    }
  };

  const handleTypingComplete = () => {
    setTypingComplete(true);
  };

  return (
    <AppContainer onClick={handleClick}>
      <PolygonBackground />
      <ContentWrapper>
        {showTyping && (
          <TypingEffect 
            text="click anywhere and start typing"
            speed={80}
            onComplete={handleTypingComplete}
          />
        )}
        <ClickOverlay />
      </ContentWrapper>
    </AppContainer>
  );
};

export default MainContainer;