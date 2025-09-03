from rest_framework import serializers
from .models import (
    Project, SceneConfiguration, Geometry, Composition, 
    Spectrum, Volume, SceneHistory, CSGOperation
)


class SceneConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for scene configuration"""
    class Meta:
        model = SceneConfiguration
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class GeometrySerializer(serializers.ModelSerializer):
    """Serializer for geometry objects"""
    class Meta:
        model = Geometry
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class CompositionSerializer(serializers.ModelSerializer):
    """Serializer for compositions"""
    class Meta:
        model = Composition
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class SpectrumSerializer(serializers.ModelSerializer):
    """Serializer for spectra"""
    class Meta:
        model = Spectrum
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class VolumeSerializer(serializers.ModelSerializer):
    """Serializer for volumes"""
    geometry = GeometrySerializer(read_only=True)
    composition = CompositionSerializer(read_only=True)
    spectrum = SpectrumSerializer(read_only=True)
    
    class Meta:
        model = Volume
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class VolumeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating volumes with nested data"""
    geometry = GeometrySerializer()
    composition = CompositionSerializer(required=False)
    spectrum = SpectrumSerializer(required=False)
    
    class Meta:
        model = Volume
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        geometry_data = validated_data.pop('geometry')
        composition_data = validated_data.pop('composition', None)
        spectrum_data = validated_data.pop('spectrum', None)
        
        # Create geometry
        geometry = Geometry.objects.create(**geometry_data)
        
        # Create composition if provided
        composition = None
        if composition_data:
            composition = Composition.objects.create(**composition_data)
        
        # Create spectrum if provided
        spectrum = None
        if spectrum_data:
            spectrum = Spectrum.objects.create(**spectrum_data)
        
        # Create volume
        volume = Volume.objects.create(
            geometry=geometry,
            composition=composition,
            spectrum=spectrum,
            **validated_data
        )
        
        return volume


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for projects"""
    user = serializers.ReadOnlyField(source='user.email')
    scene_config = SceneConfigurationSerializer(read_only=True)
    geometries_count = serializers.SerializerMethodField()
    volumes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_geometries_count(self, obj):
        return obj.geometries.count()
    
    def get_volumes_count(self, obj):
        return obj.volumes.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for projects with all related data"""
    user = serializers.ReadOnlyField(source='user.email')
    scene_config = SceneConfigurationSerializer(read_only=True)
    geometries = GeometrySerializer(many=True, read_only=True)
    compositions = CompositionSerializer(many=True, read_only=True)
    spectra = SpectrumSerializer(many=True, read_only=True)
    volumes = VolumeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class SceneHistorySerializer(serializers.ModelSerializer):
    """Serializer for scene history"""
    class Meta:
        model = SceneHistory
        fields = '__all__'
        read_only_fields = ['project', 'timestamp']


class CSGOperationSerializer(serializers.ModelSerializer):
    """Serializer for CSG operations"""
    result_object = GeometrySerializer(read_only=True)
    
    class Meta:
        model = CSGOperation
        fields = '__all__'
        read_only_fields = ['project', 'created_at']


class CompleteSceneSerializer(serializers.Serializer):
    """Serializer for complete scene data (save/load)"""
    project = ProjectSerializer()
    scene_config = SceneConfigurationSerializer()
    geometries = GeometrySerializer(many=True)
    compositions = CompositionSerializer(many=True)
    spectra = SpectrumSerializer(many=True)
    volumes = VolumeSerializer(many=True)
    history = SceneHistorySerializer(many=True, required=False)
    csg_operations = CSGOperationSerializer(many=True, required=False)
    
    def create(self, validated_data):
        """Create a complete project with all related data"""
        project_data = validated_data.pop('project')
        scene_config_data = validated_data.pop('scene_config')
        geometries_data = validated_data.pop('geometries', [])
        compositions_data = validated_data.pop('compositions', [])
        spectra_data = validated_data.pop('spectra', [])
        volumes_data = validated_data.pop('volumes', [])
        history_data = validated_data.pop('history', [])
        csg_operations_data = validated_data.pop('csg_operations', [])
        
        # Create project
        project = Project.objects.create(**project_data)
        
        # Create scene configuration
        scene_config = SceneConfiguration.objects.create(
            project=project,
            **scene_config_data
        )
        
        # Create compositions
        compositions = []
        for comp_data in compositions_data:
            composition = Composition.objects.create(
                project=project,
                **comp_data
            )
            compositions.append(composition)
        
        # Create spectra
        spectra = []
        for spec_data in spectra_data:
            spectrum = Spectrum.objects.create(
                project=project,
                **spec_data
            )
            spectra.append(spectrum)
        
        # Create geometries
        geometries = []
        for geom_data in geometries_data:
            geometry = Geometry.objects.create(
                project=project,
                **geom_data
            )
            geometries.append(geometry)
        
        # Create volumes (linking geometries, compositions, spectra)
        volumes = []
        for vol_data in volumes_data:
            # Find corresponding geometry, composition, spectrum
            geometry_id = vol_data.get('geometry_id')
            composition_id = vol_data.get('composition_id')
            spectrum_id = vol_data.get('spectrum_id')
            
            geometry = next((g for g in geometries if g.id == geometry_id), None)
            composition = next((c for c in compositions if c.id == composition_id), None)
            spectrum = next((s for s in spectra if s.id == spectrum_id), None)
            
            if geometry:
                volume = Volume.objects.create(
                    project=project,
                    geometry=geometry,
                    composition=composition,
                    spectrum=spectrum,
                    **{k: v for k, v in vol_data.items() if k not in ['geometry_id', 'composition_id', 'spectrum_id']}
                )
                volumes.append(volume)
        
        # Create history
        for hist_data in history_data:
            SceneHistory.objects.create(
                project=project,
                **hist_data
            )
        
        # Create CSG operations
        for csg_data in csg_operations_data:
            result_geometry_id = csg_data.get('result_object_id')
            result_geometry = next((g for g in geometries if g.id == result_geometry_id), None)
            
            if result_geometry:
                CSGOperation.objects.create(
                    project=project,
                    result_object=result_geometry,
                    **{k: v for k, v in csg_data.items() if k not in ['result_object_id']}
                )
        
        return {
            'project': project,
            'scene_config': scene_config,
            'geometries': geometries,
            'compositions': compositions,
            'spectra': spectra,
            'volumes': volumes
        }
