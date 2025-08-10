import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { generateRandomPolygonConfig, generateRandomGradient, generateConcentricClipPaths, PolygonConfig } from '../../utils/polygonGenerator';

const BackgroundContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 0
});

// Centered, concentric polygon layer for subtle inner-room look
const RoomLayer = styled(Box)<{ 
  clipPath: string; 
  depth: number; 
  gradient: string; 
}>(({ clipPath, depth, gradient, theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '120vmin',
  height: '120vmin',
  transform: `translate(-50%, -50%) scale(${1 - depth * 0.015})`,
  transformOrigin: 'center center',
  clipPath,
  background: gradient,
  // Soft inner-room feel via balanced inner shadows
  boxShadow: `
    inset 0 0 ${60 - depth * 6}px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'},
    inset ${24 - depth * 2}px ${24 - depth * 2}px ${80 - depth * 8}px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'},
    inset ${-28 + depth * 2}px ${-28 + depth * 2}px ${90 - depth * 8}px ${theme.palette.mode === 'dark' ? 'rgba(120,120,120,0.2)' : 'rgba(255,255,255,0.7)'}
  `,
  opacity: 0.85 - depth * 0.1,
}));

const AmbientGlow = styled(Box)<{ intensity: number }>(({ intensity, theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '150vw',
  height: '150vh',
  transform: 'translate(-50%, -50%)',
  background: theme.palette.mode === 'dark' 
    ? `radial-gradient(circle, rgba(100, 100, 100, ${0.05 * intensity}) 0%, rgba(80, 80, 80, ${0.02 * intensity}) 30%, transparent 70%)`
    : `radial-gradient(circle, rgba(255, 255, 255, ${0.1 * intensity}) 0%, rgba(250, 250, 250, ${0.05 * intensity}) 30%, transparent 70%)`,
  animation: `glow ${30 + Math.random() * 10}s ease-in-out infinite`,
  '@keyframes glow': {
    '0%, 100%': {
      opacity: 0.3
    },
    '50%': {
      opacity: 0.6
    }
  }
}));

const PolygonBackground: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [polygonConfigs, setPolygonConfigs] = useState<{
    primary: PolygonConfig;
  } | null>(null);

  const [gradients, setGradients] = useState<{
    base: string;
  } | null>(null);

  const [glowIntensity, setGlowIntensity] = useState(1);

  useEffect(() => {
    // Generate random configurations on component mount
    setPolygonConfigs({
      primary: generateRandomPolygonConfig('primary'),
    });

    setGlowIntensity(0.8 + Math.random() * 0.4); // Random intensity between 0.8 and 1.2
  }, []);
  
  useEffect(() => {
    // Regenerate gradients when theme changes
    setGradients({
      base: generateRandomGradient(isDark),
    });
  }, [isDark]);

  if (!polygonConfigs || !gradients) {
    return null; // Don't render until configs are generated
  }

  // Build concentric layers from a single base shape for a "room" feel
  const basePoints = polygonConfigs.primary.basePoints;
  const clips = generateConcentricClipPaths(basePoints, 5, 4, 0.09);

  return (
    <BackgroundContainer>
      <AmbientGlow intensity={glowIntensity} />
      {clips.map((clip, i) => (
        <RoomLayer key={i} clipPath={clip} depth={i} gradient={gradients.base} />
      ))}
    </BackgroundContainer>
  );
};

export default PolygonBackground;