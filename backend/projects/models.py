from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()


class Project(models.Model):
    """Project model to store scene configurations"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.user.email}"
    
    class Meta:
        ordering = ['-updated_at']


class SceneConfiguration(models.Model):
    """Scene configuration model"""
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='scene_config')
    
    # Camera settings
    camera_position = models.JSONField(default=dict)  # {x, y, z}
    camera_rotation = models.JSONField(default=dict)  # {x, y, z}
    camera_type = models.CharField(max_length=20, default='perspective')  # perspective/orthographic
    camera_fov = models.FloatField(default=75.0)
    camera_near = models.FloatField(default=0.1)
    camera_far = models.FloatField(default=1000.0)
    
    # Scene settings
    background_color = models.CharField(max_length=7, default='#262626')
    ambient_light_intensity = models.FloatField(default=1.2)
    directional_light_intensity = models.FloatField(default=3.0)
    
    # Grid settings
    grid_size = models.FloatField(default=10.0)
    grid_divisions = models.IntegerField(default=10)
    
    # Floor constraint
    floor_constraint_enabled = models.BooleanField(default=True)
    floor_level = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Scene Config - {self.project.name}"


class Geometry(models.Model):
    """3D geometry objects in the scene"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='geometries')
    
    # Basic properties
    name = models.CharField(max_length=255)
    geometry_type = models.CharField(max_length=50)  # cube, sphere, cylinder, cone
    position = models.JSONField(default=dict)  # {x, y, z}
    rotation = models.JSONField(default=dict)  # {x, y, z}
    scale = models.JSONField(default=dict)  # {x, y, z}
    
    # Material properties
    color = models.CharField(max_length=7, default='#888888')
    opacity = models.FloatField(default=1.0)
    transparent = models.BooleanField(default=False)
    
    # Geometry-specific parameters
    geometry_parameters = models.JSONField(default=dict)  # width, height, depth, radius, etc.
    
    # User data
    user_data = models.JSONField(default=dict)  # volumeName, id, etc.
    
    # Transform controls
    transform_controls_enabled = models.BooleanField(default=True)
    transform_mode = models.CharField(max_length=20, default='translate')  # translate, rotate, scale
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.geometry_type}) - {self.project.name}"
    
    class Meta:
        ordering = ['created_at']


class Composition(models.Model):
    """Material compositions for volumes"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='compositions')
    
    name = models.CharField(max_length=255)
    density = models.FloatField()
    color = models.CharField(max_length=7)
    elements = models.JSONField(default=list)  # [{element, percentage}]
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"


class Spectrum(models.Model):
    """Radiation spectra for volumes"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='spectra')
    
    name = models.CharField(max_length=255)
    spectrum_type = models.CharField(max_length=20)  # line, group
    multiplier = models.FloatField(default=1.0)
    
    # Line spectrum data
    lines = models.JSONField(default=list)  # [{energy, intensity}]
    
    # Group spectrum data
    isotopes = models.JSONField(default=list)  # [isotope_symbols]
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.spectrum_type}) - {self.project.name}"


class Volume(models.Model):
    """Volume model linking geometry, composition, and spectrum"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='volumes')
    geometry = models.OneToOneField(Geometry, on_delete=models.CASCADE, related_name='volume')
    composition = models.ForeignKey(Composition, on_delete=models.SET_NULL, null=True, blank=True)
    spectrum = models.ForeignKey(Spectrum, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Volume properties
    volume_name = models.CharField(max_length=255)
    volume_type = models.CharField(max_length=20, default='solid')  # solid, liquid, gas, compound
    real_density = models.FloatField(null=True, blank=True)
    tolerance = models.FloatField(null=True, blank=True)
    
    # Source properties
    is_source = models.BooleanField(default=False)
    gamma_selection_mode = models.CharField(max_length=20, default='by-lines')  # by-lines, by-groups, by-isotope
    calculation_mode = models.CharField(max_length=20, default='by-lines')  # by-lines, by-groups
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.volume_name} - {self.project.name}"
    
    class Meta:
        ordering = ['created_at']


class SceneHistory(models.Model):
    """Scene history for undo/redo functionality"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='history')
    
    # Scene state snapshot
    scene_state = models.JSONField()  # Complete scene state at this point
    
    # Metadata
    action_name = models.CharField(max_length=100)  # "Add Cube", "Move Object", etc.
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.action_name} - {self.project.name} ({self.timestamp})"
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Scene histories'


class CSGOperation(models.Model):
    """CSG (Constructive Solid Geometry) operations"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='csg_operations')
    
    operation_type = models.CharField(max_length=20)  # union, subtract, intersect, split
    source_objects = models.JSONField()  # IDs of source objects
    result_object = models.ForeignKey(Geometry, on_delete=models.CASCADE, related_name='csg_results')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.operation_type} - {self.project.name}"
    
    class Meta:
        ordering = ['-created_at']
