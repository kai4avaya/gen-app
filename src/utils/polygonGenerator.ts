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

export const generateRandomGradient = (): string => {
  const gradientTypes = [
    'linear-gradient(135deg, #ffffff 0%, #fafafa 25%, #f5f5f5 50%, #f0f0f0 75%, #eeeeee 100%)',
    'linear-gradient(225deg, #fafafa 0%, #f8f8f8 30%, #f0f0f0 60%, #e8e8e8 100%)',
    'linear-gradient(45deg, #ffffff 0%, #f5f5f5 40%, #f0f0f0 70%, #eeeeee 100%)',
    'radial-gradient(ellipse at center, #ffffff 0%, #fafafa 40%, #f5f5f5 70%, #f0f0f0 100%)',
    'linear-gradient(315deg, #fafafa 0%, #f5f5f5 35%, #f0f0f0 65%, #e8e8e8 100%)'
  ];
  
  return gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
};