import React from 'react';
import { Package, FileText, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';

/**
 * Context Menu Component
 * Renders the right-click context menu for directory items
 */
export default function ContextMenu({
  contextMenu,
  onClose,
  onSelectItem,
  onStartEdit,
  onToggleVisibility,
  onDeleteObject
}) {
  if (!contextMenu) return null;

  return (
    <div
      className="fixed bg-neutral-700 border border-neutral-600 rounded shadow-lg py-1 z-50"
      style={{
        left: contextMenu.x,
        top: contextMenu.y
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Example items context menu */}
      {contextMenu.item.type === 'example' ? (
        <>
          <button
            onClick={() => {
              onSelectItem(contextMenu.item);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-indigo-400 text-xs hover:bg-neutral-600 flex items-center space-x-2"
          >
            <Package size={12} />
            <span>Load Example</span>
          </button>
          <button
            onClick={() => {
              onSelectItem(contextMenu.item);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white text-xs hover:bg-neutral-600 flex items-center space-x-2"
          >
            <FileText size={12} />
            <span>View Details</span>
          </button>
        </>
      ) : (
        /* Regular items context menu */
        <>
          <button
            onClick={() => {
              onSelectItem(contextMenu.item);
              onStartEdit(contextMenu.item.id, contextMenu.item.name);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white text-xs hover:bg-neutral-600 flex items-center space-x-2"
          >
            <Edit2 size={12} />
            <span>Rename</span>
          </button>
          <button
            onClick={() => {
              onSelectItem(contextMenu.item);
              if (onToggleVisibility) {
                onToggleVisibility(contextMenu.item.id, !contextMenu.item.visible);
              }
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-white text-xs hover:bg-neutral-600 flex items-center space-x-2"
          >
            {contextMenu.item.visible ? (
              <>
                <EyeOff size={12} />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye size={12} />
                <span>Show</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              onSelectItem(contextMenu.item);
              if (onDeleteObject) {
                if (window.confirm(`Are you sure you want to delete "${contextMenu.item.name}"?`)) {
                  onDeleteObject(contextMenu.item.id, contextMenu.item.type);
                }
              }
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-red-400 text-xs hover:bg-neutral-600 flex items-center space-x-2"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </>
      )}
    </div>
  );
}
