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

// Predefined polygon base shapes (asymmetric, room-like bevels)
// These emphasize more vertical edges and a narrower top than bottom to hint
// at an interior "room" with subtle perspective. They are intentionally
// non‑symmetric so each randomization feels organic.
const polygonShapes = {
  // Tall mouth with nearly vertical sides
  tallMouth: [
    [44, 5], [58, 6], [90, 26], [92, 64], [60, 95], [36, 94], [11, 70], [10, 32]
  ],
  // Slightly tilted interior aperture with beveled corners
  beveledRoom: [
    [41, 7], [63, 8], [88, 30], [90, 67], [62, 93], [33, 92], [12, 72], [12, 34]
  ],
  // Irregular, vertical leaning shape
  leanRoom: [
    [46, 5], [66, 7], [92, 29], [94, 66], [63, 97], [31, 95], [8, 71], [9, 33]
  ],
  // Narrower top, wider base, asymmetric sides
  flareBase: [
    [43, 6], [59, 7], [86, 27], [91, 65], [62, 96], [35, 96], [12, 73], [11, 31]
  ]
};

export const generateRandomPolygonConfig = (type: 'primary' | 'secondary' | 'inner'): PolygonConfig => {
  const shapeKeys = Object.keys(polygonShapes) as (keyof typeof polygonShapes)[];
  const randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
  const baseShape = polygonShapes[randomShape];
  
  let config: PolygonConfig;
  
  switch (type) {
    case 'primary':
      config = {
        clipPath: generatePolygonPoints(baseShape, 4.0),
        rotation: randomInRange(-2.2, 2.2),
        scale: randomInRange(1.01, 1.05),
        opacity: randomInRange(0.88, 0.96),
        animationDelay: randomInRange(0, 1.2),
        position: {
          // Center-based with tiny random offset to avoid symmetry
          top: `calc(50% + ${randomInRange(-2.0, 1.6).toFixed(1)}%)`,
          left: `calc(50% + ${randomInRange(-1.6, 2.0).toFixed(1)}%)`
        }
      };
      break;
      
    case 'secondary':
      config = {
        clipPath: generatePolygonPoints(baseShape, 3.5),
        rotation: randomInRange(-4.5, 4.5),
        scale: randomInRange(0.99, 1.02),
        opacity: randomInRange(0.18, 0.3),
        animationDelay: randomInRange(0, 4),
        position: {
          top: `calc(50% + ${randomInRange(-1.6, 1.6).toFixed(1)}%)`,
          left: `calc(50% + ${randomInRange(-1.6, 1.6).toFixed(1)}%)`
        }
      };
      break;
      
    case 'inner':
      config = {
        clipPath: generatePolygonPoints(baseShape, 2.2),
        rotation: randomInRange(-2.8, 2.8),
        scale: randomInRange(0.985, 1.015),
        opacity: randomInRange(0.74, 0.86),
        animationDelay: randomInRange(0, 3),
        position: {
          top: `calc(50% + ${randomInRange(-1.2, 1.2).toFixed(1)}%)`,
          left: `calc(50% + ${randomInRange(-1.2, 1.2).toFixed(1)}%)`
        }
      };
      break;
  }
  
  return config;
};

export const generateRandomGradient = (isDark: boolean = false): string => {
  // Layered gradients to create subtle interior wall shading with a faux light source
  // Softer than before to reduce stacky look and support the photo backdrop.
  const lightGradients = [
    [
      'radial-gradient(ellipse at 55% 48%, rgba(255,255,255,0.75) 0%, rgba(245,245,245,0.45) 40%, rgba(230,230,230,0.22) 70%, rgba(220,220,220,0.10) 100%)',
      'linear-gradient(180deg, rgba(245,245,245,0.35) 0%, rgba(240,240,240,0.20) 50%, rgba(235,235,235,0.10) 100%)',
      'linear-gradient(100deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)'
    ].join(', '),
    [
      'radial-gradient(ellipse at 52% 46%, rgba(255,255,255,0.8) 0%, rgba(245,245,245,0.48) 38%, rgba(230,230,230,0.22) 72%, rgba(220,220,220,0.1) 100%)',
      'linear-gradient(210deg, rgba(250,250,250,0.28) 0%, rgba(235,235,235,0.16) 65%, rgba(220,220,220,0.06) 100%)',
      'linear-gradient(350deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)'
    ].join(', ')
  ];
  
  const darkGradients = [
    [
      'radial-gradient(ellipse at 55% 48%, rgba(120,120,120,0.28) 0%, rgba(90,90,90,0.20) 45%, rgba(70,70,70,0.12) 75%, rgba(50,50,50,0.06) 100%)',
      'linear-gradient(185deg, rgba(150,150,150,0.16) 0%, rgba(100,100,100,0.12) 55%, rgba(60,60,60,0.05) 100%)',
      'linear-gradient(20deg, rgba(180,180,180,0.10) 0%, rgba(180,180,180,0) 60%)'
    ].join(', '),
    [
      'radial-gradient(ellipse at 52% 46%, rgba(130,130,130,0.28) 0%, rgba(95,95,95,0.20) 40%, rgba(70,70,70,0.12) 75%, rgba(50,50,50,0.06) 100%)',
      'linear-gradient(210deg, rgba(160,160,160,0.14) 0%, rgba(110,110,110,0.10) 60%, rgba(70,70,70,0.05) 100%)',
      'linear-gradient(340deg, rgba(185,185,185,0.10) 0%, rgba(185,185,185,0) 55%)'
    ].join(', ')
  ];
  
  const gradientTypes = isDark ? darkGradients : lightGradients;
  return gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
};