from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    # Project management
    path('', views.ProjectListView.as_view(), name='project-list'),
    path('public/', views.PublicProjectListView.as_view(), name='public-project-list'),
    path('<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('<int:project_id>/duplicate/', views.duplicate_project, name='duplicate-project'),
    
    # Scene configuration
    path('<int:project_id>/scene-config/', views.SceneConfigurationView.as_view(), name='scene-config'),
    
    # Geometries
    path('<int:project_id>/geometries/', views.GeometryListView.as_view(), name='geometry-list'),
    path('<int:project_id>/geometries/<int:pk>/', views.GeometryDetailView.as_view(), name='geometry-detail'),
    
    # Compositions
    path('<int:project_id>/compositions/', views.CompositionListView.as_view(), name='composition-list'),
    path('<int:project_id>/compositions/<int:pk>/', views.CompositionDetailView.as_view(), name='composition-detail'),
    
    # Spectra
    path('<int:project_id>/spectra/', views.SpectrumListView.as_view(), name='spectrum-list'),
    path('<int:project_id>/spectra/<int:pk>/', views.SpectrumDetailView.as_view(), name='spectrum-detail'),
    
    # Volumes
    path('<int:project_id>/volumes/', views.VolumeListView.as_view(), name='volume-list'),
    path('<int:project_id>/volumes/<int:pk>/', views.VolumeDetailView.as_view(), name='volume-detail'),
    path('<int:project_id>/volumes/create/', views.VolumeCreateView.as_view(), name='volume-create'),
    path('<int:project_id>/volumes/<int:volume_id>/update-name/', views.update_volume_name, name='update-volume-name'),
    
    # Scene history
    path('<int:project_id>/history/', views.SceneHistoryListView.as_view(), name='history-list'),
    
    # Sensors
    path('<int:project_id>/sensors/', views.SensorListView.as_view(), name='sensor-list'),
    path('<int:project_id>/sensors/<int:pk>/', views.SensorDetailView.as_view(), name='sensor-detail'),
    
    # CSG operations
    path('<int:project_id>/csg-operations/', views.CSGOperationListView.as_view(), name='csg-operation-list'),
    
    # Complete scene save/load
    path('save-complete-scene/', views.SaveCompleteSceneView.as_view(), name='save-complete-scene'),
    path('<int:project_id>/load-complete-scene/', views.LoadCompleteSceneView.as_view(), name='load-complete-scene'),
    
    # Compound objects
    path('<int:project_id>/compound-objects/', views.CompoundObjectListView.as_view(), name='compound-object-list'),
    path('<int:project_id>/compound-objects/<int:pk>/', views.CompoundObjectDetailView.as_view(), name='compound-object-detail'),
    path('compound-objects/public/', views.PublicCompoundObjectListView.as_view(), name='public-compound-object-list'),
    path('<int:project_id>/compound-objects/import/', views.CompoundObjectImportView.as_view(), name='compound-object-import'),
    path('<int:project_id>/compound-objects/export/', views.CompoundObjectExportView.as_view(), name='compound-object-export'),
    path('<int:project_id>/compound-objects/import-history/', views.CompoundObjectImportHistoryView.as_view(), name='compound-object-import-history'),
    
    # Mesh configuration URLs
    path('volumes/<int:volume_id>/mesh-configurations/', views.MeshConfigurationView.as_view(), name='mesh-configuration-list'),
    path('mesh-configurations/<int:pk>/', views.MeshConfigurationDetailView.as_view(), name='mesh-configuration-detail'),
    
    # Computation configuration URLs
    path('<int:project_id>/computation-configurations/', views.ComputationConfigurationView.as_view(), name='computation-configuration-list'),
    path('computation-configurations/<int:pk>/', views.ComputationConfigurationDetailView.as_view(), name='computation-configuration-detail'),
    
    # Computation result URLs
    path('<int:project_id>/computation-results/', views.ComputationResultView.as_view(), name='computation-result-list'),
    path('computation-results/<int:pk>/', views.ComputationResultDetailView.as_view(), name='computation-result-detail'),
    
    # Tolerance configuration URLs
    path('volumes/<int:volume_id>/tolerance-configurations/', views.ToleranceConfigurationView.as_view(), name='tolerance-configuration-list'),
    path('tolerance-configurations/<int:pk>/', views.ToleranceConfigurationDetailView.as_view(), name='tolerance-configuration-detail'),
    
    # Monte-Carlo computation URLs
    path('<int:project_id>/start-computation/', views.start_computation, name='start-computation'),
    path('<int:project_id>/computation-results/', views.get_computation_results, name='get-computation-results'),
]
