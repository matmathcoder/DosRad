import React from 'react';
import { ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

/**
 * Directory Header Component
 * Renders the header with title, controls, and minimize button
 */
export default function DirectoryHeader({
  isMinimized,
  layoutPosition,
  existingVolumes,
  onToggleMinimize,
  onClearAllObjects
}) {
  return (
    <div className="flex items-center justify-between bg-neutral-700 px-4 py-3">
      <div className="flex items-center space-x-2">
        <h2 className="text-white font-medium">Project Directory</h2>
        <span className="text-xs text-neutral-400">(F2: Rename)</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Clear All Button */}
        {existingVolumes.length > 0 && onClearAllObjects && (
          <button
            onClick={onClearAllObjects}
            className="p-1 hover:bg-red-600 rounded text-white transition-colors"
            title="Clear All Objects"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        )}
        
        {/* Toggle Icon - Positioned based on directory location */}
        <button
          onClick={onToggleMinimize}
          className={`p-1 hover:bg-neutral-600 rounded text-white transition-colors ${
            layoutPosition === 'left' ? 'ml-2' : 'mr-2'
          }`}
          title={isMinimized ? "Expand Directory" : "Minimize Directory"}
        >
          {isMinimized ? (
            <ChevronRight 
              size={16} 
              className={`text-neutral-400 ${
                layoutPosition === 'left' ? 'rotate-0' : 'rotate-180'
              }`} 
            />
          ) : (
            <ChevronDown 
              size={16} 
              className={`text-neutral-400 ${
                layoutPosition === 'left' ? 'rotate-0' : 'rotate-180'
              }`} 
            />
          )}
        </button>
      </div>
    </div>
  );
}
