import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Atom } from 'lucide-react';
import { searchElements, getIsotopes } from '../../utils/decaySimulatorAPI';

export default function ElementSelector({
  onElementSelect,
  onIsotopeSelect,
  selectedElement,
  selectedIsotope
}) {
  const [elementQuery, setElementQuery] = useState('');
  const [elementResults, setElementResults] = useState([]);
  const [isotopes, setIsotopes] = useState([]);
  const [showElementDropdown, setShowElementDropdown] = useState(false);
  const [showIsotopeDropdown, setShowIsotopeDropdown] = useState(false);
  const [isLoadingElements, setIsLoadingElements] = useState(false);
  const [isLoadingIsotopes, setIsLoadingIsotopes] = useState(false);

  const elementDropdownRef = useRef(null);
  const isotopeDropdownRef = useRef(null);

  // Search elements
  useEffect(() => {
    const searchElementsDebounced = async () => {
      if (elementQuery.length > 0) {
        setIsLoadingElements(true);
        try {
          const results = await searchElements(elementQuery);
          setElementResults(results);
          setShowElementDropdown(true);
        } catch (error) {
          console.error('Error searching elements:', error);
          setElementResults([]);
        } finally {
          setIsLoadingElements(false);
        }
      } else {
        setElementResults([]);
        setShowElementDropdown(false);
      }
    };

    const timeoutId = setTimeout(searchElementsDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [elementQuery]);

  // Load isotopes when element is selected
  useEffect(() => {
    const loadIsotopes = async () => {
      if (selectedElement) {
        setIsLoadingIsotopes(true);
        try {
          const isotopeData = await getIsotopes(selectedElement.id);
          setIsotopes(isotopeData);
        } catch (error) {
          console.error('Error loading isotopes:', error);
          setIsotopes([]);
        } finally {
          setIsLoadingIsotopes(false);
        }
      } else {
        setIsotopes([]);
      }
    };

    loadIsotopes();
  }, [selectedElement]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (elementDropdownRef.current && !elementDropdownRef.current.contains(event.target)) {
        setShowElementDropdown(false);
      }
      if (isotopeDropdownRef.current && !isotopeDropdownRef.current.contains(event.target)) {
        setShowIsotopeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleElementSelect = (element) => {
    onElementSelect(element);
    setElementQuery(`${element.symbol} - ${element.name}`);
    setShowElementDropdown(false);
    // Clear isotope selection when element changes
    if (selectedIsotope) {
      // Only clear if it's a different element
      if (selectedIsotope.element.id !== element.id) {
        onIsotopeSelect(null);
      }
    }
  };

  const handleIsotopeSelect = (isotope) => {
    onIsotopeSelect(isotope);
    setShowIsotopeDropdown(false);
  };

  return (
    <div className="space-y-4">
      {/* Element Selector */}
      <div className="relative" ref={elementDropdownRef}>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Select Element
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-500" />
          </div>
          <input
            type="text"
            value={elementQuery}
            onChange={(e) => setElementQuery(e.target.value)}
            onFocus={() => elementQuery && setShowElementDropdown(true)}
            placeholder="Search by symbol, name, or atomic number (e.g., U, Uranium, 92)"
            className="w-full pl-10 pr-4 py-3 bg-neutral-600 border border-neutral-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white placeholder-neutral-400"
          />
          {isLoadingElements && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            </div>
          )}
        </div>

        {/* Element Dropdown */}
        {showElementDropdown && elementResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-neutral-700 border border-neutral-600 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {elementResults.map((element) => (
              <div
                key={element.id}
                onClick={() => handleElementSelect(element)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-neutral-600 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-bold text-blue-400">
                      {element.atomic_number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">
                        {element.symbol}
                      </span>
                      <span className="text-neutral-400">-</span>
                      <span className="text-neutral-300">
                        {element.name}
                      </span>
                    </div>
                    {element.atomic_mass && (
                      <div className="text-xs text-neutral-500">
                        Atomic mass: {element.atomic_mass.toFixed(3)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Isotope Selector */}
      {selectedElement && (
        <div className="relative" ref={isotopeDropdownRef}>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Select Isotope of {selectedElement.symbol}
          </label>
          <div
            onClick={() => setShowIsotopeDropdown(!showIsotopeDropdown)}
            className="w-full px-4 py-3 bg-neutral-600 border border-neutral-500 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between text-white"
          >
            <div className="flex items-center">
              <Atom className="h-4 w-4 text-neutral-400 mr-3" />
              <span className="text-sm">
                {selectedIsotope
                  ? `${selectedIsotope.element.symbol}-${selectedIsotope.mass_number}`
                  : 'Choose an isotope...'}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                showIsotopeDropdown ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Isotope Dropdown */}
          {showIsotopeDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-neutral-700 border border-neutral-600 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {isLoadingIsotopes ? (
                <div className="px-4 py-2 text-center text-neutral-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mx-auto"></div>
                  <span className="ml-2">Loading isotopes...</span>
                </div>
              ) : isotopes.length > 0 ? (
                isotopes.map((isotope) => (
                  <div
                    key={isotope.id}
                    onClick={() => handleIsotopeSelect(isotope)}
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-neutral-600 transition-colors duration-150 ${
                      selectedIsotope?.id === isotope.id ? 'bg-neutral-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-800/30 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold text-green-400">
                            {isotope.mass_number}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {isotope.element.symbol}-{isotope.mass_number}
                          </div>
                          {isotope.half_life && (
                            <div className="text-xs text-neutral-400">
                              T₁/₂: {isotope.half_life}
                            </div>
                          )}
                        </div>
                      </div>
                      {isotope.decay_mode && (
                        <div className="text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded border border-orange-600/30">
                          {isotope.decay_mode}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-center text-neutral-400">
                  No isotopes found for {selectedElement.symbol}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Summary */}
      {selectedElement && selectedIsotope && (
        <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-lg p-4 border border-blue-600/30">
          <h3 className="font-semibold text-white mb-2">Selected Isotope</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Element:</span>
              <span className="font-medium text-white">{selectedElement.name} ({selectedElement.symbol})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Isotope:</span>
              <span className="font-medium text-white">{selectedIsotope.element.symbol}-{selectedIsotope.mass_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Atomic Number:</span>
              <span className="font-medium text-white">{selectedElement.atomic_number}</span>
            </div>
            {selectedIsotope.half_life && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Half-life:</span>
                <span className="font-medium text-white">{selectedIsotope.half_life}</span>
              </div>
            )}
            {selectedIsotope.decay_mode && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Decay Mode:</span>
                <span className="font-medium text-white">{selectedIsotope.decay_mode}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
