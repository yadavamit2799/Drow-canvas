import React, { useRef, useEffect, useCallback } from 'react';
import { Shape, Point, ShapeType, LineStyle } from '../types';
import { isPointInShape, getShapeBounds } from '../utils';

interface CanvasProps {
  shapes: Shape[];
  selectedTool: ShapeType;
  onShapeCreate: (shape: Shape) => void;
  onShapeSelect: (shape: Shape | null) => void;
  onShapeUpdate: (shape: Shape) => void;
  selectedShape: Shape | null;
}

const Canvas: React.FC<CanvasProps> = ({
  shapes,
  selectedTool,
  onShapeCreate,
  onShapeSelect,
  onShapeUpdate,
  selectedShape
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const currentShapeRef = useRef<Shape | null>(null);

  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    const { startPoint, endPoint, fillColor, strokeColor, strokeWidth, lineStyle, selected } = shape;
    
    ctx.save();
    
    // Set line style
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    
    if (lineStyle === 'dashed') {
      ctx.setLineDash([10, 5]);
    } else if (lineStyle === 'dotted') {
      ctx.setLineDash([2, 3]);
    } else {
      ctx.setLineDash([]);
    }
    
    if (shape.type === 'rectangle') {
      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;
      
      ctx.fillStyle = fillColor;
      ctx.fillRect(startPoint.x, startPoint.y, width, height);
      ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    } else if (shape.type === 'circle') {
      const centerX = (startPoint.x + endPoint.x) / 2;
      const centerY = (startPoint.y + endPoint.y) / 2;
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      ) / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.stroke();
    } else if (shape.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
    
    // Draw selection handles
    if (selected) {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#3B82F6';
      
      if (shape.type === 'line') {
        // Draw handles at line endpoints
        ctx.fillRect(startPoint.x - 4, startPoint.y - 4, 8, 8);
        ctx.fillRect(endPoint.x - 4, endPoint.y - 4, 8, 8);
      } else {
        // Draw selection rectangle
        const bounds = getShapeBounds(shape);
        ctx.strokeRect(bounds.left - 2, bounds.top - 2, bounds.width + 4, bounds.height + 4);
        
        // Draw resize handles
        const handleSize = 8;
        const handles = [
          { x: bounds.left, y: bounds.top },
          { x: bounds.right, y: bounds.top },
          { x: bounds.right, y: bounds.bottom },
          { x: bounds.left, y: bounds.bottom }
        ];
        
        handles.forEach(handle => {
          ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
      }
    }
    
    ctx.restore();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.save();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw all shapes
    shapes.forEach(shape => drawShape(ctx, shape));
    
    // Draw current shape being drawn
    if (currentShapeRef.current) {
      drawShape(ctx, currentShapeRef.current);
    }
  }, [shapes, drawShape]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  const getMousePos = useCallback((event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(event);
    
    // Check if clicking on an existing shape
    const clickedShape = shapes.slice().reverse().find(shape => isPointInShape(mousePos, shape));
    
    if (clickedShape && selectedShape && clickedShape.id === selectedShape.id) {
      // Start dragging selected shape
      isDraggingRef.current = true;
      dragOffsetRef.current = {
        x: mousePos.x - clickedShape.startPoint.x,
        y: mousePos.y - clickedShape.startPoint.y
      };
      return;
    }
    
    if (clickedShape) {
      // Select the clicked shape
      onShapeSelect(clickedShape);
      return;
    }
    
    // Deselect if clicking on empty space
    onShapeSelect(null);
    
    // Start drawing new shape
    isDrawingRef.current = true;
    const newShape: Shape = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedTool,
      startPoint: mousePos,
      endPoint: mousePos,
      fillColor: selectedTool === 'line' ? 'transparent' : '#93C5FD',
      strokeColor: '#1F2937',
      strokeWidth: 2,
      lineStyle: 'solid',
      selected: false
    };
    
    currentShapeRef.current = newShape;
  }, [shapes, selectedShape, selectedTool, getMousePos, onShapeSelect]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(event);
    
    if (isDraggingRef.current && selectedShape) {
      // Update shape position
      const deltaX = mousePos.x - dragOffsetRef.current.x - selectedShape.startPoint.x;
      const deltaY = mousePos.y - dragOffsetRef.current.y - selectedShape.startPoint.y;
      
      const updatedShape: Shape = {
        ...selectedShape,
        startPoint: {
          x: selectedShape.startPoint.x + deltaX,
          y: selectedShape.startPoint.y + deltaY
        },
        endPoint: {
          x: selectedShape.endPoint.x + deltaX,
          y: selectedShape.endPoint.y + deltaY
        }
      };
      
      onShapeUpdate(updatedShape);
      return;
    }
    
    if (isDrawingRef.current && currentShapeRef.current) {
      // Update current shape
      currentShapeRef.current = {
        ...currentShapeRef.current,
        endPoint: mousePos
      };
      redrawCanvas();
    }
  }, [selectedShape, getMousePos, onShapeUpdate, redrawCanvas]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    
    if (isDrawingRef.current && currentShapeRef.current) {
      onShapeCreate(currentShapeRef.current);
      currentShapeRef.current = null;
      isDrawingRef.current = false;
    }
  }, [onShapeCreate]);

  return (
    <div ref={containerRef} className="flex-1 relative bg-gray-50">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="cursor-crosshair"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Canvas;