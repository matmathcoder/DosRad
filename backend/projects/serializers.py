from rest_framework import serializers
from .models import (
    Project, SceneConfiguration, Geometry, Composition, 
    Spectrum, Volume, SceneHistory, CSGOperation, Sensor,
    CompoundObject, CompoundObjectGeometry, CompoundObjectComposition,
    CompoundObjectSpectrum, CompoundObjectSensor, CompoundObjectImport,
    MeshConfiguration, ComputationConfiguration, ComputationResult, ToleranceConfiguration
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
        
        # Get project from validated_data (set by perform_create)
        project = validated_data.get('project')
        
        # Create geometry with project
        geometry_data['project'] = project
        geometry = Geometry.objects.create(**geometry_data)
        
        # Create composition if provided
        composition = None
        if composition_data:
            composition_data['project'] = project
            composition = Composition.objects.create(**composition_data)
        
        # Create spectrum if provided
        spectrum = None
        if spectrum_data:
            spectrum_data['project'] = project
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


class SensorSerializer(serializers.ModelSerializer):
    """Serializer for sensors"""
    selected_composition = CompositionSerializer(read_only=True)
    
    class Meta:
        model = Sensor
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class CSGOperationSerializer(serializers.ModelSerializer):
    """Serializer for CSG operations"""
    result_object = GeometrySerializer(read_only=True)
    
    class Meta:
        model = CSGOperation
        fields = '__all__'
        read_only_fields = ['project', 'created_at']


class CompoundObjectGeometrySerializer(serializers.ModelSerializer):
    """Serializer for compound object geometries"""
    class Meta:
        model = CompoundObjectGeometry
        fields = '__all__'
        read_only_fields = ['compound_object', 'created_at']


class CompoundObjectCompositionSerializer(serializers.ModelSerializer):
    """Serializer for compound object compositions"""
    class Meta:
        model = CompoundObjectComposition
        fields = '__all__'
        read_only_fields = ['compound_object', 'created_at']


class CompoundObjectSpectrumSerializer(serializers.ModelSerializer):
    """Serializer for compound object spectra"""
    class Meta:
        model = CompoundObjectSpectrum
        fields = '__all__'
        read_only_fields = ['compound_object', 'created_at']


class CompoundObjectSensorSerializer(serializers.ModelSerializer):
    """Serializer for compound object sensors"""
    class Meta:
        model = CompoundObjectSensor
        fields = '__all__'
        read_only_fields = ['compound_object', 'created_at']


class CompoundObjectSerializer(serializers.ModelSerializer):
    """Serializer for compound objects"""
    geometries = CompoundObjectGeometrySerializer(many=True, read_only=True)
    compositions = CompoundObjectCompositionSerializer(many=True, read_only=True)
    spectra = CompoundObjectSpectrumSerializer(many=True, read_only=True)
    sensors = CompoundObjectSensorSerializer(many=True, read_only=True)
    
    class Meta:
        model = CompoundObject
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'last_modified']


class CompoundObjectListSerializer(serializers.ModelSerializer):
    """Simplified serializer for compound object lists"""
    class Meta:
        model = CompoundObject
        fields = [
            'id', 'name', 'description', 'file_path', 'file_size',
            'version', 'created_by', 'tags', 'volumes_count',
            'compositions_count', 'spectra_count', 'sensors_count',
            'is_template', 'is_public', 'category', 'last_modified', 'created_at'
        ]
        read_only_fields = ['project', 'created_at', 'last_modified']


class CompoundObjectImportSerializer(serializers.ModelSerializer):
    """Serializer for compound object imports"""
    compound_object = CompoundObjectListSerializer(read_only=True)
    
    class Meta:
        model = CompoundObjectImport
        fields = '__all__'
        read_only_fields = ['project', 'compound_object', 'created_at']


class CompoundObjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating compound objects with nested data"""
    geometries = CompoundObjectGeometrySerializer(many=True, required=False)
    compositions = CompoundObjectCompositionSerializer(many=True, required=False)
    spectra = CompoundObjectSpectrumSerializer(many=True, required=False)
    sensors = CompoundObjectSensorSerializer(many=True, required=False)
    
    class Meta:
        model = CompoundObject
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'last_modified']
    
    def create(self, validated_data):
        geometries_data = validated_data.pop('geometries', [])
        compositions_data = validated_data.pop('compositions', [])
        spectra_data = validated_data.pop('spectra', [])
        sensors_data = validated_data.pop('sensors', [])
        
        # Create compound object
        compound_object = CompoundObject.objects.create(**validated_data)
        
        # Create geometries
        for geom_data in geometries_data:
            CompoundObjectGeometry.objects.create(
                compound_object=compound_object,
                **geom_data
            )
        
        # Create compositions
        for comp_data in compositions_data:
            CompoundObjectComposition.objects.create(
                compound_object=compound_object,
                **comp_data
            )
        
        # Create spectra
        for spec_data in spectra_data:
            CompoundObjectSpectrum.objects.create(
                compound_object=compound_object,
                **spec_data
            )
        
        # Create sensors
        for sensor_data in sensors_data:
            CompoundObjectSensor.objects.create(
                compound_object=compound_object,
                **sensor_data
            )
        
        return compound_object


class CompoundObjectImportRequestSerializer(serializers.Serializer):
    """Serializer for compound object import requests"""
    compound_object_id = serializers.IntegerField()
    position = serializers.JSONField(default=dict)
    rotation = serializers.JSONField(default=dict)
    scale = serializers.JSONField(default=dict)
    name_conflicts = serializers.JSONField(default=dict)
    
    def validate_position(self, value):
        """Validate position data"""
        required_keys = ['x', 'y', 'z']
        if not all(key in value for key in required_keys):
            raise serializers.ValidationError("Position must contain x, y, z coordinates")
        return value
    
    def validate_rotation(self, value):
        """Validate rotation data"""
        required_keys = ['x', 'y', 'z']
        if not all(key in value for key in required_keys):
            raise serializers.ValidationError("Rotation must contain x, y, z angles")
        return value
    
    def validate_scale(self, value):
        """Validate scale data"""
        required_keys = ['x', 'y', 'z']
        if not all(key in value for key in required_keys):
            raise serializers.ValidationError("Scale must contain x, y, z factors")
        return value


class CompoundObjectExportSerializer(serializers.Serializer):
    """Serializer for exporting compound objects"""
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(max_length=100, default='General')
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    is_template = serializers.BooleanField(default=False)
    is_public = serializers.BooleanField(default=False)
    
    # Objects to include in compound
    geometry_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    composition_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    spectrum_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    sensor_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)


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


class MeshConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeshConfiguration
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class ComputationConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComputationConfiguration
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class ComputationResultSerializer(serializers.ModelSerializer):
    configuration_name = serializers.CharField(source='configuration.name', read_only=True)
    configuration_type = serializers.CharField(source='configuration.config_type', read_only=True)
    
    class Meta:
        model = ComputationResult
        fields = '__all__'
        read_only_fields = ('created_at',)


class ToleranceConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToleranceConfiguration
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class CompleteProjectSerializer(serializers.ModelSerializer):
    """Serializer for complete project data including all related objects"""
    geometries = GeometrySerializer(many=True, read_only=True)
    compositions = CompositionSerializer(many=True, read_only=True)
    spectra = SpectrumSerializer(many=True, read_only=True)
    sensors = SensorSerializer(many=True, read_only=True)
    volumes = VolumeSerializer(many=True, read_only=True)
    scene_config = SceneConfigurationSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'is_public', 'created_at', 'updated_at',
            'geometries', 'compositions', 'spectra', 'sensors', 'volumes', 'scene_config'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompleteProjectCreateSerializer(serializers.Serializer):
    """Serializer for creating complete projects with all data"""
    # Project basic info
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    is_public = serializers.BooleanField(default=False)
    
    # Scene configuration
    scene_configuration = serializers.DictField(required=False, default=dict)
    
    # Complete scene data
    geometries = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    compositions = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    spectra = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    sensors = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    volumes = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    
    # Additional metadata
    metadata = serializers.DictField(required=False, default=dict)
    settings = serializers.DictField(required=False, default=dict)
    
    def create(self, validated_data):
        """Create a complete project with all related objects"""
        from django.db import transaction
        
        with transaction.atomic():
            # Create the project
            project = Project.objects.create(
                name=validated_data['name'],
                description=validated_data.get('description', ''),
                is_public=validated_data.get('is_public', False),
                user=self.context['request'].user
            )
            
            # Create scene configuration
            scene_config_data = validated_data.get('scene_configuration', {})
            SceneConfiguration.objects.create(
                project=project,
                camera_position=scene_config_data.get('camera', {}).get('position', {}),
                camera_rotation=scene_config_data.get('camera', {}).get('rotation', {}),
                camera_type=scene_config_data.get('camera', {}).get('type', 'perspective'),
                camera_fov=scene_config_data.get('camera', {}).get('fov', 75.0),
                camera_near=scene_config_data.get('camera', {}).get('near', 0.1),
                camera_far=scene_config_data.get('camera', {}).get('far', 1000.0),
                background_color=scene_config_data.get('background', '#262626'),
                ambient_light_intensity=scene_config_data.get('ambient_light', 1.2),
                directional_light_intensity=scene_config_data.get('directional_light', 3.0),
                grid_size=scene_config_data.get('grid_size', 10.0),
                grid_divisions=scene_config_data.get('grid_divisions', 10),
                floor_constraint_enabled=scene_config_data.get('floor_constraint', True),
                floor_level=scene_config_data.get('floor_level', 0.0)
            )
            
            # Create compositions first (volumes depend on them)
            composition_map = {}
            for comp_data in validated_data.get('compositions', []):
                composition = Composition.objects.create(
                    project=project,
                    name=comp_data.get('name', 'Unnamed Composition'),
                    density=comp_data.get('density', 1.0),
                    color=comp_data.get('color', '#888888'),
                    elements=comp_data.get('elements', [])
                )
                composition_map[comp_data.get('id', comp_data.get('name'))] = composition
            
            # Create spectra
            spectrum_map = {}
            for spec_data in validated_data.get('spectra', []):
                spectrum = Spectrum.objects.create(
                    project=project,
                    name=spec_data.get('name', 'Unnamed Spectrum'),
                    spectrum_type=spec_data.get('type', 'line'),
                    multiplier=spec_data.get('multiplier', 1.0),
                    lines=spec_data.get('lines', []),
                    isotopes=spec_data.get('isotopes', [])
                )
                spectrum_map[spec_data.get('id', spec_data.get('name'))] = spectrum
            
            # Create geometries
            geometry_map = {}
            for geom_data in validated_data.get('geometries', []):
                geometry = Geometry.objects.create(
                    project=project,
                    name=geom_data.get('name', 'Unnamed Geometry'),
                    geometry_type=geom_data.get('type', 'cube'),
                    position=geom_data.get('position', {}),
                    rotation=geom_data.get('rotation', {}),
                    scale=geom_data.get('scale', {}),
                    color=geom_data.get('color', '#888888'),
                    opacity=geom_data.get('opacity', 1.0),
                    transparent=geom_data.get('transparent', False),
                    geometry_parameters=geom_data.get('parameters', {}),
                    user_data=geom_data.get('userData', {})
                )
                geometry_map[geom_data.get('id', geom_data.get('name'))] = geometry
            
            # Create sensors
            sensor_map = {}
            for sensor_data in validated_data.get('sensors', []):
                sensor = Sensor.objects.create(
                    project=project,
                    name=sensor_data.get('name', 'SENSOR1'),
                    coordinates=sensor_data.get('coordinates', {}),
                    buildup_type=sensor_data.get('buildup_type', 'automatic'),
                    equi_importance=sensor_data.get('equi_importance', False),
                    response_function=sensor_data.get('response_function', 'ambient_dose')
                )
                sensor_map[sensor_data.get('id', sensor_data.get('name'))] = sensor
            
            # Create volumes (linking geometries, compositions, and spectra)
            for vol_data in validated_data.get('volumes', []):
                # Find the associated geometry
                geom_id = vol_data.get('geometry_id') or vol_data.get('geometry')
                geometry = None
                if geom_id:
                    geometry = geometry_map.get(geom_id)
                
                # Find the associated composition
                comp_id = vol_data.get('composition_id') or vol_data.get('composition')
                composition = None
                if comp_id:
                    composition = composition_map.get(comp_id)
                
                # Find the associated spectrum
                spec_id = vol_data.get('spectrum_id') or vol_data.get('spectrum')
                spectrum = None
                if spec_id:
                    spectrum = spectrum_map.get(spec_id)
                
                if geometry:  # Only create volume if we have a geometry
                    Volume.objects.create(
                        project=project,
                        geometry=geometry,
                        composition=composition,
                        spectrum=spectrum,
                        volume_name=vol_data.get('name', 'Unnamed Volume'),
                        volume_type=vol_data.get('type', 'solid'),
                        real_density=vol_data.get('real_density'),
                        tolerance=vol_data.get('tolerance'),
                        is_source=vol_data.get('is_source', False),
                        gamma_selection_mode=vol_data.get('gamma_selection_mode', 'by-lines'),
                        calculation_mode=vol_data.get('calculation_mode', 'by-lines')
                    )
            
            return project
    
    def update(self, instance, validated_data):
        """Update a complete project with all related objects"""
        from django.db import transaction
        
        with transaction.atomic():
            # Update project basic info
            instance.name = validated_data.get('name', instance.name)
            instance.description = validated_data.get('description', instance.description)
            instance.is_public = validated_data.get('is_public', instance.is_public)
            instance.save()
            
            # Clear existing related objects
            instance.geometries.all().delete()
            instance.compositions.all().delete()
            instance.spectra.all().delete()
            instance.sensors.all().delete()
            instance.volumes.all().delete()
            
            # Recreate all objects (same logic as create)
            scene_config_data = validated_data.get('scene_configuration', {})
            if hasattr(instance, 'scene_config'):
                instance.scene_config.delete()
            
            SceneConfiguration.objects.create(
                project=instance,
                camera_position=scene_config_data.get('camera', {}).get('position', {}),
                camera_rotation=scene_config_data.get('camera', {}).get('rotation', {}),
                camera_type=scene_config_data.get('camera', {}).get('type', 'perspective'),
                camera_fov=scene_config_data.get('camera', {}).get('fov', 75.0),
                camera_near=scene_config_data.get('camera', {}).get('near', 0.1),
                camera_far=scene_config_data.get('camera', {}).get('far', 1000.0),
                background_color=scene_config_data.get('background', '#262626'),
                ambient_light_intensity=scene_config_data.get('ambient_light', 1.2),
                directional_light_intensity=scene_config_data.get('directional_light', 3.0),
                grid_size=scene_config_data.get('grid_size', 10.0),
                grid_divisions=scene_config_data.get('grid_divisions', 10),
                floor_constraint_enabled=scene_config_data.get('floor_constraint', True),
                floor_level=scene_config_data.get('floor_level', 0.0)
            )
            
            # Create compositions
            composition_map = {}
            for comp_data in validated_data.get('compositions', []):
                composition = Composition.objects.create(
                    project=instance,
                    name=comp_data.get('name', 'Unnamed Composition'),
                    density=comp_data.get('density', 1.0),
                    color=comp_data.get('color', '#888888'),
                    elements=comp_data.get('elements', [])
                )
                composition_map[comp_data.get('id', comp_data.get('name'))] = composition
            
            # Create spectra
            spectrum_map = {}
            for spec_data in validated_data.get('spectra', []):
                spectrum = Spectrum.objects.create(
                    project=instance,
                    name=spec_data.get('name', 'Unnamed Spectrum'),
                    spectrum_type=spec_data.get('type', 'line'),
                    multiplier=spec_data.get('multiplier', 1.0),
                    lines=spec_data.get('lines', []),
                    isotopes=spec_data.get('isotopes', [])
                )
                spectrum_map[spec_data.get('id', spec_data.get('name'))] = spectrum
            
            # Create geometries
            geometry_map = {}
            for geom_data in validated_data.get('geometries', []):
                geometry = Geometry.objects.create(
                    project=instance,
                    name=geom_data.get('name', 'Unnamed Geometry'),
                    geometry_type=geom_data.get('type', 'cube'),
                    position=geom_data.get('position', {}),
                    rotation=geom_data.get('rotation', {}),
                    scale=geom_data.get('scale', {}),
                    color=geom_data.get('color', '#888888'),
                    opacity=geom_data.get('opacity', 1.0),
                    transparent=geom_data.get('transparent', False),
                    geometry_parameters=geom_data.get('parameters', {}),
                    user_data=geom_data.get('userData', {})
                )
                geometry_map[geom_data.get('id', geom_data.get('name'))] = geometry
            
            # Create sensors
            sensor_map = {}
            for sensor_data in validated_data.get('sensors', []):
                sensor = Sensor.objects.create(
                    project=instance,
                    name=sensor_data.get('name', 'SENSOR1'),
                    coordinates=sensor_data.get('coordinates', {}),
                    buildup_type=sensor_data.get('buildup_type', 'automatic'),
                    equi_importance=sensor_data.get('equi_importance', False),
                    response_function=sensor_data.get('response_function', 'ambient_dose')
                )
                sensor_map[sensor_data.get('id', sensor_data.get('name'))] = sensor
            
            # Create volumes
            for vol_data in validated_data.get('volumes', []):
                geom_id = vol_data.get('geometry_id') or vol_data.get('geometry')
                geometry = geometry_map.get(geom_id) if geom_id else None
                
                comp_id = vol_data.get('composition_id') or vol_data.get('composition')
                composition = composition_map.get(comp_id) if comp_id else None
                
                spec_id = vol_data.get('spectrum_id') or vol_data.get('spectrum')
                spectrum = spectrum_map.get(spec_id) if spec_id else None
                
                if geometry:
                    Volume.objects.create(
                        project=instance,
                        geometry=geometry,
                        composition=composition,
                        spectrum=spectrum,
                        volume_name=vol_data.get('name', 'Unnamed Volume'),
                        volume_type=vol_data.get('type', 'solid'),
                        real_density=vol_data.get('real_density'),
                        tolerance=vol_data.get('tolerance'),
                        is_source=vol_data.get('is_source', False),
                        gamma_selection_mode=vol_data.get('gamma_selection_mode', 'by-lines'),
                        calculation_mode=vol_data.get('calculation_mode', 'by-lines')
                    )
            
            return instance
