// ThreeScene Modular Architecture
// This folder contains a modular breakdown of the original ThreeScene component

export { default as ThreeScene } from './ThreeScene';
export { default as SceneManager } from './SceneManager';
export { default as CameraController } from './CameraController';
export { default as GeometryManager } from './GeometryManager';
export { default as CollisionSystem } from './CollisionSystem';
export { default as HistoryManager } from './HistoryManager';
export { default as PersistenceManager } from './PersistenceManager';
export { default as ViewManager } from './ViewManager';
export { default as EventHandler } from './EventHandler';
export { LinksManager } from './LinksManager';

// Module Responsibilities:
// - SceneManager: Core scene setup, lighting, and initialization
// - CameraController: Camera management, animations, and view controls
// - GeometryManager: Geometry creation and manipulation
// - CollisionSystem: Collision detection and particle effects
// - HistoryManager: Undo/redo functionality
// - PersistenceManager: Scene saving and loading to/from localStorage
// - ViewManager: View modes, materials, and visual effects
// - EventHandler: Input handling, keyboard shortcuts, and tool interactions
