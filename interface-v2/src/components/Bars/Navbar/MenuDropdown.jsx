import React from 'react';
import { ChevronRight } from 'lucide-react';
import { fileMenuIcons, sceneMenuIcons, visibilityMap } from './NavigationData';

/**
 * Menu Dropdown Component
 * Renders individual dropdown menus with items and submenus
 */
export default function MenuDropdown({
  menuName,
  items,
  activeDropdown,
  activeSubDropdown,
  componentVisibility,
  onMenuClick,
  onSubMenuClick,
  onItemClick
}) {
  const renderMenuItem = (item, level = 0) => {
    if (typeof item === 'string') {
      // Handle separator
      if (item === '---') {
        return (
          <li key="separator" className="border-t border-neutral-600 my-1"></li>
        );
      }
      
      // Handle visibility toggle items
      if (visibilityMap[item]) {
        const componentKey = visibilityMap[item];
        const isVisible = componentVisibility[componentKey];
        
        return (
          <li
            key={item}
            onClick={() => onItemClick(item)}
            className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-[13px] whitespace-nowrap flex items-center justify-between"
          >
            <span>{item}</span>
            <div className={`w-3 h-3 border border-neutral-400 rounded ${isVisible ? 'bg-neutral-400' : 'bg-transparent'}`}>
              {isVisible && (
                <div className="w-1.5 h-1.5 bg-neutral-700 rounded-sm m-0.5"></div>
              )}
            </div>
          </li>
        );
      }
      
      // File menu items with icons
      const IconComponent = fileMenuIcons[item] || sceneMenuIcons[item];
      
      // Regular menu items
      return (
        <li
          key={item}
          onClick={() => onItemClick(item)}
          className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-[13px] whitespace-nowrap flex items-center space-x-2"
        >
          {IconComponent && <IconComponent size={14} className="text-neutral-400" />}
          <span>{item}</span>
        </li>
      );
    }

    if (typeof item === 'object' && item.submenu) {
      const isActive = activeSubDropdown === item.name;
      return (
        <li key={item.name} className="relative">
          <div
            onClick={() => onSubMenuClick(item.name)}
            className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-sm whitespace-nowrap flex items-center justify-between"
          >
            {item.name}
            <ChevronRight size={14} className={isActive ? 'rotate-90' : ''} />
          </div>
          {isActive && (
            <ul className="absolute left-full top-0 bg-neutral-700 border border-neutral-600 rounded shadow-lg min-w-max z-50">
              {item.submenu.map((subItem) => renderMenuItem(subItem, level + 1))}
            </ul>
          )}
        </li>
      );
    }
  };

  return (
    <li className="relative">
      <button
        onClick={() => onMenuClick(menuName)}
        className={`px-2 sm:px-4 py-2 sm:py-3 cursor-pointer text-white ${
          activeDropdown === menuName ? 'bg-neutral-600' : 'hover:bg-neutral-600'
        }`}
      >
        {menuName}
      </button>
      
      {activeDropdown === menuName && (
        <ul className="absolute top-full left-0 bg-neutral-700 border border-neutral-600 rounded shadow-lg min-w-max z-50">
          {items.map((item) => renderMenuItem(item))}
        </ul>
      )}
    </li>
  );
}
