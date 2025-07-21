import React from 'react';
import { Shape, LineStyle } from '../types';

interface PropertyPanelProps {
  selectedShape: Shape | null;
  onShapeUpdate: (shape: Shape) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedShape, onShapeUpdate }) => {
  if (!selectedShape) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Properties</h3>
        <p className="text-gray-500 text-sm">Select a shape to edit its properties</p>
      </div>
    );
  }

  const updateProperty = (property: keyof Shape, value: any) => {
    onShapeUpdate({ ...selectedShape, [property]: value });
  };

  const lineStyles: { value: LineStyle; label: string }[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' }
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Properties</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shape Type
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 capitalize">
            {selectedShape.type}
          </div>
        </div>

        {selectedShape.type !== 'line' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fill Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedShape.fillColor}
                onChange={(e) => updateProperty('fillColor', e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={selectedShape.fillColor}
                onChange={(e) => updateProperty('fillColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stroke Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={selectedShape.strokeColor}
              onChange={(e) => updateProperty('strokeColor', e.target.value)}
              className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={selectedShape.strokeColor}
              onChange={(e) => updateProperty('strokeColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stroke Width
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={selectedShape.strokeWidth}
            onChange={(e) => updateProperty('strokeWidth', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1px</span>
            <span className="font-medium">{selectedShape.strokeWidth}px</span>
            <span>20px</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Line Style
          </label>
          <select
            value={selectedShape.lineStyle}
            onChange={(e) => updateProperty('lineStyle', e.target.value as LineStyle)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {lineStyles.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Position & Size</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">X</label>
              <input
                type="number"
                value={Math.round(Math.min(selectedShape.startPoint.x, selectedShape.endPoint.x))}
                onChange={(e) => {
                  const newX = parseInt(e.target.value) || 0;
                  const width = Math.abs(selectedShape.endPoint.x - selectedShape.startPoint.x);
                  updateProperty('startPoint', { ...selectedShape.startPoint, x: newX });
                  updateProperty('endPoint', { ...selectedShape.endPoint, x: newX + width });
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(Math.min(selectedShape.startPoint.y, selectedShape.endPoint.y))}
                onChange={(e) => {
                  const newY = parseInt(e.target.value) || 0;
                  const height = Math.abs(selectedShape.endPoint.y - selectedShape.startPoint.y);
                  updateProperty('startPoint', { ...selectedShape.startPoint, y: newY });
                  updateProperty('endPoint', { ...selectedShape.endPoint, y: newY + height });
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;