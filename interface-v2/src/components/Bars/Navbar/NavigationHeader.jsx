import React from 'react';

/**
 * Navigation Header Component
 * Renders the logo and main menu items
 */
export default function NavigationHeader({
  menuStructure,
  activeDropdown,
  activeSubDropdown,
  componentVisibility,
  onMenuClick,
  onSubMenuClick,
  onItemClick,
  MenuDropdownComponent
}) {
  return (
    <div className="flex items-center">
      {/* INVAP Logo */}
      <div className="flex items-center mr-4">
        <img 
          src="/INVAP.webp" 
          alt="INVAP Logo" 
          className="absolute left-0 w-24 h-20 object-contain"
        />
      </div>
      
      {/* Menu items */}
      <ul className="flex text-[13px] ml-20">
        {Object.keys(menuStructure).map((menuName) => (
          <MenuDropdownComponent
            key={menuName}
            menuName={menuName}
            items={menuStructure[menuName]}
            activeDropdown={activeDropdown}
            activeSubDropdown={activeSubDropdown}
            componentVisibility={componentVisibility}
            onMenuClick={onMenuClick}
            onSubMenuClick={onSubMenuClick}
            onItemClick={onItemClick}
          />
        ))}
      </ul>
    </div>
  );
}
