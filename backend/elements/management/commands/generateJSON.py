import json
import os
from datetime import datetime
from typing import Dict, Any, List

from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings

from ...models import (
    Element, Isotope, DecayPath, NeutronReaction, 
    NeutronCrossSection, GammaSpectrum, ElementComposition, IsotopeSource
)


class Command(BaseCommand):
    help = "Export all nuclear data to JSON files"

    def add_arguments(self, parser):
        parser.add_argument(
            "--output-dir", 
            type=str, 
            default="nuclear_data_export",
            help="Directory to save JSON files (default: nuclear_data_export)"
        )
        parser.add_argument(
            "--include-project-data", 
            action="store_true",
            help="Include project-specific data (compositions, sources)"
        )
        parser.add_argument(
            "--pretty-print", 
            action="store_true",
            help="Format JSON with indentation for readability"
        )

    @transaction.atomic
    def handle(self, *args, **options):
        output_dir = options["output_dir"]
        include_project_data = options["include_project_data"]
        pretty_print = options["pretty_print"]
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        self.stdout.write(f"Exporting nuclear data to {output_dir}/")
        
        # Export core nuclear data
        self.export_elements(output_dir, pretty_print)
        self.export_isotopes(output_dir, pretty_print)
        self.export_decay_paths(output_dir, pretty_print)
        self.export_neutron_reactions(output_dir, pretty_print)
        self.export_neutron_cross_sections(output_dir, pretty_print)
        self.export_gamma_spectra(output_dir, pretty_print)
        
        # Export project-specific data if requested
        if include_project_data:
            self.export_element_compositions(output_dir, pretty_print)
            self.export_isotope_sources(output_dir, pretty_print)
        
        # Create a summary file
        self.create_summary_file(output_dir, pretty_print)
        
        self.stdout.write(
            self.style.SUCCESS(f"✅ Nuclear data export completed to {output_dir}/")
        )

    def export_elements(self, output_dir: str, pretty_print: bool):
        """Export all elements to JSON"""
        self.stdout.write("📋 Exporting elements...")
        
        elements = Element.objects.all().order_by('atomic_number')
        elements_data = []
        
        for element in elements:
            element_data = {
                "id": element.id,
                "atomic_number": element.atomic_number,
                "symbol": element.symbol,
                "name": element.name,
                "atomic_mass": element.atomic_mass,
                "density": element.density,
                "melting_point": element.melting_point,
                "boiling_point": element.boiling_point,
                "created_at": element.created_at.isoformat() if element.created_at else None,
                "updated_at": element.updated_at.isoformat() if element.updated_at else None,
                "isotope_count": element.isotopes.count()
            }
            elements_data.append(element_data)
        
        self._save_json(
            os.path.join(output_dir, "elements.json"), 
            elements_data, 
            pretty_print
        )
        
        self.stdout.write(f"   ✅ Exported {len(elements_data)} elements")

    def export_isotopes(self, output_dir: str, pretty_print: bool):
        """Export all isotopes to JSON"""
        self.stdout.write("⚛️ Exporting isotopes...")
        
        isotopes = Isotope.objects.select_related('element').all().order_by(
            'element__atomic_number', 'mass_number'
        )
        isotopes_data = []
        
        for isotope in isotopes:
            isotope_data = {
                "id": isotope.id,
                "element_id": isotope.element.id,
                "element_symbol": isotope.element.symbol,
                "element_name": isotope.element.name,
                "atomic_number": isotope.element.atomic_number,
                "mass_number": isotope.mass_number,
                "neutron_number": isotope.neutron_number,
                "half_life": isotope.half_life,
                "decay_mode": isotope.decay_mode,
                "decay_product": isotope.decay_product,
                "is_stable": isotope.is_stable,
                "abundance": isotope.abundance,
                "spin_parity": isotope.spin_parity,
                "magnetic_moment": isotope.magnetic_moment,
                "created_at": isotope.created_at.isoformat() if isotope.created_at else None,
                "updated_at": isotope.updated_at.isoformat() if isotope.updated_at else None,
                "decay_paths_count": isotope.decay_children.count(),
                "neutron_reactions_count": isotope.neutron_reactions_as_target.count(),
                "cross_sections_count": isotope.cross_sections.count(),
                "gamma_spectra_count": isotope.gamma_spectra.count()
            }
            isotopes_data.append(isotope_data)
        
        self._save_json(
            os.path.join(output_dir, "isotopes.json"), 
            isotopes_data, 
            pretty_print
        )
        
        self.stdout.write(f"   ✅ Exported {len(isotopes_data)} isotopes")

    def export_decay_paths(self, output_dir: str, pretty_print: bool):
        """Export all decay paths to JSON"""
        self.stdout.write("🔄 Exporting decay paths...")
        
        decay_paths = DecayPath.objects.select_related(
            'parent_isotope__element', 'daughter_isotope__element'
        ).all().order_by(
            'parent_isotope__element__atomic_number', 
            'parent_isotope__mass_number'
        )
        decay_paths_data = []
        
        for path in decay_paths:
            path_data = {
                "id": path.id,
                "parent_isotope_id": path.parent_isotope.id,
                "parent_isotope": f"{path.parent_isotope.element.symbol}-{path.parent_isotope.mass_number}",
                "parent_element_symbol": path.parent_isotope.element.symbol,
                "parent_mass_number": path.parent_isotope.mass_number,
                "daughter_isotope_id": path.daughter_isotope.id,
                "daughter_isotope": f"{path.daughter_isotope.element.symbol}-{path.daughter_isotope.mass_number}",
                "daughter_element_symbol": path.daughter_isotope.element.symbol,
                "daughter_mass_number": path.daughter_isotope.mass_number,
                "decay_type": path.decay_type,
                "decay_type_display": dict(DecayPath.DECAY_TYPES).get(path.decay_type, path.decay_type),
                "branching_ratio": path.branching_ratio,
                "q_value": path.q_value,
                "half_life": path.half_life,
                "energy_released": path.energy_released,
                "created_at": path.created_at.isoformat() if path.created_at else None,
                "updated_at": path.updated_at.isoformat() if path.updated_at else None
            }
            decay_paths_data.append(path_data)
        
        self._save_json(
            os.path.join(output_dir, "decay_paths.json"), 
            decay_paths_data, 
            pretty_print
        )
        
        self.stdout.write(f"   ✅ Exported {len(decay_paths_data)} decay paths")

    def export_neutron_reactions(self, output_dir: str, pretty_print: bool):
        """Export all neutron reactions to JSON"""
        self.stdout.write("⚡ Exporting neutron reactions...")
        
        reactions = NeutronReaction.objects.select_related(
            'target_isotope__element', 'product_isotope__element'
        ).all().order_by(
            'target_isotope__element__atomic_number', 
            'target_isotope__mass_number'
        )
        reactions_data = []
        
        for reaction in reactions:
            reaction_data = {
                "id": reaction.id,
                "target_isotope_id": reaction.target_isotope.id,
                "target_isotope": f"{reaction.target_isotope.element.symbol}-{reaction.target_isotope.mass_number}",
                "target_element_symbol": reaction.target_isotope.element.symbol,
                "target_mass_number": reaction.target_isotope.mass_number,
                "product_isotope_id": reaction.product_isotope.id if reaction.product_isotope else None,
                "product_isotope": f"{reaction.product_isotope.element.symbol}-{reaction.product_isotope.mass_number}" if reaction.product_isotope else None,
                "product_element_symbol": reaction.product_isotope.element.symbol if reaction.product_isotope else None,
                "product_mass_number": reaction.product_isotope.mass_number if reaction.product_isotope else None,
                "reaction_type": reaction.reaction_type,
                "reaction_type_display": dict(NeutronReaction.REACTION_TYPES).get(reaction.reaction_type, reaction.reaction_type),
                "threshold_energy": reaction.threshold_energy,
                "q_value": reaction.q_value,
                "resonance_energy": reaction.resonance_energy,
                "resonance_width": reaction.resonance_width,
                "created_at": reaction.created_at.isoformat() if reaction.created_at else None,
                "updated_at": reaction.updated_at.isoformat() if reaction.updated_at else None
            }
            reactions_data.append(reaction_data)
        
        self._save_json(
            os.path.join(output_dir, "neutron_reactions.json"), 
            reactions_data, 
            pretty_print
        )
        
        self.stdout.write(f"   ✅ Exported {len(reactions_data)} neutron reactions")

    def export_neutron_cross_sections(self, output_dir: str, pretty_print: bool):
        """Export all neutron cross sections to JSON"""
        self.stdout.write("📊 Exporting neutron cross sections...")
        
        cross_sections = NeutronCrossSection.objects.select_related(
            'isotope__element', 'neutron_reaction'
        ).all().order_by(
            'isotope__element__atomic_number', 
            'isotope__mass_number', 
            'energy'
        )
        cross_sections_data = []
        
        for cs in cross_sections:
            cs_data = {
                "id": cs.id,
                "isotope_id": cs.isotope.id,
                "isotope": f"{cs.isotope.element.symbol}-{cs.isotope.mass_number}",
                "element_symbol": cs.isotope.element.symbol,
                "mass_number": cs.isotope.mass_number,
                "target": cs.target,
                "reaction": cs.reaction,
                "origin": cs.origin,
                "energy": cs.energy,
                "cross_section": cs.cross_section,
                "uncertainty": cs.uncertainty,
                "range_url": cs.range_url,
                "isotope_url": cs.isotope_url,
                "neutron_reaction_id": cs.neutron_reaction.id if cs.neutron_reaction else None,
                "created_at": cs.created_at.isoformat() if cs.created_at else None,
                "updated_at": cs.updated_at.isoformat() if cs.updated_at else None
            }
            cross_sections_data.append(cs_data)
        
        self._save_json(
            os.path.join(output_dir, "neutron_cross_sections.json"), 
            cross_sections_data, 
            pretty_print
        )
        
        self.stdout.write(f"   ✅ Exported {len(cross_sections_data)} cross section data points")

    def export_gamma_spectra(self, output_dir: str, pretty_print: bool):
        """Export all gamma spectra to JSON"""
        self.stdout.write("🌌 Exporting gamma spectra...")
        
        spectra = GammaSpectrum.objects.select_related('isotope__element').all().order_by(
            'isotope__element__atomic_number', 
            'isotope__mass_number', 
            'energy'
        )
        spectra_data = []
        
        for spectrum in spectra:
            spectrum_data = {
                "id": spectrum.id,
                "isotope_id": spectrum.isotope.id,
                "isotope": f"{spectrum.isotope.element.symbol}-{spectrum.isotope.mass_number}",
                "element_symbol": spectrum.isotope.element.symbol,
                "mass_number": spectrum.isotope.mass_number,
                "energy": spectrum.energy,
                "intensity": spectrum.intensity,
                "multipolarity": spectrum.multipolarity,
                "origin": spectrum.origin,
                "created_at": spectrum.created_at.isoformat() if spectrum.created_at else None,
                "updated_at": spectrum.updated_at.isoformat() if spectrum.updated_at else None
            }
            spectra_data.append(spectrum_data)
        
        self._save_json(
            os.path.join(output_dir, "gamma_spectra.json"), 
            spectra_data, 
            pretty_print
        )
        
        self.stdout.write(f"   ✅ Exported {len(spectra_data)} gamma spectrum data points")

    def export_element_compositions(self, output_dir: str, pretty_print: bool):
        """Export all element compositions to JSON"""
        self.stdout.write("🧪 Exporting element compositions...")
        
        compositions = ElementComposition.objects.select_related('project').all().order_by('name')
        compositions_data = []
        
        for comp in compositions:
            comp_data = {
                "id": comp.id,
                "project_id": comp.project.id,
                "project_name": comp.project.name,
                "name": comp.name,
                "description": comp.description,
                "density": comp.density,
                "color": comp.color,
                "elements": comp.elements,
                "molecular_weight": comp.molecular_weight,
                "phase": comp.phase,
                "temperature": comp.temperature,
                "created_at": comp.created_at.isoformat() if comp.created_at else None,
                "updated_at": comp.updated_at.isoformat() if comp.updated_at else None
            }
            compositions_data.append(comp_data)
        
        self._save_json(
            os.path.join(output_dir, "element_compositions.json"), 
            compositions_data, 
            pretty_print
        )
        
        self.stdout.write(f"   ✅ Exported {len(compositions_data)} element compositions")

    def export_isotope_sources(self, output_dir: str, pretty_print: bool):
        """Export all isotope sources to JSON"""
        self.stdout.write("📡 Exporting isotope sources...")
        
        sources = IsotopeSource.objects.select_related(
            'project', 'isotope__element', 'geometry'
        ).all().order_by('name')
        sources_data = []
        
        for source in sources:
            source_data = {
                "id": source.id,
                "project_id": source.project.id,
                "project_name": source.project.name,
                "name": source.name,
                "description": source.description,
                "isotope_id": source.isotope.id,
                "isotope": f"{source.isotope.element.symbol}-{source.isotope.mass_number}",
                "element_symbol": source.isotope.element.symbol,
                "mass_number": source.isotope.mass_number,
                "activity": source.activity,
                "mass": source.mass,
                "volume": source.volume,
                "geometry_id": source.geometry.id if source.geometry else None,
                "source_type": source.source_type,
                "energy_spectrum": source.energy_spectrum,
                "created_at": source.created_at.isoformat() if source.created_at else None,
                "updated_at": source.updated_at.isoformat() if source.updated_at else None
            }
            sources_data.append(source_data)
        
        self._save_json(
            os.path.join(output_dir, "isotope_sources.json"), 
            sources_data, 
            pretty_print
        )
        
        self.stdout.write(f"   ✅ Exported {len(sources_data)} isotope sources")

    def create_summary_file(self, output_dir: str, pretty_print: bool):
        """Create a summary file with export statistics"""
        self.stdout.write("📋 Creating summary file...")
        
        # Count records
        summary_data = {
            "export_info": {
                "exported_at": datetime.now().isoformat(),
                "django_version": getattr(settings, 'DJANGO_VERSION', 'Unknown'),
                "database": getattr(settings, 'DATABASES', {}).get('default', {}).get('ENGINE', 'Unknown')
            },
            "record_counts": {
                "elements": Element.objects.count(),
                "isotopes": Isotope.objects.count(),
                "decay_paths": DecayPath.objects.count(),
                "neutron_reactions": NeutronReaction.objects.count(),
                "neutron_cross_sections": NeutronCrossSection.objects.count(),
                "gamma_spectra": GammaSpectrum.objects.count(),
                "element_compositions": ElementComposition.objects.count(),
                "isotope_sources": IsotopeSource.objects.count()
            },
            "files_exported": [
                "elements.json",
                "isotopes.json", 
                "decay_paths.json",
                "neutron_reactions.json",
                "neutron_cross_sections.json",
                "gamma_spectra.json"
            ],
            "data_relationships": {
                "elements_to_isotopes": "One-to-many (element.isotopes)",
                "isotopes_to_decay_paths": "One-to-many (isotope.decay_children)",
                "isotopes_to_neutron_reactions": "One-to-many (isotope.neutron_reactions_as_target)",
                "isotopes_to_cross_sections": "One-to-many (isotope.cross_sections)",
                "isotopes_to_gamma_spectra": "One-to-many (isotope.gamma_spectra)",
                "neutron_reactions_to_cross_sections": "One-to-many (neutron_reaction.cross_section_data)"
            },
            "usage_notes": {
                "elements": "Core element data with atomic properties",
                "isotopes": "Nuclear isotopes with decay properties, linked to elements",
                "decay_paths": "Decay pathways between isotopes with branching ratios",
                "neutron_reactions": "Neutron-induced nuclear reactions",
                "neutron_cross_sections": "Cross section data for neutron reactions",
                "gamma_spectra": "Gamma ray emission spectra for isotopes"
            }
        }
        
        # Add project data if included
        if ElementComposition.objects.exists():
            summary_data["files_exported"].append("element_compositions.json")
        if IsotopeSource.objects.exists():
            summary_data["files_exported"].append("isotope_sources.json")
        
        self._save_json(
            os.path.join(output_dir, "export_summary.json"), 
            summary_data, 
            pretty_print
        )
        
        self.stdout.write("   ✅ Created export summary")

    def _save_json(self, filepath: str, data: List[Dict[str, Any]], pretty_print: bool):
        """Save data to JSON file"""
        indent = 2 if pretty_print else None
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=indent, ensure_ascii=False, default=str)
