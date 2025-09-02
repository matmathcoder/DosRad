import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  MousePointer2,
  RotateCcw,
  Trash2,
  Move,
  X,
  Keyboard,
  Eye,
  Hand,
  Plus, 
  Minus,
  SquaresIntersect,
} from 'lucide-react';

export default function HelpOverlay({ isVisible, onClose }) {
  if (!isVisible) return null;

  const shortcuts = [
    {
      category: "Object Manipulation",
      items: [
        { keys: ["Click"], icon: MousePointer2, desc: "Select object" },
        { keys: ["Drag & Drop"], icon: Move, desc: "Drag geometry from selector to scene" },
        { keys: ["Shift", "+", "Click"], icon: Trash2, desc: "Reduce volume (carve/hollow)" },
        { keys: ["Drag Gizmo"], icon: Move, desc: "Move object" },
        { keys: ["Ctrl", "+", "Alt", "+", "Drag"], icon: RotateCcw, desc: "Rotate object (in Move mode)" },
        { keys: ["Ctrl", "+", "G"], icon: Hand, desc: "Toggle Move mode" },
        { keys: ["Ctrl", "+", "X"], icon: Trash2, desc: "Delete selected object" },
        { keys: ["Ctrl", "+", "Z"], icon: RotateCcw, desc: "Undo last action" },
        { keys: ["Ctrl", "+", "Y"], icon: RotateCcw, desc: "Redo last action" },
      ]
    },
    {
      category: "Keyboard Movement",
      items: [
        { keys: ["↑"], icon: ArrowUp, desc: "Move forward (Z-axis)" },
        { keys: ["↓"], icon: ArrowDown, desc: "Move backward (Z-axis)" },
        { keys: ["←"], icon: ArrowLeft, desc: "Move left (X-axis)" },
        { keys: ["→"], icon: ArrowRight, desc: "Move right (X-axis)" },
        { keys: ["Q"], icon: null, desc: "Move up (Y-axis)" },
        { keys: ["E"], icon: null, desc: "Move down (Y-axis)" },
      ]
    },
    {
      category: "CSG Operations",
      items: [
        { keys: ["Union Tool"], icon: Plus, desc: "Combine two volumes (A + B)" },
        { keys: ["Subtract Tool"], icon: Minus, desc: "Subtract volume B from A" },
        { keys: ["Intersect Tool"], icon: SquaresIntersect, desc: "Keep only intersection" },
        { keys: ["Select 2 Objects"], icon: MousePointer2, desc: "Click two objects to perform operation" },
      ]
    },
    {
      category: "Camera Controls",
      items: [
        { keys: ["Mouse Drag"], icon: Eye, desc: "Orbit camera" },
        { keys: ["Mouse Wheel"], icon: null, desc: "Zoom in/out" },
        { keys: ["H"], icon: null, desc: "Save Home view" },
        { keys: ["Shift", "+", "H"], icon: null, desc: "Go to Home view" },
        { keys: ["F"], icon: null, desc: "Frame all objects" },
        { keys: ["Ctrl", "+", "F"], icon: null, desc: "Frame selected object" },
        { keys: ["P"], icon: null, desc: "Toggle perspective/orthographic" },
      ]
    },
    {
      category: "General",
      items: [
        { keys: ["Esc"], icon: null, desc: "Deselect object" },
        { keys: ["F1"], icon: Keyboard, desc: "Toggle this help" },
        { keys: ["Space"], icon: null, desc: "Reset tool to Select" },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-neutral-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Keyboard size={24} className="text-blue-400" />
            Keyboard Shortcuts & Controls
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-md text-white"
            title="Close Help"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcuts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-neutral-700 pb-2">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-700 transition-colors">
                    {/* Icon */}
                    <div className="w-6 h-6 flex items-center justify-center">
                      {item.icon && <item.icon size={16} className="text-neutral-400" />}
                    </div>
                    
                    {/* Keys */}
                    <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
                      {item.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="px-2 py-1 bg-neutral-600 text-white text-xs rounded font-mono border border-neutral-500">
                            {key}
                          </kbd>
                          {keyIndex < item.keys.length - 1 && (
                            <span className="text-neutral-400 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    
                    {/* Description */}
                    <span className="text-neutral-300 text-sm flex-1 min-w-0">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-700 bg-neutral-900 rounded-b-lg">
          <div className="text-center text-neutral-400 text-sm">
            <p className="mb-2">💡 <strong>Pro Tip:</strong> Use the sidebar tools on the right for advanced camera controls and object manipulation</p>
            <p>Press <kbd className="px-1 py-0.5 bg-neutral-600 rounded text-xs">F1</kbd> anytime to show/hide this help</p>
          </div>
        </div>
      </div>
    </div>
  );
}
