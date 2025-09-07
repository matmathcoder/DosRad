import { useState, useEffect } from 'react';

/**
 * Custom hook for managing directory state
 * Handles all state management for the directory component
 */
export default function useDirectoryState({
  selectedObjectId,
  onRenameObject,
  onSelectObject,
  onToggleVisibility,
  onDeleteObject,
  onShowProperties
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({
    scene: true,
    objects: true,
    sources: true,
    compositions: true,
    sensors: true,
    spectra: true,
    examples: true
  });
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Synchronize selectedItemId with selectedObjectId prop
  useEffect(() => {
    if (selectedObjectId === null) {
      setSelectedItemId(null);
    }
  }, [selectedObjectId]);

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const startEdit = (itemId, currentName) => {
    setEditingItem(itemId);
    setEditValue(currentName);
  };

  const saveEdit = () => {
    if (editingItem && editValue.trim() && onRenameObject) {
      onRenameObject(editingItem, editValue.trim());
    }
    setEditingItem(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleInputKeyDown = (e) => {
    // Directory has full priority when editing - no scene shortcuts should interfere
    // Handle editing-specific keys
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
    // All other keys are handled normally by the input field
  };

  const handleRightClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (item.type === 'folder') return;
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleSelectItem = (item) => {
    setSelectedItemId(item.id);
    if (onSelectObject) {
      onSelectObject(item);
    }
  };

  return {
    // State
    isMinimized,
    expandedFolders,
    editingItem,
    editValue,
    contextMenu,
    selectedItemId,
    
    // Actions
    setIsMinimized,
    toggleFolder,
    startEdit,
    saveEdit,
    cancelEdit,
    handleKeyPress,
    handleInputKeyDown,
    handleRightClick,
    closeContextMenu,
    handleSelectItem,
    setEditValue
  };
}
