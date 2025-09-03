from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import (
    Project, SceneConfiguration, Geometry, Composition, 
    Spectrum, Volume, SceneHistory, CSGOperation
)
from .serializers import (
    ProjectSerializer, ProjectDetailSerializer, SceneConfigurationSerializer,
    GeometrySerializer, CompositionSerializer, SpectrumSerializer,
    VolumeSerializer, VolumeCreateSerializer, SceneHistorySerializer,
    CSGOperationSerializer, CompleteSceneSerializer
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
