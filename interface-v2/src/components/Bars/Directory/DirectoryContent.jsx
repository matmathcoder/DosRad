import React from 'react';
import DirectoryItem from './DirectoryItem';

/**
 * Directory Content Component
 * Renders the scrollable content area with directory structure
 */
export default function DirectoryContent({
  directoryStructure,
  expandedFolders,
  selectedItemId,
  editingItem,
  editValue,
  onToggleFolder,
  onSelectItem,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onInputKeyDown,
  onRightClick,
  onToggleVisibility,
  onDeleteObject,
  onShowProperties,
  onSelectObject,
  existingVolumes
}) {
  const renderItem = (item, level = 0) => {
    const isExpanded = expandedFolders[item.id];
    const isSelected = selectedItemId === item.id;
    const isEditing = editingItem === item.id;
    
    return (
      <DirectoryItem
        key={`${item.id}-${item.type}-${level}`}
        item={item}
        level={level}
        isExpanded={isExpanded}
        isSelected={isSelected}
        isEditing={isEditing}
        editValue={editValue}
        expandedFolders={expandedFolders}
        onToggleFolder={onToggleFolder}
        onSelectItem={onSelectItem}
        onStartEdit={onStartEdit}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        onEditValueChange={onEditValueChange}
        onInputKeyDown={onInputKeyDown}
        onRightClick={onRightClick}
        onToggleVisibility={onToggleVisibility}
        onDeleteObject={onDeleteObject}
        onShowProperties={onShowProperties}
        onSelectObject={onSelectObject}
      />
    );
  };

  return (
    <div 
      className="relative p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"
      style={{
        height: 'calc(80vh - 60px)', // 80vh minus header height (60px)
        maxHeight: 'calc(80vh - 60px)' // Ensure it doesn't exceed the container
      }}
    >
      {directoryStructure.map(item => renderItem(item))}
      
      {/* Empty state messages */}
      {existingVolumes.length === 0 && (
        <div className="text-neutral-500 text-xs text-center py-4">
          No objects in scene
        </div>
      )}
      
      {/* Scroll indicator - subtle gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
    </div>
  );
}
