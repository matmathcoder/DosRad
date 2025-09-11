#!/usr/bin/env python3
"""
Example usage of the nuclear data JSON export

This script demonstrates how to use the exported JSON files
for various nuclear physics calculations and data analysis.
"""

import json
import os
from typing import Dict, List, Any


def load_nuclear_data(data_dir: str = "nuclear_data_export") -> Dict[str, List[Dict]]:
    """Load all nuclear data from JSON files"""
    data = {}
    
    files = [
        "elements.json",
        "isotopes.json", 
        "decay_paths.json",
        "neutron_reactions.json",
        "neutron_cross_sections.json",
        "gamma_spectra.json"
    ]
    
    for filename in files:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                data[filename.replace('.json', '')] = json.load(f)
                print(f"✅ Loaded {len(data[filename.replace('.json', '')])} records from {filename}")
        else:
            print(f"⚠️  File not found: {filepath}")
    
    return data


def find_element_by_symbol(data: Dict[str, List[Dict]], symbol: str) -> Dict[str, Any]:
    """Find element by symbol (e.g., 'U', 'Pu', 'Cs')"""
    for element in data.get('elements', []):
        if element['symbol'].upper() == symbol.upper():
            return element
    return None


def find_isotopes_of_element(data: Dict[str, List[Dict]], element_symbol: str) -> List[Dict[str, Any]]:
    """Find all isotopes of a given element"""
    isotopes = []
    for isotope in data.get('isotopes', []):
        if isotope['element_symbol'].upper() == element_symbol.upper():
            isotopes.append(isotope)
    return isotopes


def find_decay_chain(data: Dict[str, List[Dict]], parent_isotope_id: int) -> List[Dict[str, Any]]:
    """Find decay chain starting from a parent isotope"""
    chain = []
    current_id = parent_isotope_id
    
    while current_id:
        # Find decay paths for current isotope
        decay_paths = []
        for path in data.get('decay_paths', []):
            if path['parent_isotope_id'] == current_id:
                decay_paths.append(path)
        
        if not decay_paths:
            break
            
        # Add to chain (for simplicity, take the first decay path)
        if decay_paths:
            chain.append(decay_paths[0])
            current_id = decay_paths[0]['daughter_isotope_id']
        else:
            break
    
    return chain


def calculate_activity_decay(data: Dict[str, List[Dict]], isotope_id: int, 
                           initial_activity: float, time_hours: float) -> float:
    """Calculate activity after decay time (simplified calculation)"""
    # Find isotope
    isotope = None
    for iso in data.get('isotopes', []):
        if iso['id'] == isotope_id:
            isotope = iso
            break
    
    if not isotope or not isotope['half_life']:
        return initial_activity
    
    # Parse half-life (simplified - assumes hours)
    half_life_str = isotope['half_life'].lower()
    if 'hour' in half_life_str or 'h' in half_life_str:
        # Extract number from string (very simplified)
        try:
            half_life_hours = float(''.join(filter(str.isdigit, half_life_str.split()[0])))
        except:
            half_life_hours = 1.0  # Default fallback
    else:
        half_life_hours = 1.0  # Default fallback
    
    # Calculate decay
    decay_constant = 0.693 / half_life_hours  # ln(2) / half_life
    activity = initial_activity * (2.71828 ** (-decay_constant * time_hours))
    
    return activity


def find_gamma_peaks(data: Dict[str, List[Dict]], isotope_id: int, 
                    min_intensity: float = 1.0) -> List[Dict[str, Any]]:
    """Find gamma peaks for an isotope above minimum intensity"""
    peaks = []
    for spectrum in data.get('gamma_spectra', []):
        if (spectrum['isotope_id'] == isotope_id and 
            spectrum['intensity'] >= min_intensity):
            peaks.append(spectrum)
    
    # Sort by energy
    peaks.sort(key=lambda x: x['energy'])
    return peaks


def find_neutron_cross_sections(data: Dict[str, List[Dict]], isotope_id: int, 
                               energy_range: tuple = None) -> List[Dict[str, Any]]:
    """Find neutron cross sections for an isotope in energy range"""
    cross_sections = []
    for cs in data.get('neutron_cross_sections', []):
        if cs['isotope_id'] == isotope_id:
            if energy_range:
                if energy_range[0] <= cs['energy'] <= energy_range[1]:
                    cross_sections.append(cs)
            else:
                cross_sections.append(cs)
    
    # Sort by energy
    cross_sections.sort(key=lambda x: x['energy'])
    return cross_sections


def main():
    """Example usage of nuclear data"""
    print("🔬 Nuclear Data Analysis Example")
    print("=" * 50)
    
    # Load data
    data = load_nuclear_data()
    
    if not data:
        print("❌ No data loaded. Make sure to run the export command first:")
        print("   python manage.py generateJSON")
        return
    
    print(f"\n📊 Data Summary:")
    for key, records in data.items():
        print(f"   {key}: {len(records)} records")
    
    # Example 1: Find uranium isotopes
    print(f"\n🔍 Example 1: Uranium Isotopes")
    u_isotopes = find_isotopes_of_element(data, 'U')
    print(f"Found {len(u_isotopes)} uranium isotopes:")
    for iso in u_isotopes[:5]:  # Show first 5
        print(f"   {iso['element_symbol']}-{iso['mass_number']}: "
              f"Half-life: {iso['half_life']}, "
              f"Stable: {iso['is_stable']}")
    
    # Example 2: Find cesium element
    print(f"\n🔍 Example 2: Cesium Element")
    cs_element = find_element_by_symbol(data, 'Cs')
    if cs_element:
        print(f"Cesium: {cs_element['name']} ({cs_element['symbol']})")
        print(f"   Atomic number: {cs_element['atomic_number']}")
        print(f"   Atomic mass: {cs_element['atomic_mass']}")
        print(f"   Density: {cs_element['density']} g/cm³")
    
    # Example 3: Find gamma peaks for Cs-137
    print(f"\n🔍 Example 3: Cs-137 Gamma Peaks")
    cs_137 = None
    for iso in data.get('isotopes', []):
        if iso['element_symbol'] == 'Cs' and iso['mass_number'] == 137:
            cs_137 = iso
            break
    
    if cs_137:
        peaks = find_gamma_peaks(data, cs_137['id'], min_intensity=5.0)
        print(f"Found {len(peaks)} gamma peaks for Cs-137 (intensity ≥ 5%):")
        for peak in peaks[:3]:  # Show first 3
            print(f"   {peak['energy']} keV, intensity: {peak['intensity']}%")
    
    # Example 4: Activity decay calculation
    print(f"\n🔍 Example 4: Activity Decay")
    if cs_137:
        initial_activity = 1000.0  # Bq
        time_hours = 30.0  # 30 years in hours (simplified)
        final_activity = calculate_activity_decay(data, cs_137['id'], initial_activity, time_hours)
        print(f"Initial activity: {initial_activity} Bq")
        print(f"Activity after {time_hours} hours: {final_activity:.2f} Bq")
    
    # Example 5: Neutron cross sections for U-235
    print(f"\n🔍 Example 5: U-235 Neutron Cross Sections")
    u_235 = None
    for iso in data.get('isotopes', []):
        if iso['element_symbol'] == 'U' and iso['mass_number'] == 235:
            u_235 = iso
            break
    
    if u_235:
        cross_sections = find_neutron_cross_sections(data, u_235['id'], energy_range=(0.1, 10.0))
        print(f"Found {len(cross_sections)} cross section data points for U-235 (0.1-10 eV):")
        for cs in cross_sections[:3]:  # Show first 3
            print(f"   {cs['energy']} eV: {cs['cross_section']} b ({cs['reaction']})")
    
    print(f"\n✅ Analysis complete!")


if __name__ == "__main__":
    main()
