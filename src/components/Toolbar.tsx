import React from 'react';
import { Square, Circle, Minus, Download, Upload, RotateCcw, RotateCw } from 'lucide-react';
import { ShapeType } from '../types';

interface ToolbarProps {
  selectedTool: ShapeType;
  onToolSelect: (tool: ShapeType) => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const tools = [
    { type: 'rectangle' as ShapeType, icon: Square, label: 'Rectangle' },
    { type: 'circle' as ShapeType, icon: Circle, label: 'Circle' },
    { type: 'line' as ShapeType, icon: Minus, label: 'Line' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Tools:</span>
          {tools.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => onToolSelect(type)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                selectedTool === type
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={label}
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-gray-300" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              canUndo
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <RotateCcw size={18} />
            <span className="text-sm">Undo</span>
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              canRedo
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <RotateCw size={18} />
            <span className="text-sm">Redo</span>
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-300" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
            title="Save Drawing"
          >
            <Download size={18} />
            <span className="text-sm">Save</span>
          </button>
          
          <label className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 cursor-pointer">
            <Upload size={18} />
            <span className="text-sm">Load</span>
            <input
              type="file"
              accept=".json"
              onChange={onLoad}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;