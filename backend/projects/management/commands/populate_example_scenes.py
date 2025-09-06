from django.core.management.base import BaseCommand
from projects.models import (
    ExampleScene, ExampleSceneGeometry, ExampleSceneComposition, 
    ExampleSceneSpectrum, ExampleSceneVolume
)


class Command(BaseCommand):
    help = 'Populate example scenes (CBFK-Type-Container and DUMTUTOR-PCS)'

    def handle(self, *args, **options):
        self.stdout.write('Creating example scenes...')
        
        # Create CBFK-Type-Container scene
        self.create_cbfk_container()
        
        # Create DUMTUTOR-PCS scene
        self.create_dumtutor_pcs()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created example scenes!')
        )

    def create_cbfk_container(self):
        """Create CBFK-Type-Container example scene"""
        scene, created = ExampleScene.objects.get_or_create(
            name='CBFK-Type-Container',
            defaults={
                'description': 'Standard storage container with mild steel walls and homogeneous source',
                'category': 'Container',
                'scene_data': {
                    'dimensions': {'width': 100, 'height': 100, 'depth': 100},  # 1m x 1m x 1m
                    'wall_thickness': 0.5,  # 0.5cm mild steel
                    'source_height': 69.5,  # 69.5cm
                    'materials': ['mild_steel', 'air', 'source']
                }
            }
        )
        
        if not created:
            self.stdout.write('CBFK-Type-Container already exists, skipping...')
            return

        # Create compositions
        mild_steel_comp = ExampleSceneComposition.objects.create(
            example_scene=scene,
            name='Mild Steel',
            density=7.85,  # g/cm³
            color='#A9A9A9',
            elements=[
                {'element': 'Fe', 'percentage': 98.0},
                {'element': 'C', 'percentage': 2.0}
            ]
        )

        air_comp = ExampleSceneComposition.objects.create(
            example_scene=scene,
            name='Air',
            density=0.001225,  # g/cm³
            color='#87CEEB',
            elements=[
                {'element': 'N', 'percentage': 78.09},
                {'element': 'O', 'percentage': 20.95},
                {'element': 'Ar', 'percentage': 0.93},
                {'element': 'CO2', 'percentage': 0.03}
            ]
        )

        source_comp = ExampleSceneComposition.objects.create(
            example_scene=scene,
            name='Homogeneous Source',
            density=2.5,  # g/cm³ (glass matrix)
            color='#FFD700',
            elements=[
                {'element': 'Si', 'percentage': 45.0},
                {'element': 'O', 'percentage': 40.0},
                {'element': 'Na', 'percentage': 10.0},
                {'element': 'Ca', 'percentage': 5.0}
            ]
        )

        # Create geometries
        container_geom = ExampleSceneGeometry.objects.create(
            example_scene=scene,
            name='container',
            geometry_type='cube',
            position={'x': 0, 'y': 0, 'z': 0},
            rotation={'x': 0, 'y': 0, 'z': 0},
            scale={'x': 1, 'y': 1, 'z': 1},
            geometry_parameters={'width': 100, 'height': 100, 'depth': 100},
            color='#A9A9A9',
            order=1
        )

        source_geom = ExampleSceneGeometry.objects.create(
            example_scene=scene,
            name='source',
            geometry_type='cube',
            position={'x': 0, 'y': 0, 'z': 0},
            rotation={'x': 0, 'y': 0, 'z': 0},
            scale={'x': 0.99, 'y': 0.695, 'z': 0.99},  # 69.5cm height
            geometry_parameters={'width': 99, 'height': 69.5, 'depth': 99},
            color='#FFD700',
            order=2
        )

        air_geom = ExampleSceneGeometry.objects.create(
            example_scene=scene,
            name='air_inside',
            geometry_type='cube',
            position={'x': 0, 'y': 0, 'z': 0},
            rotation={'x': 0, 'y': 0, 'z': 0},
            scale={'x': 0.99, 'y': 1, 'z': 0.99},
            geometry_parameters={'width': 99, 'height': 100, 'depth': 99},
            color='#87CEEB',
            order=3
        )

        # Create volumes
        ExampleSceneVolume.objects.create(
            example_scene=scene,
            geometry=container_geom,
            composition=mild_steel_comp,
            volume_name='container',
            volume_type='solid',
            real_density=7.85,
            is_source=False
        )

        ExampleSceneVolume.objects.create(
            example_scene=scene,
            geometry=source_geom,
            composition=source_comp,
            volume_name='source',
            volume_type='solid',
            real_density=2.5,
            is_source=True,
            gamma_selection_mode='by-lines',
            calculation_mode='by-lines'
        )

        ExampleSceneVolume.objects.create(
            example_scene=scene,
            geometry=air_geom,
            composition=air_comp,
            volume_name='air_inside',
            volume_type='gas',
            real_density=0.001225,
            is_source=False
        )

        self.stdout.write('Created CBFK-Type-Container scene')

    def create_dumtutor_pcs(self):
        """Create DUMTUTOR-PCS example scene"""
        scene, created = ExampleScene.objects.get_or_create(
            name='DUMTUTOR-PCS',
            defaults={
                'description': 'Steel drum containing glass matrix source',
                'category': 'Drum',
                'scene_data': {
                    'dimensions': {'height': 100, 'diameter': 60},  # 1m high, 0.6m diameter
                    'wall_thickness': 0.2,  # 0.2cm mild steel
                    'source_height': 69.8,  # 69.8cm
                    'materials': ['mild_steel', 'air', 'glass_matrix']
                }
            }
        )
        
        if not created:
            self.stdout.write('DUMTUTOR-PCS already exists, skipping...')
            return

        # Create compositions
        mild_steel_comp = ExampleSceneComposition.objects.create(
            example_scene=scene,
            name='Mild Steel',
            density=7.85,  # g/cm³
            color='#A9A9A9',
            elements=[
                {'element': 'Fe', 'percentage': 98.0},
                {'element': 'C', 'percentage': 2.0}
            ]
        )

        air_comp = ExampleSceneComposition.objects.create(
            example_scene=scene,
            name='Air',
            density=0.001225,  # g/cm³
            color='#87CEEB',
            elements=[
                {'element': 'N', 'percentage': 78.09},
                {'element': 'O', 'percentage': 20.95},
                {'element': 'Ar', 'percentage': 0.93},
                {'element': 'CO2', 'percentage': 0.03}
            ]
        )

        glass_matrix_comp = ExampleSceneComposition.objects.create(
            example_scene=scene,
            name='Glass Matrix',
            density=2.7,  # g/cm³
            color='#FFD700',
            elements=[
                {'element': 'Si', 'percentage': 45.0},
                {'element': 'O', 'percentage': 40.0},
                {'element': 'Na', 'percentage': 10.0},
                {'element': 'Ca', 'percentage': 5.0}
            ]
        )

        # Create geometries
        drum_geom = ExampleSceneGeometry.objects.create(
            example_scene=scene,
            name='drum',
            geometry_type='cylinder',
            position={'x': 0, 'y': 0, 'z': 0},
            rotation={'x': 0, 'y': 0, 'z': 0},
            scale={'x': 1, 'y': 1, 'z': 1},
            geometry_parameters={'radiusTop': 30, 'radiusBottom': 30, 'height': 100},
            color='#A9A9A9',
            order=1
        )

        source_geom = ExampleSceneGeometry.objects.create(
            example_scene=scene,
            name='source',
            geometry_type='cylinder',
            position={'x': 0, 'y': 0, 'z': 0},
            rotation={'x': 0, 'y': 0, 'z': 0},
            scale={'x': 0.997, 'y': 0.698, 'z': 0.997},  # 69.8cm height, slightly smaller radius
            geometry_parameters={'radiusTop': 29.9, 'radiusBottom': 29.9, 'height': 69.8},
            color='#FFD700',
            order=2
        )

        air_geom = ExampleSceneGeometry.objects.create(
            example_scene=scene,
            name='air_inside',
            geometry_type='cylinder',
            position={'x': 0, 'y': 0, 'z': 0},
            rotation={'x': 0, 'y': 0, 'z': 0},
            scale={'x': 0.997, 'y': 1, 'z': 0.997},
            geometry_parameters={'radiusTop': 29.9, 'radiusBottom': 29.9, 'height': 100},
            color='#87CEEB',
            order=3
        )

        # Create volumes
        ExampleSceneVolume.objects.create(
            example_scene=scene,
            geometry=drum_geom,
            composition=mild_steel_comp,
            volume_name='drum',
            volume_type='solid',
            real_density=7.85,
            is_source=False
        )

        ExampleSceneVolume.objects.create(
            example_scene=scene,
            geometry=source_geom,
            composition=glass_matrix_comp,
            volume_name='source',
            volume_type='solid',
            real_density=2.7,
            is_source=True,
            gamma_selection_mode='by-lines',
            calculation_mode='by-lines'
        )

        ExampleSceneVolume.objects.create(
            example_scene=scene,
            geometry=air_geom,
            composition=air_comp,
            volume_name='air_inside',
            volume_type='gas',
            real_density=0.001225,
            is_source=False
        )

        self.stdout.write('Created DUMTUTOR-PCS scene')
