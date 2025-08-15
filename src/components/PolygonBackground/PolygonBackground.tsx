import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { generateRandomPolygonConfig, generateRandomGradient, PolygonConfig } from '../../utils/polygonGenerator';

// Use the provided design photo as a subtle base layer. Import via URL so Vite copies it.
const innerRoomUrl = new URL('../../../DESIGN_DOCS/inner-room.jpg', import.meta.url).href;

const BackgroundContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 0
});

// Backdrop photo with gentle tone mapping so it reads like a soft interior
const PhotoBackdrop = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: `url(${innerRoomUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: '55% 45%',
  // keep it subtle and let overlays dictate the mood
  opacity: theme.palette.mode === 'dark' ? 0.22 : 0.45,
  filter: theme.palette.mode === 'dark'
    ? 'brightness(0.55) contrast(1.06) saturate(0.9)'
    : 'brightness(1.05) contrast(0.95) saturate(0.8)',
  transform: 'scale(1.05)',
  willChange: 'transform, opacity',
}));

// Vignette to push darkest tones to the edges, like a room corner fade
const Vignette = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(120vw 80vh at 55% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.18) 100%)'
    : 'radial-gradient(120vw 80vh at 55% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.0) 55%, rgba(0,0,0,0.08) 100%)',
}));

const PolygonShape = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'config' && prop !== 'gradient' && prop !== 'animationType',
})<{
  config: PolygonConfig;
  gradient: string;
  animationType: string;
}>(({ theme, config, gradient, animationType }) => ({
  position: 'absolute',
  width: '120vw',
  height: '120vh',
  top: config.position.top,
  left: config.position.left,
  opacity: config.opacity,
  // center the shape on provided position (which is around 50% + offset) and hint perspective
  transform: `translate(-50%, -50%) perspective(800px) rotateX(2deg) rotateY(-3deg) rotate(${config.rotation}deg) scale(${config.scale})`,
  transformOrigin: 'center center',
  clipPath: config.clipPath,
  // Add right-side highlight layers above the base gradient to simulate strong light source
  background: [
    // thin bright rim at the far right
    `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 75%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.65)'} 95%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.65)'} 100%)`,
    // broader glow bleeding toward center from the right wall
    `radial-gradient(80% 100% at 95% 50%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.45)'} 0%, rgba(255,255,255,0) 60%)`,
    gradient
  ].join(', '),
  boxShadow: `
    inset 60px 70px 120px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)'},
    inset -110px 0px 160px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.75)'},
    inset -80px -60px 140px ${theme.palette.mode === 'dark' ? 'rgba(90,90,90,0.18)' : 'rgba(255,255,255,0.55)'},
    inset 0 0 100px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'}
  `,
  animation: `${animationType} ${20 + Math.random() * 10}s ease-in-out infinite ${config.animationDelay}s`,
  '@keyframes float': {
    '0%, 100%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(2deg) rotateY(-3deg) rotate(${config.rotation}deg) scale(${config.scale}) translateY(0px)`
    },
    '50%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(2deg) rotateY(-3deg) rotate(${config.rotation}deg) scale(${config.scale}) translateY(-10px)`
    }
  },
  '@keyframes floatReverse': {
    '0%, 100%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(2deg) rotateY(-3deg) rotate(${config.rotation}deg) scale(${config.scale}) translateY(0px) translateX(0px)`
    },
    '33%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(2deg) rotateY(-3deg) rotate(${config.rotation}deg) scale(${config.scale}) translateY(5px) translateX(-5px)`
    },
    '66%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(2deg) rotateY(-3deg) rotate(${config.rotation}deg) scale(${config.scale}) translateY(-5px) translateX(5px)`
    }
  },
  '@keyframes pulse': {
    '0%, 100%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(2deg) rotateY(-3deg) rotate(${config.rotation}deg) scale(${config.scale})`,
      opacity: config.opacity
    },
    '50%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(2deg) rotateY(-3deg) rotate(${config.rotation}deg) scale(${(config.scale * 1.02)})`,
      opacity: Math.min(1, config.opacity + 0.1)
    }
  }
}));

const SecondaryPolygon = styled(Box)<{ 
  config: PolygonConfig; 
  gradient: string;
}>(({ theme, config, gradient }) => ({
  position: 'absolute',
  width: '80vw',
  height: '80vh',
  top: config.position.top,
  left: config.position.left,
  transform: `translate(-50%, -50%) perspective(800px) rotateX(1.5deg) rotateY(-2deg) rotate(${config.rotation}deg) scale(${config.scale})`,
  transformOrigin: 'center center',
  clipPath: config.clipPath,
  background: [
    `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 78%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.38)'} 98%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.38)'} 100%)`,
    gradient
  ].join(', '),
  boxShadow: `
    inset 40px 50px 90px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'},
    inset -70px 0px 110px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.48)'},
    inset -50px -40px 100px ${theme.palette.mode === 'dark' ? 'rgba(100,100,100,0.22)' : 'rgba(255,255,255,0.5)'}
  `,
  opacity: config.opacity,
  animation: `floatReverse ${25 + Math.random() * 10}s ease-in-out infinite ${config.animationDelay}s`,
  '@keyframes floatReverse': {
    '0%, 100%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(1.5deg) rotateY(-2deg) rotate(${config.rotation}deg) scale(${config.scale}) translateY(0px) translateX(0px)`
    },
    '33%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(1.5deg) rotateY(-2deg) rotate(${config.rotation}deg) scale(${config.scale}) translateY(5px) translateX(-5px)`
    },
    '66%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(1.5deg) rotateY(-2deg) rotate(${config.rotation}deg) scale(${config.scale}) translateY(-5px) translateX(5px)`
    }
  }
}));

const InnerPolygon = styled(Box)<{ 
  config: PolygonConfig; 
  gradient: string;
}>(({ theme, config, gradient }) => ({
  position: 'absolute',
  width: '60vw',
  height: '60vh',
  top: config.position.top,
  left: config.position.left,
  clipPath: config.clipPath,
  background: [
    `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 70%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)'} 92%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)'} 100%)`,
    `radial-gradient(70% 100% at 92% 50%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)'} 0%, rgba(255,255,255,0) 55%)`,
    gradient
  ].join(', '),
  boxShadow: `
    inset 20px 28px 55px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.025)'},
    inset -68px 0px 85px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.95)'},
    inset -28px -22px 65px ${theme.palette.mode === 'dark' ? 'rgba(110, 110, 110, 0.26)' : 'rgba(255, 255, 255, 0.8)'},
    0 0 22px ${theme.palette.mode === 'dark' ? 'rgba(100, 100, 100, 0.35)' : 'rgba(255, 255, 255, 0.9)'}
  `,
  opacity: config.opacity,
  transform: `translate(-50%, -50%) perspective(800px) rotateX(1deg) rotateY(-1.5deg) rotate(${config.rotation}deg) scale(${config.scale})`,
  animation: `pulse ${15 + Math.random() * 5}s ease-in-out infinite ${config.animationDelay}s`,
  '@keyframes pulse': {
    '0%, 100%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(1deg) rotateY(-1.5deg) rotate(${config.rotation}deg) scale(${config.scale})`,
      opacity: config.opacity
    },
    '50%': {
      transform: `translate(-50%, -50%) perspective(800px) rotateX(1deg) rotateY(-1.5deg) rotate(${config.rotation}deg) scale(${config.scale * 1.02})`,
      opacity: Math.min(1, config.opacity + 0.1)
    }
  }
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
    secondary1: PolygonConfig;
    secondary2: PolygonConfig;
    inner: PolygonConfig;
  } | null>(null);

  const [gradients, setGradients] = useState<{
    primary: string;
    secondary1: string;
    secondary2: string;
    inner: string;
  } | null>(null);

  const [glowIntensity, setGlowIntensity] = useState(1);

  useEffect(() => {
    // Generate random configurations on component mount
    setPolygonConfigs({
      primary: generateRandomPolygonConfig('primary'),
      secondary1: generateRandomPolygonConfig('secondary'),
      secondary2: generateRandomPolygonConfig('secondary'),
      inner: generateRandomPolygonConfig('inner')
    });

    setGlowIntensity(0.8 + Math.random() * 0.4); // Random intensity between 0.8 and 1.2
  }, []);
  
  useEffect(() => {
    // Regenerate gradients when theme changes
    setGradients({
      primary: generateRandomGradient(isDark),
      secondary1: generateRandomGradient(isDark),
      secondary2: generateRandomGradient(isDark),
      inner: generateRandomGradient(isDark)
    });
  }, [isDark]);

  if (!polygonConfigs || !gradients) {
    return null; // Don't render until configs are generated
  }

  return (
    <BackgroundContainer>
  {/* Subtle museum-like photo base */}
  <PhotoBackdrop />
  <Vignette />
      <AmbientGlow intensity={glowIntensity} />
      <PolygonShape 
        config={polygonConfigs.primary} 
        gradient={gradients.primary}
        animationType="float"
      />
      <SecondaryPolygon 
        config={polygonConfigs.secondary1} 
        gradient={gradients.secondary1}
      />
      <SecondaryPolygon 
        config={polygonConfigs.secondary2} 
        gradient={gradients.secondary2}
      />
      <InnerPolygon 
        config={polygonConfigs.inner} 
        gradient={gradients.inner}
      />
    </BackgroundContainer>
  );
};

export default PolygonBackground;