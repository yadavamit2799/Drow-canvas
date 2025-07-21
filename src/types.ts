export type ShapeType = 'rectangle' | 'circle' | 'line';

export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface Point {
  x: number;
  y: number;
}

export interface BaseShape {
  id: string;
  type: ShapeType;
  startPoint: Point;
  endPoint: Point;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  lineStyle: LineStyle;
  selected: boolean;
}

export interface Rectangle extends BaseShape {
  type: 'rectangle';
}

export interface Circle extends BaseShape {
  type: 'circle';
}

export interface Line extends BaseShape {
  type: 'line';
}

export type Shape = Rectangle | Circle | Line;

export interface DrawingState {
  shapes: Shape[];
  selectedTool: ShapeType;
  isDrawing: boolean;
  isDragging: boolean;
  dragOffset: Point;
  currentShape: Shape | null;
}