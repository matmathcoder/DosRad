from django.core.management.base import BaseCommand
from django.db import transaction
from elements.models import Element, Isotope, DecayPath, NeutronReaction
import re


class Command(BaseCommand):
    help = 'Calculate and populate decay chains and neutron reactions based on nuclear physics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recalculation even if relationships already exist',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        force = options['force']
        
        if force:
            self.stdout.write("Clearing existing decay paths and neutron reactions...")
            DecayPath.objects.all().delete()
            NeutronReaction.objects.all().delete()
        
        self.stdout.write("Calculating decay chains...")
        decay_paths_created = self.calculate_decay_paths()
        
        self.stdout.write("Calculating neutron reactions...")
        neutron_reactions_created = self.calculate_neutron_reactions()
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Created {decay_paths_created} decay paths and {neutron_reactions_created} neutron reactions"
            )
        )

    def calculate_decay_paths(self):
        """Calculate decay pathways based on decay modes and nuclear physics"""
        created_count = 0
        
        for isotope in Isotope.objects.select_related('element').all():
            decay_products = self._get_decay_products(isotope)
            
            for daughter_isotope, decay_type, branching_ratio in decay_products:
                decay_path, created = DecayPath.objects.get_or_create(
                    parent_isotope=isotope,
                    daughter_isotope=daughter_isotope,
                    decay_type=decay_type,
                    defaults={'branching_ratio': branching_ratio}
                )
                if created:
                    created_count += 1
                    self.stdout.write(f"  {decay_path}")
        
        return created_count

    def calculate_neutron_reactions(self):
        """Calculate neutron-induced reactions, primarily (n,γ)"""
        created_count = 0
        
        for isotope in Isotope.objects.select_related('element').all():
            # Neutron capture (n,γ): A + n → A+1
            try:
                product_isotope = Isotope.objects.get(
                    element=isotope.element,
                    mass_number=isotope.mass_number + 1
                )
                
                neutron_reaction, created = NeutronReaction.objects.get_or_create(
                    target_isotope=isotope,
                    product_isotope=product_isotope,
                    reaction_type='n_gamma',
                    defaults={'threshold_energy': 0.0}
                )
                if created:
                    created_count += 1
                    self.stdout.write(f"  {neutron_reaction}")
                    
            except Isotope.DoesNotExist:
                pass
            
            # For heavy fissile isotopes, add fission reactions
            if (isotope.element.atomic_number >= 90 and  # Actinides
                isotope.mass_number % 2 == 1):  # Odd mass numbers are usually fissile
                
                neutron_reaction, created = NeutronReaction.objects.get_or_create(
                    target_isotope=isotope,
                    product_isotope=None,  # Fission produces fragments
                    reaction_type='n_f',
                    defaults={'threshold_energy': 0.0}
                )
                if created:
                    created_count += 1
                    self.stdout.write(f"  {neutron_reaction}")
        
        return created_count

    def _get_decay_products(self, isotope):
        """Get decay products for an isotope based on various methods"""
        decay_products = []
        
        # Method 1: Parse explicit decay product strings
        if isotope.decay_product:
            products = self._parse_decay_product_string(isotope.decay_product)
            for product_isotope, decay_type in products:
                decay_products.append((product_isotope, decay_type, 1.0))
        
        # Method 2: Calculate from decay mode
        if not decay_products and isotope.decay_mode:
            products = self._calculate_from_decay_mode(isotope)
            decay_products.extend(products)
        
        # Method 3: Predict from nuclear systematics
        if not decay_products and isotope.half_life and isotope.half_life.lower() != "stable":
            products = self._predict_from_systematics(isotope)
            decay_products.extend(products)
        
        return decay_products

    def _parse_decay_product_string(self, decay_product_str):
        """Parse decay product strings like 'Tc-99', 'Ra-226'"""
        products = []
        matches = re.findall(r'([A-Z][a-z]?)-(\d+)', decay_product_str)
        
        for element_symbol, mass_str in matches:
            try:
                mass_number = int(mass_str)
                element = Element.objects.get(symbol__iexact=element_symbol)
                daughter_isotope = Isotope.objects.get(
                    element=element,
                    mass_number=mass_number
                )
                # Try to guess decay type from mass/atomic number change
                decay_type = 'beta_minus'  # Default assumption
                products.append((daughter_isotope, decay_type))
            except (Element.DoesNotExist, Isotope.DoesNotExist, ValueError):
                continue
        
        return products

    def _calculate_from_decay_mode(self, isotope):
        """Calculate decay products from decay mode string"""
        products = []
        decay_mode = str(isotope.decay_mode).lower()
        
        # Alpha decay: A → A-4, Z → Z-2
        if 'α' in decay_mode or 'alpha' in decay_mode or 'a' == decay_mode:
            daughter = self._find_isotope_by_change(isotope, mass_change=-4, z_change=-2)
            if daughter:
                products.append((daughter, 'alpha', 1.0))
        
        # Beta minus decay: A → A, Z → Z+1
        elif ('β-' in decay_mode or 'beta-' in decay_mode or 'b-' in decay_mode or
              'beta' in decay_mode):
            daughter = self._find_isotope_by_change(isotope, mass_change=0, z_change=1)
            if daughter:
                products.append((daughter, 'beta_minus', 1.0))
        
        # Beta plus decay or electron capture: A → A, Z → Z-1
        elif ('β+' in decay_mode or 'beta+' in decay_mode or 'b+' in decay_mode or
              'ec' in decay_mode or 'electron' in decay_mode):
            daughter = self._find_isotope_by_change(isotope, mass_change=0, z_change=-1)
            if daughter:
                decay_type = 'beta_plus' if 'β+' in decay_mode or 'beta+' in decay_mode else 'electron_capture'
                products.append((daughter, decay_type, 1.0))
        
        # Spontaneous fission
        elif 'sf' in decay_mode or 'fission' in decay_mode:
            # For now, we don't add specific fission products
            pass
        
        return products

    def _predict_from_systematics(self, isotope):
        """Predict decay mode from nuclear systematics"""
        products = []
        
        neutron_number = isotope.mass_number - isotope.element.atomic_number
        nz_ratio = neutron_number / isotope.element.atomic_number if isotope.element.atomic_number > 0 else 0
        
        # Heavy elements (Z > 82) tend to alpha decay
        if isotope.element.atomic_number > 82:
            daughter = self._find_isotope_by_change(isotope, mass_change=-4, z_change=-2)
            if daughter:
                products.append((daughter, 'alpha', 1.0))
        
        # Neutron-rich isotopes (high N/Z) tend to beta minus decay
        elif nz_ratio > 1.5:
            daughter = self._find_isotope_by_change(isotope, mass_change=0, z_change=1)
            if daughter:
                products.append((daughter, 'beta_minus', 1.0))
        
        # Proton-rich isotopes (low N/Z) tend to beta plus decay or electron capture
        elif nz_ratio < 1.0 and isotope.element.atomic_number > 1:
            daughter = self._find_isotope_by_change(isotope, mass_change=0, z_change=-1)
            if daughter:
                products.append((daughter, 'electron_capture', 1.0))
        
        return products

    def _find_isotope_by_change(self, parent_isotope, mass_change, z_change):
        """Find daughter isotope by mass and atomic number changes"""
        try:
            new_mass = parent_isotope.mass_number + mass_change
            new_z = parent_isotope.element.atomic_number + z_change
            
            if new_z <= 0 or new_mass <= 0:
                return None
            
            daughter_element = Element.objects.get(atomic_number=new_z)
            daughter_isotope = Isotope.objects.get(
                element=daughter_element,
                mass_number=new_mass
            )
            return daughter_isotope
        except (Element.DoesNotExist, Isotope.DoesNotExist):
            return None
