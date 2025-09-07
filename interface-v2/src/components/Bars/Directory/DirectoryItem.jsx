import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Box,
  Eclipse, 
  Cylinder, 
  Cone, 
  Activity, 
  Database, 
  Zap, 
  FileText, 
  Settings,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Minus,
  Layers,
  Package,
  Rainbow,
  Dam,
  RectangleCircle,
  Atom,
  Torus,
  LineSquiggle,
  Shapes,
  Circle,
  CircleSmall,
  Club,
  Diamond,
  Hexagon
} from 'lucide-react';

/**
 * Directory Item Component
 * Renders individual items in the directory tree
 */
export default function DirectoryItem({
  item,
  level = 0,
  isExpanded,
  isSelected,
  isEditing,
  editValue,
  expandedFolders,
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
  onSelectObject
}) {
  
  const getObjectIcon = (type) => {
    switch (type) {
      case 'cube': return <Box size={14} className="text-blue-400" />;
      case 'sphere': return <Eclipse size={14} className="text-green-400" />;
      case 'cylinder': return <Cylinder size={14} className="text-yellow-400" />;
      case 'cone': return <Cone size={14} className="text-purple-400" />;
      case 'capsule': return <CircleSmall size={14} className="text-red-400" />;
      case 'dodecahedron': return <Diamond size={14} className="text-teal-400" />;
      case 'extrude': return <Shapes size={14} className="text-blue-300" />;
      case 'icosahedron': return <Hexagon size={14} className="text-green-300" />;
      case 'lathe': return <LineSquiggle size={14} className="text-yellow-300" />;
      case 'octahedron': return <Club size={14} className="text-purple-300" />;
      case 'plane': return <Circle size={14} className="text-green-300" />;
      case 'ring': return <Circle size={14} className="text-yellow-400" />;
      case 'shape': return <Shapes size={14} className="text-purple-300" />;
      case 'tetrahedron': return <Diamond size={14} className="text-blue-300" />;
      case 'torus': return <Torus size={14} className="text-orange-300" />;
      case 'torusknot': return <Torus size={14} className="text-green-300" />;
      case 'tube': return <Cylinder size={14} className="text-pink-300" />;
      case 'compound': return <Layers size={14} className="text-orange-400" />;
      case 'source': return <Atom size={14} className="text-red-400" />;
      case 'composition': return <RectangleCircle size={14} className="text-cyan-400" />;
      case 'sensor': return <Dam size={14} className="text-yellow-300" />;
      case 'spectrum': return <Rainbow size={14} className="text-pink-400" />;
      case 'example': return <Package size={14} className="text-indigo-400" />;
      default: return <Box size={14} className="text-gray-400" />;
    }
  };

  // Generate unique key to prevent React warnings
  const uniqueKey = `${item.id}-${item.type}-${level}`;

  return (
    <div key={uniqueKey} className="select-none">
      <div 
        className={`flex items-center py-1 px-2 hover:bg-neutral-600 cursor-pointer group ${
          isSelected ? 'bg-blue-600' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (item.type === 'folder') {
            onToggleFolder(item.id);
          } else {
            onSelectItem(item);
          }
        }}
        onContextMenu={(e) => onRightClick(e, item)}
      >
        {/* Expand/Collapse Icon */}
        {item.type === 'folder' && (
          <div className="mr-1">
            {isExpanded ? (
              <ChevronDown size={12} className="text-neutral-400" />
            ) : (
              <ChevronRight size={12} className="text-neutral-400" />
            )}
          </div>
        )}
        
        {/* Item Icon */}
        <div className="mr-2">
          {item.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen size={14} className="text-yellow-400" />
            ) : (
              <Folder size={14} className="text-yellow-400" />
            )
          ) : (
            getObjectIcon(item.objectType || item.type)
          )}
        </div>
        
        {/* Item Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              onKeyDown={onInputKeyDown}
              onBlur={onSaveEdit}
              className="w-full bg-neutral-700 text-white text-xs px-1 py-0.5 rounded border border-neutral-500 focus:outline-none focus:border-blue-400"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col">
              <span className="text-white text-xs truncate">{item.name}</span>
              {item.description && (
                <span className="text-neutral-400 text-xs truncate" title={item.description}>
                  {item.description}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {!isEditing && item.type !== 'folder' && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Load button for examples */}
            {item.type === 'example' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectObject) {
                    onSelectObject(item);
                  }
                }}
                className="p-1 hover:bg-neutral-500 rounded"
                title="Load Example"
              >
                <Package size={10} className="text-indigo-400" />
              </button>
            )}
            
            {/* Regular action buttons for non-example items */}
            {item.type !== 'example' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit(item.id, item.name);
                  }}
                  className="p-1 hover:bg-neutral-500 rounded"
                  title="Rename"
                >
                  <Edit2 size={10} className="text-neutral-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleVisibility) {
                      onToggleVisibility(item.id, !item.visible);
                    }
                  }}
                  className="p-1 hover:bg-neutral-500 rounded"
                  title={item.visible ? "Hide" : "Show"}
                >
                  {item.visible ? (
                    <Eye size={10} className="text-green-400" />
                  ) : (
                    <EyeOff size={10} className="text-red-400" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteObject) {
                      onDeleteObject(item.id, item.type);
                    }
                  }}
                  className="p-1 hover:bg-neutral-500 rounded"
                  title="Delete"
                >
                  <Trash2 size={10} className="text-red-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onShowProperties) {
                      onShowProperties(item);
                    }
                  }}
                  className="p-1 hover:bg-neutral-500 rounded"
                  title="Properties"
                >
                  <Settings size={10} className="text-blue-400" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Children */}
      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map(child => (
            <DirectoryItem
              key={`${child.id}-${child.type}-${level + 1}`}
              item={child}
              level={level + 1}
              isExpanded={expandedFolders[child.id]}
              isSelected={false} // Children selection handled by parent
              isEditing={false} // Children editing handled by parent
              editValue=""
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
          ))}
        </div>
      )}
    </div>
  );
}
