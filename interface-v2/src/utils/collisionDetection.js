// Collision detection utility for draggable components
class CollisionDetector {
  constructor() {
    this.components = new Map();
  }

  // Register a component for collision detection
  registerComponent(id, getBounds) {
    this.components.set(id, getBounds);
  }

  // Unregister a component
  unregisterComponent(id) {
    this.components.delete(id);
  }

  // Check if a position would cause collision with other components
  checkCollision(id, newPosition, componentWidth, componentHeight) {
    const newBounds = {
      x: newPosition.x,
      y: newPosition.y,
      width: componentWidth,
      height: componentHeight
    };

    for (const [componentId, getBounds] of this.components) {
      if (componentId === id) continue; // Skip self
      
      const bounds = getBounds();
      if (this.rectanglesOverlap(newBounds, bounds)) {
        return { collides: true, collidingWith: componentId, bounds };
      }
    }

    return { collides: false };
  }

  // Check if a position is safe (no collision) and within screen bounds
  isPositionSafe(id, newPosition, componentWidth, componentHeight, screenWidth, screenHeight) {
    // Check screen boundaries first
    const margin = 20;
    if (newPosition.x < margin || 
        newPosition.y < margin || 
        newPosition.x + componentWidth > screenWidth - margin || 
        newPosition.y + componentHeight > screenHeight - margin) {
      return false;
    }

    // Check collision with navigation bar (top area) - ALL components must avoid this
    const navigationHeight = 60; // Estimated navigation bar height
    if (newPosition.y < navigationHeight) {
      return false;
    }

    // Special collision rules:
    // 1. Directory and Geometry Selector can't collide with each other
    // 2. All other components can collide with each other (including Directory/Geometry Selector)
    
    if (id === 'directory' || id === 'geometrySelector') {
      // Directory and Geometry Selector check collision with each other
      const collision = this.checkCollision(id, newPosition, componentWidth, componentHeight);
      return !collision.collides;
    } else {
      // All other components can collide with each other - no component-to-component collision check
      return true;
    }
  }

  // Check if two rectangles overlap
  rectanglesOverlap(rect1, rect2) {
    return !(
      rect1.x >= rect2.x + rect2.width ||
      rect2.x >= rect1.x + rect1.width ||
      rect1.y >= rect2.y + rect2.height ||
      rect2.y >= rect1.y + rect1.height
    );
  }

  // Find a safe position near the desired position
  findSafePosition(id, desiredPosition, componentWidth, componentHeight, screenWidth, screenHeight) {
    const margin = 20;
    const maxX = screenWidth - componentWidth - margin;
    const maxY = screenHeight - componentHeight - margin;

    // Try the desired position first
    let testPosition = { ...desiredPosition };
    testPosition.x = Math.max(margin, Math.min(testPosition.x, maxX));
    testPosition.y = Math.max(margin, Math.min(testPosition.y, maxY));

    const collision = this.checkCollision(id, testPosition, componentWidth, componentHeight);
    if (!collision.collides) {
      return testPosition;
    }

    // If collision, try to find a nearby safe position
    const directions = [
      { x: 0, y: -componentHeight - 10 }, // Above
      { x: componentWidth + 10, y: 0 },   // Right
      { x: 0, y: componentHeight + 10 },  // Below
      { x: -componentWidth - 10, y: 0 },  // Left
    ];

    for (const direction of directions) {
      const newPosition = {
        x: Math.max(margin, Math.min(testPosition.x + direction.x, maxX)),
        y: Math.max(margin, Math.min(testPosition.y + direction.y, maxY))
      };

      const collision = this.checkCollision(id, newPosition, componentWidth, componentHeight);
      if (!collision.collides) {
        return newPosition;
      }
    }

    // If no safe position found, return the original position (clamped to screen)
    return testPosition;
  }
}

// Create a singleton instance
const collisionDetector = new CollisionDetector();

export default collisionDetector;
