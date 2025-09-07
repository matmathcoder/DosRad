import React, { useRef, useEffect } from 'react';
import DirectoryHeader from './DirectoryHeader';
import DirectoryContent from './DirectoryContent';
import ContextMenu from './ContextMenu';
import useDirectoryState from './useDirectoryState';
import useDirectoryEvents from './useDirectoryEvents';
import { buildDirectoryStructure, getPositionStyle } from './DirectoryData';

/**
 * Main Directory Component
 * Orchestrates all directory functionality through modular components
 */
export default function Directory({ 
  isVisible, 
  onClose, 
  existingVolumes = [], 
  existingSensors = [],
  existingCompositions = [],
  existingSpectra = [],
  onRenameObject,
  onDeleteObject,
  onSelectObject,
  onToggleVisibility,
  onClearAllObjects,
  onShowProperties,
  selectedObjectId,
  layoutPosition = 'left'
}) {
  const directoryRef = useRef();

  // Use custom hooks for state management and events
  const {
    isMinimized,
    expandedFolders,
    editingItem,
    editValue,
    contextMenu,
    selectedItemId,
    setIsMinimized,
    toggleFolder,
    startEdit,
    saveEdit,
    cancelEdit,
    handleInputKeyDown,
    handleRightClick,
    closeContextMenu,
    handleSelectItem,
    setEditValue
  } = useDirectoryState({
    selectedObjectId,
    onRenameObject,
    onSelectObject,
    onToggleVisibility,
    onDeleteObject,
    onShowProperties
  });

  // Use custom hook for event handling
  useDirectoryEvents({
    directoryRef,
    selectedItemId,
    editingItem,
    contextMenu,
    directoryStructure: buildDirectoryStructure({
      existingVolumes,
      existingSensors,
      existingSpectra
    }),
    onStartEdit: startEdit,
    onCloseContextMenu: closeContextMenu,
    onCancelEdit: cancelEdit
  });

  // Debug: Log when existingVolumes changes
  useEffect(() => {
    console.log('Directory received volumes:', existingVolumes.length, existingVolumes.map(v => ({ id: v.id, name: v.name || v.userData?.volumeName })));
    
    // Additional safeguard: Check for duplicates in the received data
    const ids = existingVolumes.map(v => v.id);
    const uniqueIds = [...new Set(ids)];
    if (ids.length !== uniqueIds.length) {
      console.warn('Directory received duplicate volumes! IDs:', ids);
    }
  }, [existingVolumes]);

  if (!isVisible) return null;

  const directoryStructure = buildDirectoryStructure({
    existingVolumes,
    existingSensors,
    existingSpectra
  });

  const positionStyle = getPositionStyle(layoutPosition, isMinimized);

  return (
    <div 
      ref={directoryRef}
      className="bg-neutral-800 shadow-2xl border border-neutral-600 rounded-lg pointer-events-auto fixed focus:outline-none"
      style={positionStyle}
      tabIndex={0}
    >
      {/* Header */}
      <DirectoryHeader
        isMinimized={isMinimized}
        layoutPosition={layoutPosition}
        existingVolumes={existingVolumes}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
        onClearAllObjects={onClearAllObjects}
      />

      {/* Content */}
      {!isMinimized && (
        <DirectoryContent
          directoryStructure={directoryStructure}
          expandedFolders={expandedFolders}
          selectedItemId={selectedItemId}
          editingItem={editingItem}
          editValue={editValue}
          onToggleFolder={toggleFolder}
          onSelectItem={handleSelectItem}
          onStartEdit={startEdit}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onEditValueChange={setEditValue}
          onInputKeyDown={handleInputKeyDown}
          onRightClick={handleRightClick}
          onToggleVisibility={onToggleVisibility}
          onDeleteObject={onDeleteObject}
          onShowProperties={onShowProperties}
          onSelectObject={onSelectObject}
          existingVolumes={existingVolumes}
        />
      )}

      {/* Context Menu */}
      <ContextMenu
        contextMenu={contextMenu}
        onClose={closeContextMenu}
        onSelectItem={handleSelectItem}
        onStartEdit={startEdit}
        onToggleVisibility={onToggleVisibility}
        onDeleteObject={onDeleteObject}
      />
    </div>
  );
}
