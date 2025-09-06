from rest_framework import serializers
from .models import (
    Element, Isotope, NeutronCrossSection, DecayPath, NeutronReaction,
    GammaSpectrum, ElementComposition, IsotopeSource
)
from projects.models import Project


class ElementSerializer(serializers.ModelSerializer):
    """Serializer for Element model"""
    class Meta:
        model = Element
        fields = [
            'id', 'atomic_number', 'symbol', 'name', 'atomic_mass',
            'density', 'melting_point', 'boiling_point',
            'created_at', 'updated_at'
        ]


class IsotopeSerializer(serializers.ModelSerializer):
    """Serializer for Isotope model"""
    element = ElementSerializer(read_only=True)
    element_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Isotope
        fields = [
            'id', 'element', 'element_id', 'mass_number', 'half_life', 
            'decay_mode', 'decay_product', 'is_stable', 'neutron_number',
            'abundance', 'spin_parity', 'magnetic_moment',
            'created_at', 'updated_at'
        ]


class NeutronCrossSectionSerializer(serializers.ModelSerializer):
    """Serializer for NeutronCrossSection model"""
    isotope = IsotopeSerializer(read_only=True)
    isotope_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = NeutronCrossSection
        fields = [
            'id', 'isotope', 'isotope_id', 'target', 'reaction', 'origin',
            'energy', 'cross_section', 'uncertainty', 'range_url', 'isotope_url',
            'created_at', 'updated_at'
        ]


class DecayPathSerializer(serializers.ModelSerializer):
    """Serializer for DecayPath model"""
    parent_isotope = IsotopeSerializer(read_only=True)
    daughter_isotope = IsotopeSerializer(read_only=True)
    parent_isotope_id = serializers.IntegerField(write_only=True)
    daughter_isotope_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DecayPath
        fields = [
            'id', 'parent_isotope', 'parent_isotope_id', 'daughter_isotope', 'daughter_isotope_id',
            'decay_type', 'branching_ratio', 'q_value', 'half_life', 'energy_released',
            'created_at', 'updated_at'
        ]


class NeutronReactionSerializer(serializers.ModelSerializer):
    """Serializer for NeutronReaction model"""
    target_isotope = IsotopeSerializer(read_only=True)
    product_isotope = IsotopeSerializer(read_only=True)
    target_isotope_id = serializers.IntegerField(write_only=True)
    product_isotope_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = NeutronReaction
        fields = [
            'id', 'target_isotope', 'target_isotope_id', 'product_isotope', 'product_isotope_id',
            'reaction_type', 'threshold_energy', 'q_value', 'resonance_energy', 'resonance_width',
            'created_at', 'updated_at'
        ]


class GammaSpectrumSerializer(serializers.ModelSerializer):
    """Serializer for GammaSpectrum model"""
    isotope = IsotopeSerializer(read_only=True)
    isotope_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = GammaSpectrum
        fields = [
            'id', 'isotope', 'isotope_id', 'energy', 'intensity',
            'multipolarity', 'origin', 'created_at', 'updated_at'
        ]


class ElementCompositionSerializer(serializers.ModelSerializer):
    """Serializer for ElementComposition model"""
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = ElementComposition
        fields = [
            'id', 'project', 'project_name', 'name', 'description',
            'density', 'color', 'elements', 'molecular_weight',
            'phase', 'temperature', 'created_at', 'updated_at'
        ]


class IsotopeSourceSerializer(serializers.ModelSerializer):
    """Serializer for IsotopeSource model"""
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    isotope = IsotopeSerializer(read_only=True)
    isotope_id = serializers.IntegerField(write_only=True)
    geometry = serializers.PrimaryKeyRelatedField(read_only=True)
    geometry_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = IsotopeSource
        fields = [
            'id', 'project', 'name', 'description', 'isotope', 'isotope_id',
            'activity', 'mass', 'volume', 'geometry', 'geometry_id', 'source_type',
            'energy_spectrum', 'created_at', 'updated_at'
        ]


# Search and simulation serializers
class ElementSearchSerializer(serializers.Serializer):
    """Serializer for element search requests"""
    query = serializers.CharField(max_length=100, required=False, allow_blank=True)
    search_type = serializers.ChoiceField(
        choices=['all', 'symbol', 'name', 'atomic_number'],
        default='all'
    )


class IsotopeSearchSerializer(serializers.Serializer):
    """Serializer for isotope search requests"""
    element_id = serializers.IntegerField(required=False)
    element_symbol = serializers.CharField(max_length=4, required=False)
    mass_number = serializers.IntegerField(required=False)
    is_stable = serializers.BooleanField(required=False)


class DecaySimulationRequestSerializer(serializers.Serializer):
    """Serializer for decay simulation requests"""
    element_symbol = serializers.CharField(max_length=4)
    mass_number = serializers.IntegerField(min_value=1)
    neutron_flux = serializers.FloatField(default=1e14, min_value=0)
    initial_atoms = serializers.FloatField(default=1e20, min_value=0)
    time = serializers.FloatField(default=3600, min_value=0)
    time_step = serializers.FloatField(default=1.0, min_value=0.001)
    energy = serializers.FloatField(default=0.025, min_value=0)


class IsotopeStateSerializer(serializers.Serializer):
    """Serializer for isotope state in simulation"""
    isotope = IsotopeSerializer()
    amount = serializers.FloatField()
    decay_constant = serializers.FloatField()
    cross_section = serializers.FloatField(allow_null=True)
    half_life_seconds = serializers.FloatField(allow_null=True)
    activity = serializers.FloatField()  # Becquerels
    decay_products = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    capture_product = serializers.CharField(allow_null=True)


class DecaySimulationResultSerializer(serializers.Serializer):
    """Serializer for decay simulation results"""
    simulation_parameters = DecaySimulationRequestSerializer()
    isotope_network = serializers.ListField(child=IsotopeStateSerializer())
    time_evolution = serializers.DictField(
        child=serializers.DictField(child=serializers.FloatField())
    )
    total_simulation_time = serializers.FloatField()
    time_points = serializers.ListField(child=serializers.FloatField())


class CompositionElementSerializer(serializers.Serializer):
    """Serializer for elements in compositions"""
    element_id = serializers.IntegerField()
    element_symbol = serializers.CharField(read_only=True)
    element_name = serializers.CharField(read_only=True)
    percentage = serializers.FloatField(min_value=0, max_value=100)


class ElementCompositionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating element compositions"""
    elements = CompositionElementSerializer(many=True)
    
    class Meta:
        model = ElementComposition
        fields = [
            'project', 'name', 'description', 'density', 'color',
            'elements', 'molecular_weight', 'phase', 'temperature'
        ]
    
    def validate_elements(self, value):
        """Validate that element percentages sum to 100"""
        total_percentage = sum(element['percentage'] for element in value)
        if abs(total_percentage - 100.0) > 0.01:  # Allow small floating point errors
            raise serializers.ValidationError("Element percentages must sum to 100%")
        return value
    
    def create(self, validated_data):
        """Create composition with element data"""
        elements_data = validated_data.pop('elements')
        composition = ElementComposition.objects.create(**validated_data)
        
        # Store elements as JSON
        composition.elements = elements_data
        composition.save()
        
        return composition


class IsotopeSourceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating isotope sources"""
    isotope_id = serializers.IntegerField()
    geometry_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = IsotopeSource
        fields = [
            'project', 'name', 'description', 'isotope_id',
            'activity', 'mass', 'volume', 'geometry_id', 'source_type',
            'energy_spectrum'
        ]
    
    def create(self, validated_data):
        """Create source with isotope reference"""
        isotope_id = validated_data.pop('isotope_id')
        geometry_id = validated_data.pop('geometry_id', None)
        
        isotope = Isotope.objects.get(id=isotope_id)
        validated_data['isotope'] = isotope
        
        if geometry_id:
            from projects.models import Geometry
            geometry = Geometry.objects.get(id=geometry_id)
            validated_data['geometry'] = geometry
        
        return IsotopeSource.objects.create(**validated_data)
