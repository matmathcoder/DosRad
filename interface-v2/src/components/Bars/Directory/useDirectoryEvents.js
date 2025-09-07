import { useEffect } from 'react';

/**
 * Custom hook for handling directory events
 * Manages keyboard shortcuts and click outside behavior
 */
export default function useDirectoryEvents({
  directoryRef,
  selectedItemId,
  editingItem,
  contextMenu,
  directoryStructure,
  onStartEdit,
  onCloseContextMenu,
  onCancelEdit
}) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is outside the directory component
      if (directoryRef.current && !directoryRef.current.contains(e.target)) {
        onCloseContextMenu();
        // Optionally clear selection when clicking outside
        // setSelectedItemId(null);
      }
    };
    
    const handleKeyDown = (e) => {
      // Handle F2 for rename
      if (e.key === 'F2' && selectedItemId) {
        e.preventDefault();
        e.stopPropagation();
        
        const findItem = (items, id) => {
          for (const item of items) {
            if (item.id === id) {
              return item;
            }
            if (item.children) {
              const found = findItem(item.children, id);
              if (found) return found;
            }
          }
          return null;
        };
        
        const selectedItem = findItem(directoryStructure, selectedItemId);
        if (selectedItem && selectedItem.type !== 'folder') {
          onStartEdit(selectedItem.id, selectedItem.name);
        }
      }
      
      // Handle Escape to cancel editing
      if (e.key === 'Escape') {
        if (editingItem) {
          onCancelEdit();
        } else if (contextMenu) {
          onCloseContextMenu();
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItemId, editingItem, contextMenu, directoryStructure, onStartEdit, onCloseContextMenu, onCancelEdit]);
}
