from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import models
from django.db.models import Q
from django.shortcuts import get_object_or_404
import numpy as np
import math
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

from .models import (
    Element, Isotope, NeutronCrossSection, DecayPath, NeutronReaction,
    GammaSpectrum, ElementComposition, IsotopeSource
)
from .serializers import (
    ElementSerializer, IsotopeSerializer, NeutronCrossSectionSerializer,
    DecayPathSerializer, NeutronReactionSerializer, GammaSpectrumSerializer,
    ElementCompositionSerializer, ElementCompositionCreateSerializer,
    IsotopeSourceSerializer, IsotopeSourceCreateSerializer,
    DecaySimulationRequestSerializer, DecaySimulationResultSerializer,
    ElementSearchSerializer, IsotopeSearchSerializer
)


@dataclass
class IsotopeState:
    """Represents the state of an isotope at a given time"""
    isotope: Isotope
    amount: float = 0.0  # Number of atoms
    decay_constant: float = 0.0  # λ in s⁻¹
    cross_section: Optional[float] = None  # σ in barns (10⁻²⁴ cm²)
    decay_branches: List[Tuple['IsotopeState', float]] = None  # [(product, branching_ratio)]
    capture_product: Optional['IsotopeState'] = None  # Product after neutron capture

    def __post_init__(self):
        """Initialize after dataclass creation"""
        if self.decay_branches is None:
            self.decay_branches = []


class ReactorSimulator:
    """Simulator for isotope decay chains in reactor environments"""
    def __init__(
        self,
        initial_isotope: Isotope,
        initial_atoms: float,
        neutron_flux: float,  # n/cm²/s
        time_step: float,  # seconds
        max_time: float,  # seconds
        energy: float = 0.025,  # eV (thermal neutrons by default)
    ):
        self.neutron_flux = neutron_flux
        self.time_step = time_step
        self.max_time = max_time
        self.energy = energy
        self.isotope_states: Dict[str, IsotopeState] = {}
        self.time_evolution: Dict[float, Dict[str, float]] = {}
        
        # Initialize with first isotope
        self._add_isotope_to_simulation(initial_isotope, initial_atoms)

    def _get_decay_constant(self, isotope: Isotope) -> float:
        """Calculate decay constant λ from half-life"""
        if not isotope.half_life:
            return 0.0
        
        # Try to convert half_life to float, handle various formats
        try:
            half_life_str = str(isotope.half_life).strip()
            if not half_life_str or half_life_str.lower() in ['stable', 'infinity', 'inf', '∞']:
                return 0.0
            
            # Extract numeric value from string (e.g., "4.468e9 y" -> 4.468e9)
            match = re.search(r'([0-9.]+e?[0-9]*)', half_life_str)
            if match:
                half_life_value = float(match.group(1))
                # Convert to seconds based on unit
                if 'y' in half_life_str.lower() or 'year' in half_life_str.lower():
                    half_life_value *= 365.25 * 24 * 3600  # years to seconds
                elif 'd' in half_life_str.lower() or 'day' in half_life_str.lower():
                    half_life_value *= 24 * 3600  # days to seconds
                elif 'h' in half_life_str.lower() or 'hour' in half_life_str.lower():
                    half_life_value *= 3600  # hours to seconds
                elif 'm' in half_life_str.lower() or 'min' in half_life_str.lower():
                    half_life_value *= 60  # minutes to seconds
                elif 's' in half_life_str.lower() or 'sec' in half_life_str.lower():
                    pass  # already in seconds
                elif 'ms' in half_life_str.lower() or 'millisecond' in half_life_str.lower():
                    half_life_value *= 0.001  # milliseconds to seconds
                elif 'μs' in half_life_str.lower() or 'microsecond' in half_life_str.lower():
                    half_life_value *= 1e-6  # microseconds to seconds
                elif 'ns' in half_life_str.lower() or 'nanosecond' in half_life_str.lower():
                    half_life_value *= 1e-9  # nanoseconds to seconds
                
                if half_life_value > 0:
                    return math.log(2) / half_life_value
        except (ValueError, TypeError):
            pass
        
        return 0.0

    def _parse_decay_mode(self, isotope: Isotope) -> List[Tuple[Isotope, float]]:
        """Get decay products from pre-calculated database relationships"""
        decay_products = []
        
        try:
            # Get decay paths from database
            decay_paths = DecayPath.objects.filter(parent_isotope=isotope).select_related('daughter_isotope')
            
            for decay_path in decay_paths:
                decay_products.append((decay_path.daughter_isotope, decay_path.branching_ratio))
        
        except Exception as e:
            pass
            
        return decay_products

    def _get_neutron_capture_product(self, isotope: Isotope) -> Optional[Isotope]:
        """Get neutron capture product from pre-calculated database relationships"""
        try:
            # Get neutron capture reaction from database
            neutron_reaction = NeutronReaction.objects.filter(
                target_isotope=isotope,
                reaction_type='n_gamma'
            ).select_related('product_isotope').first()
            
            return neutron_reaction.product_isotope if neutron_reaction else None
        except Exception:
            return None

    def _get_cross_section(self, isotope: Isotope) -> Optional[float]:
        """Get neutron capture cross section at specified energy"""
        try:
            xs = NeutronCrossSection.objects.filter(
                isotope=isotope,
                reaction='N,G',  # Neutron capture
            ).order_by(
                # Get closest energy match
                abs(models.F('energy') - self.energy)
            ).first()
            return xs.cross_section if xs else None
        except:
            return None

    def _add_isotope_to_simulation(self, isotope: Isotope, initial_amount: float = 0.0):
        """Add an isotope and its possible products to the simulation"""
        key = f"{isotope.element.symbol}-{isotope.mass_number}"
        if key in self.isotope_states:
            return self.isotope_states[key]

        # Create state for this isotope
        state = IsotopeState(
            isotope=isotope,
            amount=initial_amount,
            decay_constant=self._get_decay_constant(isotope),
            cross_section=self._get_cross_section(isotope),
            decay_branches=[],
            capture_product=None
        )
        self.isotope_states[key] = state

        # Add decay products
        decay_products = self._parse_decay_mode(isotope)
        for product, branch_ratio in decay_products:
            product_state = self._add_isotope_to_simulation(product)
            state.decay_branches.append((product_state, branch_ratio))

        # Add neutron capture product
        capture_product = self._get_neutron_capture_product(isotope)
        if capture_product:
            state.capture_product = self._add_isotope_to_simulation(capture_product)

        return state

    def _calculate_rates(self, state: IsotopeState) -> Tuple[float, float]:
        """Calculate decay and capture rates for an isotope"""
        # Decay rate = λN
        decay_rate = state.decay_constant * state.amount

        # Capture rate = ΦσN
        capture_rate = 0.0
        if state.cross_section:
            # Convert cross section from barns to cm²
            xs_cm2 = state.cross_section * 1e-24
            capture_rate = self.neutron_flux * xs_cm2 * state.amount

        return decay_rate, capture_rate

    def simulate(self):
        """Run the simulation"""
        current_time = 0.0
        
        while current_time <= self.max_time:
            # Record current state
            self.time_evolution[current_time] = {
                key: state.amount for key, state in self.isotope_states.items()
            }

            # Calculate changes for all isotopes
            changes = {key: 0.0 for key in self.isotope_states}
            
            for key, state in self.isotope_states.items():
                decay_rate, capture_rate = self._calculate_rates(state)
                
                # Remove atoms that decay or capture
                total_loss = (decay_rate + capture_rate) * self.time_step
                changes[key] -= total_loss
                
                # Add atoms to decay products
                for product_state, branch_ratio in state.decay_branches:
                    product_key = f"{product_state.isotope.element.symbol}-{product_state.isotope.mass_number}"
                    changes[product_key] += decay_rate * branch_ratio * self.time_step
                
                # Add atoms to capture product
                if state.capture_product:
                    product_key = f"{state.capture_product.isotope.element.symbol}-{state.capture_product.isotope.mass_number}"
                    changes[product_key] += capture_rate * self.time_step
            
            # Apply changes
            for key, change in changes.items():
                self.isotope_states[key].amount += change
            
            current_time += self.time_step

        return self.time_evolution


# API Views
class ElementListView(generics.ListAPIView):
    """List all elements"""
    queryset = Element.objects.all().order_by('atomic_number')
    serializer_class = ElementSerializer
    permission_classes = [permissions.AllowAny]


class ElementDetailView(generics.RetrieveAPIView):
    """Get element details"""
    queryset = Element.objects.all()
    serializer_class = ElementSerializer
    permission_classes = [permissions.AllowAny]


class IsotopeListView(generics.ListAPIView):
    """List isotopes with optional filtering"""
    serializer_class = IsotopeSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Isotope.objects.select_related('element').all()
        element_id = self.request.query_params.get('element_id')
        element_symbol = self.request.query_params.get('element_symbol')
        mass_number = self.request.query_params.get('mass_number')
        is_stable = self.request.query_params.get('is_stable')
        
        if element_id:
            queryset = queryset.filter(element_id=element_id)
        if element_symbol:
            queryset = queryset.filter(element__symbol__iexact=element_symbol)
        if mass_number:
            queryset = queryset.filter(mass_number=mass_number)
        if is_stable is not None:
            queryset = queryset.filter(is_stable=is_stable.lower() == 'true')
            
        return queryset.order_by('element__atomic_number', 'mass_number')


class IsotopeDetailView(generics.RetrieveAPIView):
    """Get isotope details"""
    queryset = Isotope.objects.all()
    serializer_class = IsotopeSerializer
    permission_classes = [permissions.AllowAny]


class NeutronCrossSectionListView(generics.ListAPIView):
    """List neutron cross sections"""
    serializer_class = NeutronCrossSectionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = NeutronCrossSection.objects.select_related('isotope__element').all()
        isotope_id = self.request.query_params.get('isotope_id')
        reaction = self.request.query_params.get('reaction')
        
        if isotope_id:
            queryset = queryset.filter(isotope_id=isotope_id)
        if reaction:
            queryset = queryset.filter(reaction=reaction)
            
        return queryset.order_by('isotope__element__atomic_number', 'isotope__mass_number', 'energy')


class DecayPathListView(generics.ListAPIView):
    """List decay paths"""
    serializer_class = DecayPathSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = DecayPath.objects.select_related(
            'parent_isotope__element', 'daughter_isotope__element'
        ).all()
        parent_isotope_id = self.request.query_params.get('parent_isotope_id')
        daughter_isotope_id = self.request.query_params.get('daughter_isotope_id')
        decay_type = self.request.query_params.get('decay_type')
        
        if parent_isotope_id:
            queryset = queryset.filter(parent_isotope_id=parent_isotope_id)
        if daughter_isotope_id:
            queryset = queryset.filter(daughter_isotope_id=daughter_isotope_id)
        if decay_type:
            queryset = queryset.filter(decay_type=decay_type)
            
        return queryset.order_by('parent_isotope__element__atomic_number', 'parent_isotope__mass_number')


class GammaSpectrumListView(generics.ListAPIView):
    """List gamma spectra"""
    serializer_class = GammaSpectrumSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = GammaSpectrum.objects.select_related('isotope__element').all()
        isotope_id = self.request.query_params.get('isotope_id')
        
        if isotope_id:
            queryset = queryset.filter(isotope_id=isotope_id)
            
        return queryset.order_by('isotope__element__atomic_number', 'isotope__mass_number', 'energy')


# Project-specific views
class ElementCompositionListView(generics.ListCreateAPIView):
    """List and create element compositions for a project"""
    serializer_class = ElementCompositionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ElementComposition.objects.filter(project_id=project_id).order_by('name')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ElementCompositionCreateSerializer
        return ElementCompositionSerializer


class ElementCompositionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete element composition"""
    serializer_class = ElementCompositionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ElementComposition.objects.filter(project_id=project_id)


class IsotopeSourceListView(generics.ListCreateAPIView):
    """List and create isotope sources for a project"""
    serializer_class = IsotopeSourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return IsotopeSource.objects.filter(project_id=project_id).select_related('isotope__element').order_by('name')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IsotopeSourceCreateSerializer
        return IsotopeSourceSerializer


class IsotopeSourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete isotope source"""
    serializer_class = IsotopeSourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return IsotopeSource.objects.filter(project_id=project_id).select_related('isotope__element')


# Search and simulation endpoints
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_elements(request):
    """Search elements by symbol, name, or atomic number"""
    serializer = ElementSearchSerializer(data=request.query_params)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    query = serializer.validated_data.get('query', '').strip()
    search_type = serializer.validated_data.get('search_type', 'all')
    
    queryset = Element.objects.all()
    
    if query:
        if search_type == 'symbol':
            queryset = queryset.filter(symbol__icontains=query)
        elif search_type == 'name':
            queryset = queryset.filter(name__icontains=query)
        elif search_type == 'atomic_number':
            try:
                atomic_number = int(query)
                queryset = queryset.filter(atomic_number=atomic_number)
            except ValueError:
                queryset = queryset.none()
        else:  # search_type == 'all'
            # Try to parse as atomic number first
            try:
                atomic_number = int(query)
                queryset = queryset.filter(atomic_number=atomic_number)
            except ValueError:
                # Search by symbol or name
                queryset = queryset.filter(
                    Q(symbol__icontains=query) | Q(name__icontains=query)
                )
    
    queryset = queryset.order_by('atomic_number')[:50]  # Limit results
    serializer = ElementSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_isotope_cross_sections(request, isotope_id):
    """Get neutron cross sections for a specific isotope"""
    try:
        isotope = Isotope.objects.get(id=isotope_id)
        cross_sections = NeutronCrossSection.objects.filter(
            isotope=isotope
        ).order_by('energy')
        
        serializer = NeutronCrossSectionSerializer(cross_sections, many=True)
        return Response({
            'isotope': IsotopeSerializer(isotope).data,
            'cross_sections': serializer.data
        })
        
    except Isotope.DoesNotExist:
        return Response(
            {'error': f'Isotope with id {isotope_id} not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error fetching cross sections: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_isotope_gamma_spectrum(request, isotope_id):
    """Get gamma spectrum for a specific isotope"""
    try:
        isotope = Isotope.objects.get(id=isotope_id)
        gamma_spectrum = GammaSpectrum.objects.filter(
            isotope=isotope
        ).order_by('energy')
        
        serializer = GammaSpectrumSerializer(gamma_spectrum, many=True)
        return Response({
            'isotope': IsotopeSerializer(isotope).data,
            'gamma_spectrum': serializer.data
        })
        
    except Isotope.DoesNotExist:
        return Response(
            {'error': f'Isotope with id {isotope_id} not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error fetching gamma spectrum: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def simulate_decay_chain(request):
    """Simulate isotope decay chain in reactor environment"""
    serializer = DecaySimulationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get parameters
        params = serializer.validated_data
        
        # Get initial isotope
        element = Element.objects.get(symbol__iexact=params['element_symbol'])
        isotope = Isotope.objects.get(
            element=element,
            mass_number=params['mass_number']
        )

        # Setup simulator
        simulator = ReactorSimulator(
            initial_isotope=isotope,
            initial_atoms=params['initial_atoms'],
            neutron_flux=params['neutron_flux'],
            time_step=params['time_step'],
            max_time=params['time'],
            energy=params['energy']
        )

        # Run simulation
        time_evolution = simulator.simulate()

        # Prepare isotope network data
        isotope_network = []
        for key, state in simulator.isotope_states.items():
            decay_rate, capture_rate = simulator._calculate_rates(state)
            
            # Get half-life in seconds
            half_life_seconds = None
            if state.decay_constant > 0:
                half_life_seconds = math.log(2) / state.decay_constant

            isotope_data = {
                'isotope': IsotopeSerializer(state.isotope).data,
                'amount': state.amount,
                'decay_constant': state.decay_constant,
                'cross_section': state.cross_section,
                'half_life_seconds': half_life_seconds,
                'activity': decay_rate,  # Becquerels
                'decay_products': [
                    f"{branch[0].isotope.element.symbol}-{branch[0].isotope.mass_number}"
                    for branch in state.decay_branches
                ],
                'capture_product': (
                    f"{state.capture_product.isotope.element.symbol}-{state.capture_product.isotope.mass_number}"
                    if state.capture_product else None
                )
            }
            isotope_network.append(isotope_data)

        # Get time points for evolution data
        time_points = sorted(time_evolution.keys())

        result = {
            'simulation_parameters': params,
            'isotope_network': isotope_network,
            'time_evolution': time_evolution,
            'total_simulation_time': params['time'],
            'time_points': time_points
        }

        return Response(result)

    except Element.DoesNotExist:
        return Response(
            {'error': f"Element with symbol '{params['element_symbol']}' not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Isotope.DoesNotExist:
        return Response(
            {'error': f"Isotope {params['element_symbol']}-{params['mass_number']} not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f"Error in simulation: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )