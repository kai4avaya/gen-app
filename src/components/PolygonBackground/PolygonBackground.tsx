import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { generateRandomPolygonConfig, generateRandomGradient, PolygonConfig } from '../../utils/polygonGenerator';

const BackgroundContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 0
});

const PolygonShape = styled(Box)<{ 
  config: PolygonConfig; 
  gradient: string;
  animationType: string;
}>(({ config, gradient, animationType }) => ({
  position: 'absolute',
  width: '120vw',
  height: '120vh',
  top: config.position.top,
  left: config.position.left,
  opacity: config.opacity,
  transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
  transformOrigin: 'center center',
  clipPath: config.clipPath,
  background: gradient,
  boxShadow: `
    inset 0 0 100px rgba(0, 0, 0, 0.02),
    inset 0 0 200px rgba(0, 0, 0, 0.01),
    0 0 50px rgba(255, 255, 255, 0.8)
  `,
  animation: `${animationType} ${20 + Math.random() * 10}s ease-in-out infinite ${config.animationDelay}s`,
  '@keyframes float': {
    '0%, 100%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale}) translateY(0px)`
    },
    '50%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale}) translateY(-10px)`
    }
  },
  '@keyframes floatReverse': {
    '0%, 100%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale}) translateY(0px) translateX(0px)`
    },
    '33%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale}) translateY(5px) translateX(-5px)`
    },
    '66%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale}) translateY(-5px) translateX(5px)`
    }
  },
  '@keyframes pulse': {
    '0%, 100%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
      opacity: config.opacity
    },
    '50%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale * 1.02})`,
      opacity: Math.min(1, config.opacity + 0.1)
    }
  }
}));

const SecondaryPolygon = styled(Box)<{ 
  config: PolygonConfig; 
  gradient: string;
}>(({ config, gradient }) => ({
  position: 'absolute',
  width: '80vw',
  height: '80vh',
  top: config.position.top,
  left: config.position.left,
  transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
  transformOrigin: 'center center',
  clipPath: config.clipPath,
  background: gradient,
  boxShadow: `
    inset 0 0 80px rgba(0, 0, 0, 0.015),
    inset 20px 20px 60px rgba(0, 0, 0, 0.01),
    inset -20px -20px 60px rgba(255, 255, 255, 0.5)
  `,
  opacity: config.opacity,
  animation: `floatReverse ${25 + Math.random() * 10}s ease-in-out infinite ${config.animationDelay}s`,
  '@keyframes floatReverse': {
    '0%, 100%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale}) translateY(0px) translateX(0px)`
    },
    '33%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale}) translateY(5px) translateX(-5px)`
    },
    '66%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale}) translateY(-5px) translateX(5px)`
    }
  }
}));

const InnerPolygon = styled(Box)<{ 
  config: PolygonConfig; 
  gradient: string;
}>(({ config, gradient }) => ({
  position: 'absolute',
  width: '60vw',
  height: '60vh',
  top: config.position.top,
  left: config.position.left,
  clipPath: config.clipPath,
  background: gradient,
  boxShadow: `
    inset 0 0 60px rgba(0, 0, 0, 0.02),
    inset 10px 10px 40px rgba(0, 0, 0, 0.008),
    inset -10px -10px 40px rgba(255, 255, 255, 0.6),
    0 0 30px rgba(255, 255, 255, 0.9)
  `,
  opacity: config.opacity,
  transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
  animation: `pulse ${15 + Math.random() * 5}s ease-in-out infinite ${config.animationDelay}s`,
  '@keyframes pulse': {
    '0%, 100%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
      opacity: config.opacity
    },
    '50%': {
      transform: `rotate(${config.rotation}deg) scale(${config.scale * 1.02})`,
      opacity: Math.min(1, config.opacity + 0.1)
    }
  }
}));

const AmbientGlow = styled(Box)<{ intensity: number }>(({ intensity }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '150vw',
  height: '150vh',
  transform: 'translate(-50%, -50%)',
  background: `radial-gradient(circle, rgba(255, 255, 255, ${0.1 * intensity}) 0%, rgba(250, 250, 250, ${0.05 * intensity}) 30%, transparent 70%)`,
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

    setGradients({
      primary: generateRandomGradient(),
      secondary1: generateRandomGradient(),
      secondary2: generateRandomGradient(),
      inner: generateRandomGradient()
    });

    setGlowIntensity(0.8 + Math.random() * 0.4); // Random intensity between 0.8 and 1.2
  }, []);

  if (!polygonConfigs || !gradients) {
    return null; // Don't render until configs are generated
  }

  return (
    <BackgroundContainer>
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