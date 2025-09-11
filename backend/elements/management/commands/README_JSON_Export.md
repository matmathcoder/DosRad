# Nuclear Data JSON Export

This directory contains Django management commands for exporting nuclear data to JSON format for use in external applications, data analysis, and research.

## Commands

### `generateJSON.py`
Exports all nuclear data from the Django database to structured JSON files.

### `getElementsMendeleev.py`
Imports elements and isotopes from the mendeleev Python package into the database.

### `example_usage.py`
Demonstrates how to use the exported JSON data for nuclear physics calculations.

## Usage

### 1. Export Nuclear Data to JSON

```bash
# Basic export to default directory
python manage.py generateJSON

# Export to custom directory
python manage.py generateJSON --output-dir my_nuclear_data

# Include project-specific data (compositions, sources)
python manage.py generateJSON --include-project-data

# Pretty-print JSON for readability
python manage.py generateJSON --pretty-print

# All options combined
python manage.py generateJSON --output-dir nuclear_data --include-project-data --pretty-print
```

### 2. Import Elements from Mendeleev

```bash
# Import all elements (up to Z=118)
python manage.py getElementsMendeleev

# Import only first 20 elements
python manage.py getElementsMendeleev --max-z 20
```

## Exported Files

The export creates the following JSON files:

### Core Nuclear Data
- **`elements.json`** - Chemical elements with atomic properties
- **`isotopes.json`** - Nuclear isotopes with decay properties
- **`decay_paths.json`** - Decay pathways between isotopes
- **`neutron_reactions.json`** - Neutron-induced nuclear reactions
- **`neutron_cross_sections.json`** - Cross section data for neutron reactions
- **`gamma_spectra.json`** - Gamma ray emission spectra

### Project-Specific Data (optional)
- **`element_compositions.json`** - Material compositions
- **`isotope_sources.json`** - Radiation sources

### Metadata
- **`export_summary.json`** - Export statistics and data relationships

## Data Structure

### Elements
```json
{
  "id": 1,
  "atomic_number": 1,
  "symbol": "H",
  "name": "Hydrogen",
  "atomic_mass": 1.008,
  "density": 0.00008988,
  "melting_point": 14.01,
  "boiling_point": 20.28,
  "isotope_count": 3
}
```

### Isotopes
```json
{
  "id": 1,
  "element_id": 1,
  "element_symbol": "H",
  "mass_number": 1,
  "neutron_number": 0,
  "half_life": "stable",
  "decay_mode": "",
  "is_stable": true,
  "abundance": 99.9885
}
```

### Decay Paths
```json
{
  "id": 1,
  "parent_isotope_id": 2,
  "parent_isotope": "H-2",
  "daughter_isotope_id": 1,
  "daughter_isotope": "H-1",
  "decay_type": "beta_minus",
  "branching_ratio": 1.0,
  "q_value": 0.782
}
```

## Data Relationships

```
Elements (1) ──→ (many) Isotopes
    │
    └─── (many) Decay Paths
    │
    └─── (many) Neutron Reactions
    │
    └─── (many) Cross Sections
    │
    └─── (many) Gamma Spectra
```

## Usage Examples

### Python Script Example
```python
import json

# Load nuclear data
with open('nuclear_data_export/elements.json', 'r') as f:
    elements = json.load(f)

with open('nuclear_data_export/isotopes.json', 'r') as f:
    isotopes = json.load(f)

# Find uranium isotopes
u_isotopes = [iso for iso in isotopes if iso['element_symbol'] == 'U']
print(f"Found {len(u_isotopes)} uranium isotopes")

# Find stable isotopes
stable_isotopes = [iso for iso in isotopes if iso['is_stable']]
print(f"Found {len(stable_isotopes)} stable isotopes")
```

### JavaScript/Node.js Example
```javascript
const fs = require('fs');

// Load nuclear data
const elements = JSON.parse(fs.readFileSync('nuclear_data_export/elements.json', 'utf8'));
const isotopes = JSON.parse(fs.readFileSync('nuclear_data_export/isotopes.json', 'utf8'));

// Find elements by atomic number
const heavyElements = elements.filter(el => el.atomic_number > 80);
console.log(`Found ${heavyElements.length} heavy elements`);

// Find radioactive isotopes
const radioactive = isotopes.filter(iso => !iso.is_stable);
console.log(`Found ${radioactive.length} radioactive isotopes`);
```

## Applications

The exported JSON data can be used for:

- **Nuclear Physics Research** - Analysis of decay chains, cross sections
- **Radiation Simulation** - Monte Carlo simulations, dose calculations
- **Educational Tools** - Interactive periodic tables, decay simulators
- **Data Analysis** - Statistical analysis of nuclear properties
- **Web Applications** - Frontend nuclear data visualization
- **Mobile Apps** - Offline nuclear data access
- **Scientific Computing** - Integration with Python/Matlab/R

## File Sizes

Typical file sizes (approximate):
- `elements.json`: ~50 KB (118 elements)
- `isotopes.json`: ~500 KB (3000+ isotopes)
- `decay_paths.json`: ~200 KB (1000+ decay paths)
- `neutron_reactions.json`: ~100 KB (500+ reactions)
- `neutron_cross_sections.json`: ~10 MB (100,000+ data points)
- `gamma_spectra.json`: ~5 MB (50,000+ spectrum points)

## Performance Notes

- Export time: ~30-60 seconds for full dataset
- Memory usage: ~100-200 MB during export
- JSON parsing: Fast with modern JSON libraries
- Database queries: Optimized with select_related() for performance

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   # Ensure write permissions to output directory
   chmod 755 nuclear_data_export/
   ```

2. **Memory Issues**
   ```bash
   # Export in smaller chunks (modify script)
   python manage.py generateJSON --max-records 10000
   ```

3. **Database Connection**
   ```bash
   # Ensure database is accessible
   python manage.py dbshell
   ```

### Support

For issues or questions:
1. Check Django logs: `python manage.py runserver --verbosity=2`
2. Verify database connectivity
3. Check file permissions
4. Review export summary for record counts

## License

This nuclear data export follows the same license as the parent Mercurad project.
