# ThreeScene Modular Architecture

This folder contains a modular breakdown of the original ThreeScene component, which was over 2000 lines long. The code has been divided into 8 logical modules, each with specific responsibilities.

## Module Structure

### 1. **ThreeScene.jsx** (Main Coordinator)
- **Purpose**: Main component that orchestrates all modules
- **Responsibilities**: 
  - Module initialization and coordination
  - State management and passing shared refs
  - Exposing global functions to window
  - Main animation loop coordination
- **Lines**: ~150 lines

### 2. **SceneManager.js** (Core Setup)
- **Purpose**: Core Three.js scene setup and management
- **Responsibilities**:
  - Renderer configuration
  - Lighting setup (directional, ambient, point, hemisphere lights)
  - Scene initialization (grid, ground plane)
  - Window resize handling
  - Resource cleanup
- **Lines**: ~100 lines

### 3. **CameraController.js** (Camera Management)
- **Purpose**: All camera-related functionality
- **Responsibilities**:
  - Perspective and orthographic camera setup
  - Orbit controls management
  - Camera animations and transitions
  - Zoom controls and axis views
  - Home view management
  - Scene rotation controls
- **Lines**: ~250 lines

### 4. **GeometryManager.js** (Geometry Operations)
- **Purpose**: Geometry creation and manipulation
- **Responsibilities**:
  - Geometry creation (cube, sphere, cylinder, cone)
  - CSG operations (union, subtract, intersect)
  - Volume reduction functionality
  - Material and view mode application
  - Solid angle line management
  - Geometry deletion and cleanup
- **Lines**: ~400 lines

### 5. **CollisionSystem.js** (Physics & Effects)
- **Purpose**: Collision detection and particle effects
- **Responsibilities**:
  - Bounding sphere calculations
  - Collision detection between geometries
  - Collision response (separation, visual feedback)
  - Impact particle effects
  - Particle animation and lifecycle
- **Lines**: ~150 lines

### 6. **HistoryManager.js** (Undo/Redo System)
- **Purpose**: Scene history and undo/redo functionality
- **Responsibilities**:
  - Scene state snapshots
  - History stack management
  - Undo/redo operations
  - Scene state restoration
  - History size limiting
  - Visual feedback for undo/redo
- **Lines**: ~200 lines

### 7. **PersistenceManager.js** (Data Persistence)
- **Purpose**: Scene saving and loading
- **Responsibilities**:
  - LocalStorage scene serialization
  - Scene data restoration
  - Auto-save functionality
  - Scene clearing
  - Data format management
- **Lines**: ~150 lines

### 8. **ViewManager.js** (Visual Effects)
- **Purpose**: View modes and visual effects
- **Responsibilities**:
  - View mode switching (solid, wireframe, points)
  - Material mode management
  - Cut plane creation/removal
  - Solid angle lines management
  - Mesh visibility controls
  - Normal view reset
- **Lines**: ~200 lines

### 9. **EventHandler.js** (Input Management)
- **Purpose**: User input and interaction handling
- **Responsibilities**:
  - Keyboard shortcut handling
  - Mouse/pointer event processing
  - Transform controls setup
  - Tool selection management
  - CSG operation handling
  - Drag and drop functionality
  - Object selection/deselection
- **Lines**: ~300 lines

## Benefits of This Architecture

### 1. **Maintainability**
- Each module has a single, clear responsibility
- Easier to locate and fix bugs
- Cleaner code organization

### 2. **Scalability**
- Easy to add new features to specific modules
- Modules can be extended independently
- Clear interfaces between modules

### 3. **Testability**
- Each module can be unit tested in isolation
- Dependencies are clearly defined
- Easier to mock interactions

### 4. **Readability**
- No more 2000+ line files
- Logical grouping of related functionality
- Self-documenting module names

### 5. **Reusability**
- Modules can potentially be reused in other projects
- Clear separation of concerns
- Standardized module interfaces

## Module Communication

Modules communicate through:
- **Shared Refs**: Core Three.js objects (scene, renderer, geometries)
- **Shared State**: React state and setters
- **Callbacks**: Parent component callbacks for external communication
- **Method Calls**: Direct method invocation between modules

## Future Improvements

1. **Dependency Injection**: More formal dependency injection system
2. **Event System**: Internal event bus for module communication
3. **Configuration**: Centralized configuration management
4. **Plugin System**: Ability to add/remove modules dynamically
5. **TypeScript**: Convert to TypeScript for better type safety

## Usage

The modular system is designed to be a drop-in replacement for the original ThreeScene component. The main ThreeScene.jsx file now simply imports and exports the new modular version.

```javascript
import ThreeScene from './ThreeScene/ThreeScene';
// or
import { ThreeScene } from './ThreeScene';
```

All original functionality is preserved while providing a much cleaner and more maintainable codebase.
