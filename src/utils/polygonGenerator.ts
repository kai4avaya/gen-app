// Utility functions for generating random polygon variations

export interface PolygonConfig {
  clipPath: string;
  rotation: number;
  scale: number;
  opacity: number;
  animationDelay: number;
  position: {
    top: string;
    left: string;
  };
}

// Generate random number within range
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Generate random polygon points with slight variations
const generatePolygonPoints = (basePoints: number[][], variation: number = 5): string => {
  const randomizedPoints = basePoints.map(([x, y]) => {
    const newX = Math.max(0, Math.min(100, x + randomInRange(-variation, variation)));
    const newY = Math.max(0, Math.min(100, y + randomInRange(-variation, variation)));
    return `${newX.toFixed(1)}% ${newY.toFixed(1)}%`;
  });
  
  return `polygon(${randomizedPoints.join(', ')})`;
};

// Predefined polygon base shapes
const polygonShapes = {
  octagon: [[20, 0], [80, 0], [100, 20], [100, 80], [80, 100], [20, 100], [0, 80], [0, 20]],
  hexagon: [[25, 0], [75, 0], [100, 25], [100, 75], [75, 100], [25, 100], [0, 75], [0, 25]],
  diamond: [[30, 0], [70, 0], [100, 30], [100, 70], [70, 100], [30, 100], [0, 70], [0, 30]],
  irregular: [[15, 5], [85, 0], [95, 25], [100, 75], [85, 95], [25, 100], [5, 80], [0, 25]]
};

export const generateRandomPolygonConfig = (type: 'primary' | 'secondary' | 'inner'): PolygonConfig => {
  const shapeKeys = Object.keys(polygonShapes) as (keyof typeof polygonShapes)[];
  const randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
  const baseShape = polygonShapes[randomShape];
  
  let config: PolygonConfig;
  
  switch (type) {
    case 'primary':
      config = {
        clipPath: generatePolygonPoints(baseShape, 8),
        rotation: randomInRange(-20, 20),
        scale: randomInRange(1.05, 1.15),
        opacity: randomInRange(0.85, 0.95),
        animationDelay: randomInRange(0, 2),
        position: {
          top: `${randomInRange(-5, 5)}%`,
          left: `${randomInRange(-5, 5)}%`
        }
      };
      break;
      
    case 'secondary':
      config = {
        clipPath: generatePolygonPoints(baseShape, 6),
        rotation: randomInRange(-30, 30),
        scale: randomInRange(0.9, 1.1),
        opacity: randomInRange(0.6, 0.8),
        animationDelay: randomInRange(0, 5),
        position: {
          top: `${randomInRange(5, 15)}%`,
          left: `${randomInRange(5, 15)}%`
        }
      };
      break;
      
    case 'inner':
      config = {
        clipPath: generatePolygonPoints(baseShape, 4),
        rotation: randomInRange(-15, 15),
        scale: randomInRange(0.95, 1.05),
        opacity: randomInRange(0.75, 0.85),
        animationDelay: randomInRange(0, 3),
        position: {
          top: `${randomInRange(15, 25)}%`,
          left: `${randomInRange(15, 25)}%`
        }
      };
      break;
  }
  
  return config;
};

export const generateRandomGradient = (isDark: boolean = false): string => {
  const lightGradients = [
    'linear-gradient(135deg, #ffffff 0%, #f0f0f0 25%, #e0e0e0 50%, #d0d0d0 75%, #c0c0c0 100%)',
    'linear-gradient(225deg, #f8f8f8 0%, #e8e8e8 30%, #d8d8d8 60%, #c8c8c8 100%)',
    'linear-gradient(45deg, #ffffff 0%, #e5e5e5 40%, #d0d0d0 70%, #c0c0c0 100%)',
    'radial-gradient(ellipse at center, #ffffff 0%, #f0f0f0 40%, #e0e0e0 70%, #d0d0d0 100%)',
    'linear-gradient(315deg, #f8f8f8 0%, #e0e0e0 35%, #d0d0d0 65%, #c8c8c8 100%)'
  ];
  
  const darkGradients = [
    'linear-gradient(135deg, #505050 0%, #404040 25%, #353535 50%, #2a2a2a 75%, #1e1e1e 100%)',
    'linear-gradient(225deg, #454545 0%, #3a3a3a 30%, #303030 60%, #252525 100%)',
    'linear-gradient(45deg, #505050 0%, #353535 40%, #2a2a2a 70%, #1e1e1e 100%)',
    'radial-gradient(ellipse at center, #505050 0%, #404040 40%, #353535 70%, #2a2a2a 100%)',
    'linear-gradient(315deg, #454545 0%, #353535 35%, #2a2a2a 65%, #252525 100%)'
  ];
  
  const gradientTypes = isDark ? darkGradients : lightGradients;
  return gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
};