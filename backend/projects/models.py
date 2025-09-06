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


class Sensor(models.Model):
    """Sensor model for dose calculation points"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sensors')
    
    # Basic properties
    name = models.CharField(max_length=8)  # Maximum 8 alphanumeric characters
    coordinates = models.JSONField()  # {x, y, z} in cm
    
    # Build-up factor settings
    BUILDUP_CHOICES = [
        ('automatic', 'Automatic'),
        ('composition', 'For given composition'),
        ('none', 'No build-up factor')
    ]
    buildup_type = models.CharField(max_length=20, choices=BUILDUP_CHOICES, default='automatic')
    selected_composition = models.ForeignKey(Composition, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Calculation settings
    equi_importance = models.BooleanField(default=False)
    
    # Response function
    RESPONSE_CHOICES = [
        ('ambient_dose', 'Ambient dose equivalent rate'),
        ('effective_dose', 'Effective (anterior posterior) dose rate'),
        ('kerma_air', 'KERMA rate in Air (μGy/h)'),
        ('kerma_rad', 'KERMA rate in Air (mrad/h)'),
        ('exposure', 'Exposure (mR/h)'),
        ('energy_flux', 'Energy flux rate (MeV/s)'),
        ('uncollided_flux', 'Uncollided flux (gammas/cm²/s)')
    ]
    response_function = models.CharField(max_length=20, choices=RESPONSE_CHOICES, default='ambient_dose')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"
    
    class Meta:
        ordering = ['created_at']
        unique_together = ['project', 'name']


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


class CompoundObject(models.Model):
    """Compound objects that can be imported into scenes"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='compound_objects')
    
    # Basic properties
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file_path = models.CharField(max_length=500)  # Path to the .mercurad file
    file_size = models.BigIntegerField(default=0)  # File size in bytes
    
    # Compound object metadata
    version = models.CharField(max_length=20, default='1.0.0')
    created_by = models.CharField(max_length=255, blank=True)
    tags = models.JSONField(default=list)  # List of tags for categorization
    
    # Object counts
    volumes_count = models.IntegerField(default=0)
    compositions_count = models.IntegerField(default=0)
    spectra_count = models.IntegerField(default=0)
    sensors_count = models.IntegerField(default=0)
    
    # Import/Export settings
    is_template = models.BooleanField(default=False)  # Can be used as template
    is_public = models.BooleanField(default=False)  # Available to other users
    category = models.CharField(max_length=100, default='General')  # Storage, Piping, Reactor, etc.
    
    # File system metadata
    last_modified = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"
    
    class Meta:
        ordering = ['-last_modified']
        unique_together = ['project', 'name']


class CompoundObjectGeometry(models.Model):
    """Geometries within a compound object"""
    compound_object = models.ForeignKey(CompoundObject, on_delete=models.CASCADE, related_name='geometries')
    
    # Reference to original geometry (if imported from existing project)
    original_geometry = models.ForeignKey(Geometry, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Geometry data (stored as JSON for compound objects)
    geometry_data = models.JSONField()  # Complete geometry definition
    
    # Order within compound object
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.compound_object.name} - Geometry {self.order}"
    
    class Meta:
        ordering = ['order']


class CompoundObjectComposition(models.Model):
    """Compositions within a compound object"""
    compound_object = models.ForeignKey(CompoundObject, on_delete=models.CASCADE, related_name='compositions')
    
    # Reference to original composition (if imported from existing project)
    original_composition = models.ForeignKey(Composition, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Composition data (stored as JSON for compound objects)
    composition_data = models.JSONField()  # Complete composition definition
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.compound_object.name} - {self.composition_data.get('name', 'Unknown')}"
    
    class Meta:
        ordering = ['created_at']


class CompoundObjectSpectrum(models.Model):
    """Spectra within a compound object"""
    compound_object = models.ForeignKey(CompoundObject, on_delete=models.CASCADE, related_name='spectra')
    
    # Reference to original spectrum (if imported from existing project)
    original_spectrum = models.ForeignKey(Spectrum, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Spectrum data (stored as JSON for compound objects)
    spectrum_data = models.JSONField()  # Complete spectrum definition
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.compound_object.name} - {self.spectrum_data.get('name', 'Unknown')}"
    
    class Meta:
        ordering = ['created_at']


class CompoundObjectSensor(models.Model):
    """Sensors within a compound object"""
    compound_object = models.ForeignKey(CompoundObject, on_delete=models.CASCADE, related_name='sensors')
    
    # Reference to original sensor (if imported from existing project)
    original_sensor = models.ForeignKey(Sensor, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Sensor data (stored as JSON for compound objects)
    sensor_data = models.JSONField()  # Complete sensor definition
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.compound_object.name} - {self.sensor_data.get('name', 'Unknown')}"
    
    class Meta:
        ordering = ['created_at']


class CompoundObjectImport(models.Model):
    """Track compound object imports into projects"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='compound_imports')
    compound_object = models.ForeignKey(CompoundObject, on_delete=models.CASCADE, related_name='imports')
    
    # Import settings
    position = models.JSONField(default=dict)  # {x, y, z}
    rotation = models.JSONField(default=dict)  # {x, y, z}
    scale = models.JSONField(default=dict)  # {x, y, z}
    
    # Conflict resolution
    name_conflicts = models.JSONField(default=dict)  # {original_name: resolved_name}
    
    # Imported objects references
    imported_geometries = models.JSONField(default=list)  # IDs of created geometries
    imported_compositions = models.JSONField(default=list)  # IDs of created compositions
    imported_spectra = models.JSONField(default=list)  # IDs of created spectra
    imported_sensors = models.JSONField(default=list)  # IDs of created sensors
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Import {self.compound_object.name} -> {self.project.name}"
    
    class Meta:
        ordering = ['-created_at']


class ExampleScene(models.Model):
    """Predefined example scenes for quick setup"""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=100, default='General')  # Container, Drum, etc.
    
    # Scene configuration
    scene_data = models.JSONField()  # Complete scene definition including geometries, compositions, spectra
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.category}"
    
    class Meta:
        ordering = ['category', 'name']


class ExampleSceneGeometry(models.Model):
    """Geometries within an example scene"""
    example_scene = models.ForeignKey(ExampleScene, on_delete=models.CASCADE, related_name='geometries')
    
    # Geometry definition
    name = models.CharField(max_length=255)
    geometry_type = models.CharField(max_length=50)  # cube, sphere, cylinder, cone
    position = models.JSONField(default=dict)  # {x, y, z}
    rotation = models.JSONField(default=dict)  # {x, y, z}
    scale = models.JSONField(default=dict)  # {x, y, z}
    geometry_parameters = models.JSONField(default=dict)  # width, height, depth, radius, etc.
    
    # Material properties
    color = models.CharField(max_length=7, default='#404040')
    opacity = models.FloatField(default=1.0)
    transparent = models.BooleanField(default=False)
    
    # Order within scene
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.example_scene.name} - {self.name}"
    
    class Meta:
        ordering = ['order']


class ExampleSceneComposition(models.Model):
    """Compositions within an example scene"""
    example_scene = models.ForeignKey(ExampleScene, on_delete=models.CASCADE, related_name='compositions')
    
    # Composition definition
    name = models.CharField(max_length=255)
    density = models.FloatField()
    color = models.CharField(max_length=7)
    elements = models.JSONField(default=list)  # [{element, percentage}]
    
    def __str__(self):
        return f"{self.example_scene.name} - {self.name}"
    
    class Meta:
        ordering = ['name']


class ExampleSceneSpectrum(models.Model):
    """Spectra within an example scene"""
    example_scene = models.ForeignKey(ExampleScene, on_delete=models.CASCADE, related_name='spectra')
    
    # Spectrum definition
    name = models.CharField(max_length=255)
    spectrum_type = models.CharField(max_length=20)  # line, group
    multiplier = models.FloatField(default=1.0)
    lines = models.JSONField(default=list)  # [{energy, intensity}]
    isotopes = models.JSONField(default=list)  # [isotope_symbols]
    
    def __str__(self):
        return f"{self.example_scene.name} - {self.name}"
    
    class Meta:
        ordering = ['name']


class ExampleSceneVolume(models.Model):
    """Volume definitions within an example scene"""
    example_scene = models.ForeignKey(ExampleScene, on_delete=models.CASCADE, related_name='volumes')
    geometry = models.ForeignKey(ExampleSceneGeometry, on_delete=models.CASCADE)
    composition = models.ForeignKey(ExampleSceneComposition, on_delete=models.SET_NULL, null=True, blank=True)
    spectrum = models.ForeignKey(ExampleSceneSpectrum, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Volume properties
    volume_name = models.CharField(max_length=255)
    volume_type = models.CharField(max_length=20, default='solid')  # solid, liquid, gas, compound
    real_density = models.FloatField(null=True, blank=True)
    tolerance = models.FloatField(null=True, blank=True)
    
    # Source properties
    is_source = models.BooleanField(default=False)
    gamma_selection_mode = models.CharField(max_length=20, default='by-lines')
    calculation_mode = models.CharField(max_length=20, default='by-lines')
    
    def __str__(self):
        return f"{self.example_scene.name} - {self.volume_name}"
    
    class Meta:
        ordering = ['volume_name']
