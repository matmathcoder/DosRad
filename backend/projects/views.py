from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import (
    Project, SceneConfiguration, Geometry, Composition, 
    Spectrum, Volume, SceneHistory, CSGOperation, Sensor,
    CompoundObject, CompoundObjectGeometry, CompoundObjectComposition,
    CompoundObjectSpectrum, CompoundObjectSensor, CompoundObjectImport
)
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer, SceneConfigurationSerializer,
    GeometrySerializer, CompositionSerializer, SpectrumSerializer,
    VolumeSerializer, VolumeCreateSerializer, SceneHistorySerializer,
    CSGOperationSerializer, SensorSerializer, CompleteSceneSerializer,
    CompoundObjectSerializer, CompoundObjectListSerializer, CompoundObjectCreateSerializer,
    CompoundObjectImportSerializer, CompoundObjectImportRequestSerializer,
    CompoundObjectExportSerializer
)


class ProjectListView(generics.ListCreateAPIView):
    """List and create projects"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_public']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete projects"""
    serializer_class = ProjectDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(user=user)


class PublicProjectListView(generics.ListAPIView):
    """List public projects"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        return Project.objects.filter(is_public=True)


class SceneConfigurationView(generics.RetrieveUpdateAPIView):
    """Retrieve and update scene configuration"""
    serializer_class = SceneConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return get_object_or_404(SceneConfiguration, project=project)


class GeometryListView(generics.ListCreateAPIView):
    """List and create geometries for a project"""
    serializer_class = GeometrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Geometry.objects.filter(project=project)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        serializer.save(project=project)


class GeometryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete geometries"""
    serializer_class = GeometrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Geometry.objects.filter(project=project)


class CompositionListView(generics.ListCreateAPIView):
    """List and create compositions for a project"""
    serializer_class = CompositionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Composition.objects.filter(project=project)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        serializer.save(project=project)


class CompositionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete compositions"""
    serializer_class = CompositionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Composition.objects.filter(project=project)


class SpectrumListView(generics.ListCreateAPIView):
    """List and create spectra for a project"""
    serializer_class = SpectrumSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Spectrum.objects.filter(project=project)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        serializer.save(project=project)


class SpectrumDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete spectra"""
    serializer_class = SpectrumSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Spectrum.objects.filter(project=project)


class VolumeListView(generics.ListCreateAPIView):
    """List and create volumes for a project"""
    serializer_class = VolumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Volume.objects.filter(project=project)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        serializer.save(project=project)


class VolumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete volumes"""
    serializer_class = VolumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Volume.objects.filter(project=project)


class VolumeCreateView(generics.CreateAPIView):
    """Create volume with nested geometry, composition, and spectrum"""
    serializer_class = VolumeCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        serializer.save(project=project)


class SceneHistoryListView(generics.ListAPIView):
    """List scene history for a project"""
    serializer_class = SceneHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return SceneHistory.objects.filter(project=project)


class SaveCompleteSceneView(APIView):
    """Save complete scene data"""
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = CompleteSceneSerializer(data=request.data)
        if serializer.is_valid():
            # Set the user for the project
            project_data = serializer.validated_data['project']
            project_data['user'] = request.user
            
            # Create the complete scene
            scene_data = serializer.save()
            
            return Response({
                'message': 'Scene saved successfully',
                'project_id': scene_data['project'].id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoadCompleteSceneView(APIView):
    """Load complete scene data"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        # Get all related data
        scene_config = SceneConfiguration.objects.get(project=project)
        geometries = Geometry.objects.filter(project=project)
        compositions = Composition.objects.filter(project=project)
        spectra = Spectrum.objects.filter(project=project)
        volumes = Volume.objects.filter(project=project)
        history = SceneHistory.objects.filter(project=project)
        csg_operations = CSGOperation.objects.filter(project=project)
        
        # Serialize the data
        data = {
            'project': ProjectSerializer(project).data,
            'scene_config': SceneConfigurationSerializer(scene_config).data,
            'geometries': GeometrySerializer(geometries, many=True).data,
            'compositions': CompositionSerializer(compositions, many=True).data,
            'spectra': SpectrumSerializer(spectra, many=True).data,
            'volumes': VolumeSerializer(volumes, many=True).data,
            'history': SceneHistorySerializer(history, many=True).data,
            'csg_operations': CSGOperationSerializer(csg_operations, many=True).data,
        }
        
        return Response(data, status=status.HTTP_200_OK)


class CSGOperationListView(generics.ListCreateAPIView):
    """List and create CSG operations for a project"""
    serializer_class = CSGOperationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return CSGOperation.objects.filter(project=project)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        serializer.save(project=project)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_volume_name(request, project_id, volume_id):
    """Update volume name"""
    project = get_object_or_404(Project, id=project_id, user=request.user)
    volume = get_object_or_404(Volume, id=volume_id, project=project)
    
    new_name = request.data.get('name')
    if not new_name:
        return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update the volume name
    volume.volume_name = new_name
    volume.save()
    
    # Also update the associated geometry name if it exists
    if volume.geometry:
        volume.geometry.name = new_name
        volume.geometry.save()
    
    return Response({
        'message': 'Volume name updated successfully',
        'volume_id': volume.id,
        'new_name': new_name
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def duplicate_project(request, project_id):
    """Duplicate a project"""
    original_project = get_object_or_404(Project, id=project_id, user=request.user)
    
    with transaction.atomic():
        # Create new project
        new_project = Project.objects.create(
            name=f"{original_project.name} (Copy)",
            description=original_project.description,
            user=request.user,
            is_public=False
        )
        
        # Copy scene configuration
        if hasattr(original_project, 'scene_config'):
            SceneConfiguration.objects.create(
                project=new_project,
                camera_position=original_project.scene_config.camera_position,
                camera_rotation=original_project.scene_config.camera_rotation,
                camera_type=original_project.scene_config.camera_type,
                camera_fov=original_project.scene_config.camera_fov,
                camera_near=original_project.scene_config.camera_near,
                camera_far=original_project.scene_config.camera_far,
                background_color=original_project.scene_config.background_color,
                ambient_light_intensity=original_project.scene_config.ambient_light_intensity,
                directional_light_intensity=original_project.scene_config.directional_light_intensity,
                grid_size=original_project.scene_config.grid_size,
                grid_divisions=original_project.scene_config.grid_divisions,
                floor_constraint_enabled=original_project.scene_config.floor_constraint_enabled,
                floor_level=original_project.scene_config.floor_level,
            )
        
        # Copy compositions
        composition_map = {}
        for composition in original_project.compositions.all():
            new_composition = Composition.objects.create(
                project=new_project,
                name=composition.name,
                density=composition.density,
                color=composition.color,
                elements=composition.elements,
            )
            composition_map[composition.id] = new_composition
        
        # Copy spectra
        spectrum_map = {}
        for spectrum in original_project.spectra.all():
            new_spectrum = Spectrum.objects.create(
                project=new_project,
                name=spectrum.name,
                spectrum_type=spectrum.spectrum_type,
                multiplier=spectrum.multiplier,
                lines=spectrum.lines,
                isotopes=spectrum.isotopes,
            )
            spectrum_map[spectrum.id] = new_spectrum
        
        # Copy geometries
        geometry_map = {}
        for geometry in original_project.geometries.all():
            new_geometry = Geometry.objects.create(
                project=new_project,
                name=geometry.name,
                geometry_type=geometry.geometry_type,
                position=geometry.position,
                rotation=geometry.rotation,
                scale=geometry.scale,
                color=geometry.color,
                opacity=geometry.opacity,
                transparent=geometry.transparent,
                geometry_parameters=geometry.geometry_parameters,
                user_data=geometry.user_data,
                transform_controls_enabled=geometry.transform_controls_enabled,
                transform_mode=geometry.transform_mode,
            )
            geometry_map[geometry.id] = new_geometry
        
        # Copy volumes
        for volume in original_project.volumes.all():
            Volume.objects.create(
                project=new_project,
                geometry=geometry_map[volume.geometry.id],
                composition=composition_map.get(volume.composition.id) if volume.composition else None,
                spectrum=spectrum_map.get(volume.spectrum.id) if volume.spectrum else None,
                volume_name=volume.volume_name,
                volume_type=volume.volume_type,
                real_density=volume.real_density,
                tolerance=volume.tolerance,
                is_source=volume.is_source,
                gamma_selection_mode=volume.gamma_selection_mode,
                calculation_mode=volume.calculation_mode,
            )
    
    return Response({
        'message': 'Project duplicated successfully',
        'new_project_id': new_project.id
    }, status=status.HTTP_201_CREATED)


class SensorListView(generics.ListCreateAPIView):
    """List and create sensors for a project"""
    serializer_class = SensorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Sensor.objects.filter(project=project)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        serializer.save(project=project)


class SensorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete sensors"""
    serializer_class = SensorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return Sensor.objects.filter(project=project)


# Compound Object Views

class CompoundObjectListView(generics.ListCreateAPIView):
    """List and create compound objects for a project"""
    serializer_class = CompoundObjectListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_template', 'is_public', 'category']
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['name', 'created_at', 'last_modified']
    ordering = ['-last_modified']
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return CompoundObject.objects.filter(project=project)
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        serializer.save(project=project)


class CompoundObjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete compound objects"""
    serializer_class = CompoundObjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return CompoundObject.objects.filter(project=project)


class PublicCompoundObjectListView(generics.ListAPIView):
    """List public compound objects available for import"""
    serializer_class = CompoundObjectListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['name', 'created_at', 'last_modified']
    ordering = ['-last_modified']
    
    def get_queryset(self):
        return CompoundObject.objects.filter(is_public=True)


class CompoundObjectImportView(APIView):
    """Import a compound object into a project"""
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        serializer = CompoundObjectImportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        compound_object_id = serializer.validated_data['compound_object_id']
        position = serializer.validated_data['position']
        rotation = serializer.validated_data['rotation']
        scale = serializer.validated_data['scale']
        name_conflicts = serializer.validated_data['name_conflicts']
        
        # Get the compound object (can be from any project if public)
        compound_object = get_object_or_404(CompoundObject, id=compound_object_id)
        if not compound_object.is_public and compound_object.project != project:
            return Response(
                {'error': 'Compound object is not available for import'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create import record
        import_record = CompoundObjectImport.objects.create(
            project=project,
            compound_object=compound_object,
            position=position,
            rotation=rotation,
            scale=scale,
            name_conflicts=name_conflicts
        )
        
        # Import geometries
        imported_geometries = []
        for geom in compound_object.geometries.all():
            geometry_data = geom.geometry_data.copy()
            
            # Apply transformations
            if 'position' in geometry_data:
                geometry_data['position']['x'] += position['x']
                geometry_data['position']['y'] += position['y']
                geometry_data['position']['z'] += position['z']
            
            if 'rotation' in geometry_data:
                geometry_data['rotation']['x'] += rotation['x']
                geometry_data['rotation']['y'] += rotation['y']
                geometry_data['rotation']['z'] += rotation['z']
            
            if 'scale' in geometry_data:
                geometry_data['scale']['x'] *= scale['x']
                geometry_data['scale']['y'] *= scale['y']
                geometry_data['scale']['z'] *= scale['z']
            
            # Resolve name conflicts
            if 'name' in geometry_data and geometry_data['name'] in name_conflicts:
                geometry_data['name'] = name_conflicts[geometry_data['name']]
            
            # Create geometry in project
            new_geometry = Geometry.objects.create(
                project=project,
                name=geometry_data.get('name', f'Imported_{compound_object.name}'),
                geometry_type=geometry_data.get('geometry_type', 'cube'),
                position=geometry_data.get('position', {'x': 0, 'y': 0, 'z': 0}),
                rotation=geometry_data.get('rotation', {'x': 0, 'y': 0, 'z': 0}),
                scale=geometry_data.get('scale', {'x': 1, 'y': 1, 'z': 1}),
                color=geometry_data.get('color', '#888888'),
                opacity=geometry_data.get('opacity', 1.0),
                transparent=geometry_data.get('transparent', False),
                geometry_parameters=geometry_data.get('geometry_parameters', {}),
                user_data=geometry_data.get('user_data', {}),
                transform_controls_enabled=geometry_data.get('transform_controls_enabled', True),
                transform_mode=geometry_data.get('transform_mode', 'translate')
            )
            imported_geometries.append(new_geometry.id)
        
        # Import compositions
        imported_compositions = []
        for comp in compound_object.compositions.all():
            composition_data = comp.composition_data.copy()
            
            # Resolve name conflicts
            if 'name' in composition_data and composition_data['name'] in name_conflicts:
                composition_data['name'] = name_conflicts[composition_data['name']]
            
            # Create composition in project
            new_composition = Composition.objects.create(
                project=project,
                name=composition_data.get('name', f'Imported_{compound_object.name}'),
                density=composition_data.get('density', 1.0),
                color=composition_data.get('color', '#888888'),
                elements=composition_data.get('elements', [])
            )
            imported_compositions.append(new_composition.id)
        
        # Import spectra
        imported_spectra = []
        for spec in compound_object.spectra.all():
            spectrum_data = spec.spectrum_data.copy()
            
            # Resolve name conflicts
            if 'name' in spectrum_data and spectrum_data['name'] in name_conflicts:
                spectrum_data['name'] = name_conflicts[spectrum_data['name']]
            
            # Create spectrum in project
            new_spectrum = Spectrum.objects.create(
                project=project,
                name=spectrum_data.get('name', f'Imported_{compound_object.name}'),
                spectrum_type=spectrum_data.get('spectrum_type', 'line'),
                multiplier=spectrum_data.get('multiplier', 1.0),
                lines=spectrum_data.get('lines', []),
                isotopes=spectrum_data.get('isotopes', [])
            )
            imported_spectra.append(new_spectrum.id)
        
        # Import sensors
        imported_sensors = []
        for sensor in compound_object.sensors.all():
            sensor_data = sensor.sensor_data.copy()
            
            # Apply position transformation
            if 'coordinates' in sensor_data:
                sensor_data['coordinates']['x'] += position['x']
                sensor_data['coordinates']['y'] += position['y']
                sensor_data['coordinates']['z'] += position['z']
            
            # Resolve name conflicts
            if 'name' in sensor_data and sensor_data['name'] in name_conflicts:
                sensor_data['name'] = name_conflicts[sensor_data['name']]
            
            # Create sensor in project
            new_sensor = Sensor.objects.create(
                project=project,
                name=sensor_data.get('name', f'Imported_{compound_object.name}'),
                coordinates=sensor_data.get('coordinates', {'x': 0, 'y': 0, 'z': 0}),
                buildup_type=sensor_data.get('buildup_type', 'automatic'),
                equi_importance=sensor_data.get('equi_importance', False),
                response_function=sensor_data.get('response_function', 'ambient_dose')
            )
            imported_sensors.append(new_sensor.id)
        
        # Update import record with created objects
        import_record.imported_geometries = imported_geometries
        import_record.imported_compositions = imported_compositions
        import_record.imported_spectra = imported_spectra
        import_record.imported_sensors = imported_sensors
        import_record.save()
        
        return Response({
            'message': 'Compound object imported successfully',
            'import_id': import_record.id,
            'imported_objects': {
                'geometries': len(imported_geometries),
                'compositions': len(imported_compositions),
                'spectra': len(imported_spectra),
                'sensors': len(imported_sensors)
            }
        }, status=status.HTTP_201_CREATED)


class CompoundObjectExportView(APIView):
    """Export selected objects as a compound object"""
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        serializer = CompoundObjectExportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create compound object
        compound_object = CompoundObject.objects.create(
            project=project,
            name=serializer.validated_data['name'],
            description=serializer.validated_data.get('description', ''),
            category=serializer.validated_data.get('category', 'General'),
            tags=serializer.validated_data.get('tags', []),
            is_template=serializer.validated_data.get('is_template', False),
            is_public=serializer.validated_data.get('is_public', False),
            file_path=f"/MercuradObjects/{serializer.validated_data['category']}/{serializer.validated_data['name']}.mercurad"
        )
        
        # Export geometries
        geometry_ids = serializer.validated_data.get('geometry_ids', [])
        geometries = Geometry.objects.filter(id__in=geometry_ids, project=project)
        for i, geometry in enumerate(geometries):
            CompoundObjectGeometry.objects.create(
                compound_object=compound_object,
                original_geometry=geometry,
                geometry_data={
                    'name': geometry.name,
                    'geometry_type': geometry.geometry_type,
                    'position': geometry.position,
                    'rotation': geometry.rotation,
                    'scale': geometry.scale,
                    'color': geometry.color,
                    'opacity': geometry.opacity,
                    'transparent': geometry.transparent,
                    'geometry_parameters': geometry.geometry_parameters,
                    'user_data': geometry.user_data,
                    'transform_controls_enabled': geometry.transform_controls_enabled,
                    'transform_mode': geometry.transform_mode
                },
                order=i
            )
        
        # Export compositions
        composition_ids = serializer.validated_data.get('composition_ids', [])
        compositions = Composition.objects.filter(id__in=composition_ids, project=project)
        for composition in compositions:
            CompoundObjectComposition.objects.create(
                compound_object=compound_object,
                original_composition=composition,
                composition_data={
                    'name': composition.name,
                    'density': composition.density,
                    'color': composition.color,
                    'elements': composition.elements
                }
            )
        
        # Export spectra
        spectrum_ids = serializer.validated_data.get('spectrum_ids', [])
        spectra = Spectrum.objects.filter(id__in=spectrum_ids, project=project)
        for spectrum in spectra:
            CompoundObjectSpectrum.objects.create(
                compound_object=compound_object,
                original_spectrum=spectrum,
                spectrum_data={
                    'name': spectrum.name,
                    'spectrum_type': spectrum.spectrum_type,
                    'multiplier': spectrum.multiplier,
                    'lines': spectrum.lines,
                    'isotopes': spectrum.isotopes
                }
            )
        
        # Export sensors
        sensor_ids = serializer.validated_data.get('sensor_ids', [])
        sensors = Sensor.objects.filter(id__in=sensor_ids, project=project)
        for sensor in sensors:
            CompoundObjectSensor.objects.create(
                compound_object=compound_object,
                original_sensor=sensor,
                sensor_data={
                    'name': sensor.name,
                    'coordinates': sensor.coordinates,
                    'buildup_type': sensor.buildup_type,
                    'equi_importance': sensor.equi_importance,
                    'response_function': sensor.response_function
                }
            )
        
        # Update counts
        compound_object.volumes_count = geometries.count()
        compound_object.compositions_count = compositions.count()
        compound_object.spectra_count = spectra.count()
        compound_object.sensors_count = sensors.count()
        compound_object.save()
        
        return Response({
            'message': 'Compound object exported successfully',
            'compound_object_id': compound_object.id,
            'exported_objects': {
                'geometries': geometries.count(),
                'compositions': compositions.count(),
                'spectra': spectra.count(),
                'sensors': sensors.count()
            }
        }, status=status.HTTP_201_CREATED)


class CompoundObjectImportHistoryView(generics.ListAPIView):
    """List import history for a project"""
    serializer_class = CompoundObjectImportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id, user=self.request.user)
        return CompoundObjectImport.objects.filter(project=project)
