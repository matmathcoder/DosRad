from django.contrib import admin
from .models import (
    Project, SceneConfiguration, Geometry, Composition, 
    Spectrum, Volume, SceneHistory, CSGOperation
)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_public', 'created_at', 'updated_at')
    list_filter = ('is_public', 'created_at', 'updated_at')
    search_fields = ('name', 'description', 'user__email')
    ordering = ('-updated_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SceneConfiguration)
class SceneConfigurationAdmin(admin.ModelAdmin):
    list_display = ('project', 'camera_type', 'background_color', 'floor_constraint_enabled')
    list_filter = ('camera_type', 'floor_constraint_enabled')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Geometry)
class GeometryAdmin(admin.ModelAdmin):
    list_display = ('name', 'geometry_type', 'project', 'position', 'created_at')
    list_filter = ('geometry_type', 'transparent', 'transform_controls_enabled', 'created_at')
    search_fields = ('name', 'project__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Composition)
class CompositionAdmin(admin.ModelAdmin):
    list_display = ('name', 'density', 'color', 'project', 'created_at')
    list_filter = ('density', 'created_at')
    search_fields = ('name', 'project__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Spectrum)
class SpectrumAdmin(admin.ModelAdmin):
    list_display = ('name', 'spectrum_type', 'multiplier', 'project', 'created_at')
    list_filter = ('spectrum_type', 'created_at')
    search_fields = ('name', 'project__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Volume)
class VolumeAdmin(admin.ModelAdmin):
    list_display = ('volume_name', 'volume_type', 'is_source', 'project', 'created_at')
    list_filter = ('volume_type', 'is_source', 'gamma_selection_mode', 'calculation_mode', 'created_at')
    search_fields = ('volume_name', 'project__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SceneHistory)
class SceneHistoryAdmin(admin.ModelAdmin):
    list_display = ('action_name', 'project', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('action_name', 'project__name')
    readonly_fields = ('timestamp',)


@admin.register(CSGOperation)
class CSGOperationAdmin(admin.ModelAdmin):
    list_display = ('operation_type', 'project', 'created_at')
    list_filter = ('operation_type', 'created_at')
    search_fields = ('project__name',)
    readonly_fields = ('created_at',)
