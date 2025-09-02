import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  MousePointer2,
  Move,
  RotateCcw,
  Info
} from 'lucide-react';

export default function ContextualHelp({ selectedTool, hasSelectedObject, hasObjects }) {
  const getHelpMessage = () => {
    if (!hasObjects) {
      return {
        title: "Get Started",
        message: "Use the Geometry Selector (top-left) to add objects to the scene",
        icon: Info,
        color: "text-blue-400"
      };
    }

    if (selectedTool === 'target') {
      return {
        title: "Target Mode",
        message: "Click any object to zoom and focus on it",
        icon: MousePointer2,
        color: "text-yellow-400"
      };
    }

    if (!hasSelectedObject && (selectedTool === 'select' || selectedTool === 'pan')) {
      return {
        title: "Select an Object",
        message: "Click on any object to select and manipulate it",
        icon: MousePointer2,
        color: "text-green-400"
      };
    }

    if (hasSelectedObject) {
      if (selectedTool === 'pan') {
        return {
          title: "Move Mode Active",
          message: "Drag the gizmo to move • Hold Ctrl to rotate",
          icon: RotateCcw,
          color: "text-purple-400"
        };
      }

      return {
        title: "Object Selected",
        message: "Use arrow keys to move • Drag gizmo for precision • Ctrl+X to delete",
        icon: Move,
        color: "text-green-400"
      };
    }

    return null;
  };

  const helpData = getHelpMessage();
  if (!helpData) return null;

  const { title, message, icon: Icon, color } = helpData;

  return (
    <div className="absolute bottom-6 left-6 bg-neutral-800 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg pointer-events-auto max-w-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon size={20} className={`${color} flex-shrink-0 mt-0.5`} />
          <div className="min-w-0">
            <h3 className="text-white font-medium text-sm mb-1">{title}</h3>
            <p className="text-neutral-300 text-xs leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Keyboard hints for selected object */}
        {hasSelectedObject && (
          <div className="mt-3 pt-3 border-t border-neutral-700">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Quick move:</span>
              <div className="flex items-center gap-1">
                <ArrowUp size={12} />
                <ArrowDown size={12} />
                <ArrowLeft size={12} />
                <ArrowRight size={12} />
                <span className="mx-1">•</span>
                <kbd className="px-1 py-0.5 bg-neutral-600 rounded text-xs">Q</kbd>
                <kbd className="px-1 py-0.5 bg-neutral-600 rounded text-xs">E</kbd>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
