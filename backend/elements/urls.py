from django.urls import path
from . import views

urlpatterns = [
    # Element endpoints
    path('elements/', views.ElementListView.as_view(), name='element-list'),
    path('elements/<int:pk>/', views.ElementDetailView.as_view(), name='element-detail'),
    path('elements/search/', views.search_elements, name='element-search'),
    
    # Isotope endpoints
    path('isotopes/', views.IsotopeListView.as_view(), name='isotope-list'),
    path('isotopes/<int:pk>/', views.IsotopeDetailView.as_view(), name='isotope-detail'),
    path('isotopes/<int:isotope_id>/cross-sections/', views.get_isotope_cross_sections, name='isotope-cross-sections'),
    path('isotopes/<int:isotope_id>/gamma-spectrum/', views.get_isotope_gamma_spectrum, name='isotope-gamma-spectrum'),
    
    # Cross section endpoints
    path('cross-sections/', views.NeutronCrossSectionListView.as_view(), name='cross-section-list'),
    
    # Decay path endpoints
    path('decay-paths/', views.DecayPathListView.as_view(), name='decay-path-list'),
    
    # Gamma spectrum endpoints
    path('gamma-spectra/', views.GammaSpectrumListView.as_view(), name='gamma-spectrum-list'),
    
    # Project-specific endpoints
    path('projects/<int:project_id>/compositions/', views.ElementCompositionListView.as_view(), name='project-composition-list'),
    path('projects/<int:project_id>/compositions/<int:pk>/', views.ElementCompositionDetailView.as_view(), name='project-composition-detail'),
    path('projects/<int:project_id>/sources/', views.IsotopeSourceListView.as_view(), name='project-source-list'),
    path('projects/<int:project_id>/sources/<int:pk>/', views.IsotopeSourceDetailView.as_view(), name='project-source-detail'),
    
    # Simulation endpoints
    path('simulate/', views.simulate_decay_chain, name='simulate-decay-chain'),
]
