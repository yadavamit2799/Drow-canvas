import { Shape, Point } from './types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const isPointInShape = (point: Point, shape: Shape): boolean => {
  const { startPoint, endPoint, type } = shape;
  
  if (type === 'rectangle') {
    const left = Math.min(startPoint.x, endPoint.x);
    const right = Math.max(startPoint.x, endPoint.x);
    const top = Math.min(startPoint.y, endPoint.y);
    const bottom = Math.max(startPoint.y, endPoint.y);
    
    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
  }
  
  if (type === 'circle') {
    const centerX = (startPoint.x + endPoint.x) / 2;
    const centerY = (startPoint.y + endPoint.y) / 2;
    const radius = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
    ) / 2;
    
    const distance = Math.sqrt(
      Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
    );
    
    return distance <= radius;
  }
  
  if (type === 'line') {
    const tolerance = shape.strokeWidth + 5;
    const lineLength = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
    );
    
    if (lineLength === 0) return false;
    
    const t = Math.max(0, Math.min(1, 
      ((point.x - startPoint.x) * (endPoint.x - startPoint.x) + 
       (point.y - startPoint.y) * (endPoint.y - startPoint.y)) / (lineLength * lineLength)
    ));
    
    const projection = {
      x: startPoint.x + t * (endPoint.x - startPoint.x),
      y: startPoint.y + t * (endPoint.y - startPoint.y)
    };
    
    const distance = Math.sqrt(
      Math.pow(point.x - projection.x, 2) + Math.pow(point.y - projection.y, 2)
    );
    
    return distance <= tolerance;
  }
  
  return false;
};

export const getShapeBounds = (shape: Shape) => {
  const { startPoint, endPoint } = shape;
  return {
    left: Math.min(startPoint.x, endPoint.x),
    top: Math.min(startPoint.y, endPoint.y),
    right: Math.max(startPoint.x, endPoint.x),
    bottom: Math.max(startPoint.y, endPoint.y),
    width: Math.abs(endPoint.x - startPoint.x),
    height: Math.abs(endPoint.y - startPoint.y)
  };
};

export const exportToJSON = (shapes: Shape[]): string => {
  return JSON.stringify(shapes, null, 2);
};

export const importFromJSON = (json: string): Shape[] => {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
};