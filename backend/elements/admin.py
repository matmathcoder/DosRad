from django.contrib import admin
from .models import (
    Element, Isotope, NeutronCrossSection, DecayPath, NeutronReaction,
    GammaSpectrum, ElementComposition, IsotopeSource
)


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ['atomic_number', 'symbol', 'name', 'atomic_mass', 'density']
    list_filter = ['atomic_number']
    search_fields = ['symbol', 'name']
    ordering = ['atomic_number']


@admin.register(Isotope)
class IsotopeAdmin(admin.ModelAdmin):
    list_display = ['element', 'mass_number', 'half_life', 'is_stable', 'abundance']
    list_filter = ['is_stable', 'element']
    search_fields = ['element__symbol', 'element__name', 'mass_number']
    ordering = ['element__atomic_number', 'mass_number']


@admin.register(NeutronCrossSection)
class NeutronCrossSectionAdmin(admin.ModelAdmin):
    list_display = ['isotope', 'reaction', 'energy', 'cross_section', 'origin']
    list_filter = ['reaction', 'isotope__element']
    search_fields = ['isotope__element__symbol', 'reaction']
    ordering = ['isotope__element__atomic_number', 'isotope__mass_number', 'energy']


@admin.register(DecayPath)
class DecayPathAdmin(admin.ModelAdmin):
    list_display = ['parent_isotope', 'daughter_isotope', 'decay_type', 'branching_ratio', 'q_value']
    list_filter = ['decay_type', 'parent_isotope__element']
    search_fields = ['parent_isotope__element__symbol', 'daughter_isotope__element__symbol']
    ordering = ['parent_isotope__element__atomic_number', 'parent_isotope__mass_number']


@admin.register(NeutronReaction)
class NeutronReactionAdmin(admin.ModelAdmin):
    list_display = ['target_isotope', 'product_isotope', 'reaction_type', 'threshold_energy', 'q_value']
    list_filter = ['reaction_type', 'target_isotope__element']
    search_fields = ['target_isotope__element__symbol', 'product_isotope__element__symbol']
    ordering = ['target_isotope__element__atomic_number', 'target_isotope__mass_number']


@admin.register(GammaSpectrum)
class GammaSpectrumAdmin(admin.ModelAdmin):
    list_display = ['isotope', 'energy', 'intensity', 'multipolarity', 'origin']
    list_filter = ['isotope__element', 'multipolarity']
    search_fields = ['isotope__element__symbol']
    ordering = ['isotope__element__atomic_number', 'isotope__mass_number', 'energy']


@admin.register(ElementComposition)
class ElementCompositionAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'density', 'phase', 'molecular_weight']
    list_filter = ['project', 'phase']
    search_fields = ['name', 'project__name']
    ordering = ['project__name', 'name']


@admin.register(IsotopeSource)
class IsotopeSourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'isotope', 'activity', 'source_type']
    list_filter = ['project', 'source_type', 'isotope__element']
    search_fields = ['name', 'project__name', 'isotope__element__symbol']
    ordering = ['project__name', 'name']