import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const BackgroundContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 0
});

const PolygonShape = styled(Box)<{ rotation?: number; scale?: number; opacity?: number }>(
  ({ rotation = 0, scale = 1, opacity = 1 }) => ({
    position: 'absolute',
    width: '120vw',
    height: '120vh',
    opacity,
    transform: `rotate(${rotation}deg) scale(${scale})`,
    transformOrigin: 'center center',
    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 25%, #f5f5f5 50%, #f0f0f0 75%, #eeeeee 100%)',
    boxShadow: `
      inset 0 0 100px rgba(0, 0, 0, 0.02),
      inset 0 0 200px rgba(0, 0, 0, 0.01),
      0 0 50px rgba(255, 255, 255, 0.8)
    `,
    animation: 'float 20s ease-in-out infinite',
    '@keyframes float': {
      '0%, 100%': {
        transform: `rotate(${rotation}deg) scale(${scale}) translateY(0px)`
      },
      '50%': {
        transform: `rotate(${rotation}deg) scale(${scale}) translateY(-10px)`
      }
    }
  })
);

const SecondaryPolygon = styled(Box)<{ rotation?: number; delay?: number }>(
  ({ rotation = 0, delay = 0 }) => ({
    position: 'absolute',
    width: '80vw',
    height: '80vh',
    top: '10%',
    left: '10%',
    transform: `rotate(${rotation}deg)`,
    transformOrigin: 'center center',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
    background: 'linear-gradient(225deg, #fafafa 0%, #f8f8f8 30%, #f0f0f0 60%, #e8e8e8 100%)',
    boxShadow: `
      inset 0 0 80px rgba(0, 0, 0, 0.015),
      inset 20px 20px 60px rgba(0, 0, 0, 0.01),
      inset -20px -20px 60px rgba(255, 255, 255, 0.5)
    `,
    opacity: 0.7,
    animation: `floatReverse 25s ease-in-out infinite ${delay}s`,
    '@keyframes floatReverse': {
      '0%, 100%': {
        transform: `rotate(${rotation}deg) translateY(0px) translateX(0px)`
      },
      '33%': {
        transform: `rotate(${rotation}deg) translateY(5px) translateX(-5px)`
      },
      '66%': {
        transform: `rotate(${rotation}deg) translateY(-5px) translateX(5px)`
      }
    }
  })
);

const InnerPolygon = styled(Box)({
  position: 'absolute',
  width: '60vw',
  height: '60vh',
  top: '20%',
  left: '20%',
  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  background: 'radial-gradient(ellipse at center, #ffffff 0%, #fafafa 40%, #f5f5f5 70%, #f0f0f0 100%)',
  boxShadow: `
    inset 0 0 60px rgba(0, 0, 0, 0.02),
    inset 10px 10px 40px rgba(0, 0, 0, 0.008),
    inset -10px -10px 40px rgba(255, 255, 255, 0.6),
    0 0 30px rgba(255, 255, 255, 0.9)
  `,
  opacity: 0.8,
  animation: 'pulse 15s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': {
      transform: 'scale(1)',
      opacity: 0.8
    },
    '50%': {
      transform: 'scale(1.02)',
      opacity: 0.9
    }
  }
});

const AmbientGlow = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '150vw',
  height: '150vh',
  transform: 'translate(-50%, -50%)',
  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(250, 250, 250, 0.05) 30%, transparent 70%)',
  animation: 'glow 30s ease-in-out infinite',
  '@keyframes glow': {
    '0%, 100%': {
      opacity: 0.3
    },
    '50%': {
      opacity: 0.6
    }
  }
});

const PolygonBackground: React.FC = () => {
  return (
    <BackgroundContainer>
      <AmbientGlow />
      <PolygonShape rotation={15} scale={1.1} opacity={0.9} />
      <SecondaryPolygon rotation={-10} delay={0} />
      <SecondaryPolygon rotation={25} delay={5} />
      <InnerPolygon />
    </BackgroundContainer>
  );
};

export default PolygonBackground;