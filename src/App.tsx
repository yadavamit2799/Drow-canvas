import React, { useState, useCallback } from 'react';
import { Palette } from 'lucide-react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertyPanel from './components/PropertyPanel';
import { Shape, ShapeType } from './types';
import { exportToJSON, importFromJSON } from './utils';

function App() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedTool, setSelectedTool] = useState<ShapeType>('rectangle');
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newShapes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleShapeCreate = useCallback((shape: Shape) => {
    const newShapes = [...shapes, shape];
    setShapes(newShapes);
    addToHistory(newShapes);
  }, [shapes, addToHistory]);

  const handleShapeSelect = useCallback((shape: Shape | null) => {
    // Deselect all shapes first
    const updatedShapes = shapes.map(s => ({ ...s, selected: false }));
    
    if (shape) {
      // Select the clicked shape
      const shapeIndex = updatedShapes.findIndex(s => s.id === shape.id);
      if (shapeIndex !== -1) {
        updatedShapes[shapeIndex] = { ...updatedShapes[shapeIndex], selected: true };
      }
    }
    
    setShapes(updatedShapes);
    setSelectedShape(shape ? updatedShapes.find(s => s.id === shape.id) || null : null);
  }, [shapes]);

  const handleShapeUpdate = useCallback((updatedShape: Shape) => {
    const newShapes = shapes.map(shape => 
      shape.id === updatedShape.id ? updatedShape : shape
    );
    setShapes(newShapes);
    setSelectedShape(updatedShape);
    addToHistory(newShapes);
  }, [shapes, addToHistory]);

  const handleSave = useCallback(() => {
    const dataStr = exportToJSON(shapes);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'drawing.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [shapes]);

  const handleLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const loadedShapes = importFromJSON(content);
      setShapes(loadedShapes);
      setSelectedShape(null);
      addToHistory(loadedShapes);
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }, [addToHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
      setSelectedShape(null);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
      setSelectedShape(null);
    }
  }, [history, historyIndex]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Palette className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800">DrawPro</h1>
          </div>
          <div className="text-sm text-gray-500">
            Professional Drawing Application
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onSave={handleSave}
        onLoad={handleLoad}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        <Canvas
          shapes={shapes}
          selectedTool={selectedTool}
          onShapeCreate={handleShapeCreate}
          onShapeSelect={handleShapeSelect}
          onShapeUpdate={handleShapeUpdate}
          selectedShape={selectedShape}
        />
        <PropertyPanel
          selectedShape={selectedShape}
          onShapeUpdate={handleShapeUpdate}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Shapes: {shapes.length} | Selected: {selectedShape ? selectedShape.type : 'None'}
          </div>
          <div>
            Ready - Select a tool and start drawing
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;