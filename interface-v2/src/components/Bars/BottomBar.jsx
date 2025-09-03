import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut,
  Languages,
  Ruler,
  Settings,
  Zap,
  ChevronDown
} from 'lucide-react';
import {t, getTranslations} from '../../utils/translations';
export default function BottomBar({ onZoomChange, onLanguageChange, onUnitChange, onModeChange }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  // Listen for zoom changes from external sources (like mouse wheel)
  useEffect(() => {
    const handleZoomUpdate = (event) => {
      setZoomLevel(event.detail.zoom);
    };
    
    window.addEventListener('zoomUpdate', handleZoomUpdate);
    return () => window.removeEventListener('zoomUpdate', handleZoomUpdate);
  }, []);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedUnit, setSelectedUnit] = useState('cm');
  const [sceneMode, setSceneMode] = useState('nominal');
  const [isExpertMode, setIsExpertMode] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const languages = [
    { code: 'en', name: t('english', currentLanguage), flag: '🇺🇸' },
    { code: 'es', name: t('spanish', currentLanguage), flag: '🇪🇸' },
    { code: 'fr', name: t('french', currentLanguage), flag: '🇫🇷' },
    { code: 'de', name: t('german', currentLanguage), flag: '🇩🇪' },
    { code: 'it', name: t('italian', currentLanguage), flag: '🇮🇹' },
    { code: 'pt', name: t('portuguese', currentLanguage), flag: '🇵🇹' }
  ];

  const units = [
    { code: 'mm', name: t('millimeters', currentLanguage), symbol: 'mm' },
    { code: 'cm', name: t('centimeters', currentLanguage), symbol: 'cm' },
    { code: 'm', name: t('meters', currentLanguage), symbol: 'm' },
    { code: 'in', name: t('inches', currentLanguage), symbol: 'in' },
    { code: 'ft', name: t('feet', currentLanguage), symbol: 'ft' }
  ];

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 500);
    setZoomLevel(newZoom);
    onZoomChange && onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 10);
    setZoomLevel(newZoom);
    onZoomChange && onZoomChange(newZoom);
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
    onZoomChange && onZoomChange(100);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.code);
    setCurrentLanguage(language.code);
    setShowLanguageDropdown(false);
    onLanguageChange && onLanguageChange(language);
    console.log(`Language changed to: ${language.name}`);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit.code);
    setShowUnitDropdown(false);
    onUnitChange && onUnitChange(unit);
    console.log(`Unit changed to: ${unit.name}`);
  };

  const handleSceneModeToggle = () => {
    const newMode = sceneMode === 'nominal' ? 'expert' : 'nominal';
    setSceneMode(newMode);
    onModeChange && onModeChange({ type: 'scene', mode: newMode });
    console.log(`Scene mode changed to: ${newMode}`);
  };

  const handleExpertModeToggle = () => {
    setIsExpertMode(!isExpertMode);
    onModeChange && onModeChange({ type: 'expert', enabled: !isExpertMode });
    console.log(`Expert mode ${!isExpertMode ? 'enabled' : 'disabled'}`);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowLanguageDropdown(false);
        setShowUnitDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectedLanguageObj = languages.find(lang => lang.code === selectedLanguage);
  const currentUnit = units.find(unit => unit.code === selectedUnit);

  return (
    <div className="bg-neutral-700 rounded-lg shadow-lg pointer-events-auto">
      <div className="flex items-center px-4 py-2 gap-4">
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 border-r border-neutral-600 pr-4">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-neutral-600 rounded-md text-white transition-colors"
            title={t('zoomOut', currentLanguage)}
          >
            <ZoomOut size={16} />
          </button>
          
          <button
            onClick={handleZoomReset}
            className="px-3 py-1 hover:bg-neutral-600 rounded-md text-white font-mono min-w-[60px] transition-colors"
            title={t('resetZoom', currentLanguage)}
          >
            {zoomLevel}%
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-neutral-600 rounded-md text-white transition-colors"
            title={t('zoomIn', currentLanguage)}
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Language Selector */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-600 rounded-md text-white transition-colors"
            title={t('language', currentLanguage)}
          >
            <Languages size={16} />
            <span className="text-sm">{selectedLanguageObj?.flag}</span>
            <span className="text-sm font-medium">{selectedLanguage.toUpperCase()}</span>
            <ChevronDown size={14} className={`transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showLanguageDropdown && (
            <div className="absolute bottom-full mb-2 left-0 bg-neutral-800 border border-neutral-600 rounded-lg shadow-xl min-w-[180px] z-50">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-700 transition-colors ${
                    selectedLanguage === language.code ? 'bg-neutral-600' : ''
                  } first:rounded-t-lg last:rounded-b-lg`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{language.code.toUpperCase()}</div>
                    <div className="text-neutral-400 text-xs">{language.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Unit Selector */}
        <div className="relative dropdown-container border-r border-neutral-600 pr-4">
          <button
            onClick={() => setShowUnitDropdown(!showUnitDropdown)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-600 rounded-md text-white transition-colors"
            title={t('units', currentLanguage)}
          >
            <Ruler size={16} />
            <span className="text-sm font-medium">{currentUnit?.symbol}</span>
            <ChevronDown size={14} className={`transition-transform ${showUnitDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showUnitDropdown && (
            <div className="absolute bottom-full mb-2 left-0 bg-neutral-800 border border-neutral-600 rounded-lg shadow-xl min-w-[160px] z-50">
              {units.map((unit) => (
                <button
                  key={unit.code}
                  onClick={() => handleUnitSelect(unit)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-700 transition-colors ${
                    selectedUnit === unit.code ? 'bg-neutral-600' : ''
                  } first:rounded-t-lg last:rounded-b-lg`}
                >
                  <div>
                    <div className="text-white text-sm font-medium">{unit.symbol}</div>
                    <div className="text-neutral-400 text-xs">{unit.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scene Mode Toggle */}
        <button
          onClick={handleSceneModeToggle}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            sceneMode === 'nominal' 
              ? 'bg-neutral-500 hover:bg-neutral-400 text-white' 
              : 'bg-neutral-600 hover:bg-neutral-500 text-white'
          }`}
          title={`${sceneMode === 'nominal' ? t('nominalScene', currentLanguage) : t('expertScene', currentLanguage)}`}
        >
          <Settings size={16} />
          <span className="text-sm font-medium">
            {sceneMode === 'nominal' ? t('nominalScene', currentLanguage) : t('expertScene', currentLanguage)}
          </span>
        </button>

        {/* Expert Mode Toggle */}
        <button
          onClick={handleExpertModeToggle}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            isExpertMode 
              ? 'bg-neutral-500 hover:bg-neutral-400 text-white' 
              : 'bg-neutral-600 hover:bg-neutral-500 text-white'
          }`}
          title={`${t('expertMode', currentLanguage)} ${isExpertMode ? t('enabled', currentLanguage) : t('disabled', currentLanguage)}`}
        >
          <Zap size={16} />
          <span className="text-sm font-medium">{t('expertMode', currentLanguage)}</span>
        </button>

      </div>
    </div>
  );
}
