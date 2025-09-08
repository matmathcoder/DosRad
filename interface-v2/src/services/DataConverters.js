/**
 * Data Conversion Utilities
 * Handles conversion between frontend and backend data formats
 */
export class DataConverters {
  /**
   * Convert frontend scene data to backend format
   */
  static convertSceneToBackendFormat(sceneData) {
    const {
      project,
      sceneConfig,
      geometries,
      compositions,
      spectra,
      volumes,
      history,
      csgOperations
    } = sceneData;

    return {
      project: {
        name: project.name,
        description: project.description,
        is_public: project.isPublic || false,
      },
      scene_config: {
        camera_position: sceneConfig.cameraPosition,
        camera_rotation: sceneConfig.cameraRotation,
        camera_type: sceneConfig.cameraType,
        camera_fov: sceneConfig.cameraFov,
        camera_near: sceneConfig.cameraNear,
        camera_far: sceneConfig.cameraFar,
        background_color: sceneConfig.backgroundColor,
        ambient_light_intensity: sceneConfig.ambientLightIntensity,
        directional_light_intensity: sceneConfig.directionalLightIntensity,
        grid_size: sceneConfig.gridSize,
        grid_divisions: sceneConfig.gridDivisions,
        floor_constraint_enabled: sceneConfig.floorConstraintEnabled,
        floor_level: sceneConfig.floorLevel,
      },
      geometries: geometries.map(geom => ({
        name: geom.name,
        geometry_type: geom.type,
        position: geom.position,
        rotation: geom.rotation,
        scale: geom.scale,
        color: geom.color,
        opacity: geom.opacity,
        transparent: geom.transparent,
        geometry_parameters: geom.parameters,
        user_data: geom.userData,
        transform_controls_enabled: geom.transformControlsEnabled,
        transform_mode: geom.transformMode,
      })),
      compositions: compositions.map(comp => ({
        name: comp.name,
        density: comp.density,
        color: comp.color,
        elements: comp.elements,
      })),
      spectra: spectra.map(spec => ({
        name: spec.name,
        spectrum_type: spec.type,
        multiplier: spec.multiplier,
        lines: spec.lines,
        isotopes: spec.isotopes,
      })),
      volumes: volumes.map(vol => ({
        volume_name: vol.name,
        volume_type: vol.type,
        real_density: vol.realDensity,
        tolerance: vol.tolerance,
        is_source: vol.isSource,
        gamma_selection_mode: vol.gammaSelectionMode,
        calculation_mode: vol.calculationMode,
        geometry_id: vol.geometryId,
        composition_id: vol.compositionId,
        spectrum_id: vol.spectrumId,
      })),
      history: history.map(hist => ({
        action_name: hist.actionName,
        scene_state: hist.sceneState,
      })),
      csg_operations: csgOperations.map(csg => ({
        operation_type: csg.operationType,
        source_objects: csg.sourceObjects,
        result_object_id: csg.resultObjectId,
      })),
    };
  }

  /**
   * Convert backend data to frontend scene format
   */
  static convertBackendToSceneFormat(backendData) {
    const {
      project,
      scene_config,
      geometries,
      compositions,
      spectra,
      volumes,
      history,
      csg_operations
    } = backendData;

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        isPublic: project.is_public,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
      sceneConfig: {
        cameraPosition: scene_config.camera_position,
        cameraRotation: scene_config.camera_rotation,
        cameraType: scene_config.camera_type,
        cameraFov: scene_config.camera_fov,
        cameraNear: scene_config.camera_near,
        cameraFar: scene_config.camera_far,
        backgroundColor: scene_config.background_color,
        ambientLightIntensity: scene_config.ambient_light_intensity,
        directionalLightIntensity: scene_config.directional_light_intensity,
        gridSize: scene_config.grid_size,
        gridDivisions: scene_config.grid_divisions,
        floorConstraintEnabled: scene_config.floor_constraint_enabled,
        floorLevel: scene_config.floor_level,
      },
      geometries: geometries.map(geom => ({
        id: geom.id,
        name: geom.name,
        type: geom.geometry_type,
        position: geom.position,
        rotation: geom.rotation,
        scale: geom.scale,
        color: geom.color,
        opacity: geom.opacity,
        transparent: geom.transparent,
        parameters: geom.geometry_parameters,
        userData: geom.user_data,
        transformControlsEnabled: geom.transform_controls_enabled,
        transformMode: geom.transform_mode,
      })),
      compositions: compositions.map(comp => ({
        id: comp.id,
        name: comp.name,
        density: comp.density,
        color: comp.color,
        elements: comp.elements,
      })),
      spectra: spectra.map(spec => ({
        id: spec.id,
        name: spec.name,
        type: spec.spectrum_type,
        multiplier: spec.multiplier,
        lines: spec.lines,
        isotopes: spec.isotopes,
      })),
      volumes: volumes.map(vol => ({
        id: vol.id,
        name: vol.volume_name,
        type: vol.volume_type,
        realDensity: vol.real_density,
        tolerance: vol.tolerance,
        isSource: vol.is_source,
        gammaSelectionMode: vol.gamma_selection_mode,
        calculationMode: vol.calculation_mode,
        geometryId: vol.geometry?.id,
        compositionId: vol.composition?.id,
        spectrumId: vol.spectrum?.id,
      })),
      history: history.map(hist => ({
        id: hist.id,
        actionName: hist.action_name,
        sceneState: hist.scene_state,
        timestamp: hist.timestamp,
      })),
      csgOperations: csg_operations.map(csg => ({
        id: csg.id,
        operationType: csg.operation_type,
        sourceObjects: csg.source_objects,
        resultObjectId: csg.result_object?.id,
      })),
    };
  }
}
