import * as THREE from 'three';

export interface CollisionObject {
  mesh: THREE.Mesh;
  boundingBox: THREE.Box3;
  id: string;
}

export class CollisionManager {
  private objects: CollisionObject[] = [];

  // Add object to collision detection
  addObject(mesh: THREE.Mesh, id: string): void {
    // Create a bounding box around the mesh
    const boundingBox = new THREE.Box3().setFromObject(mesh);

    this.objects.push({
      mesh,
      boundingBox,
      id,
    });
  }

  // Remove object from collision detection
  removeObject(id: string): void {
    this.objects = this.objects.filter(obj => obj.id !== id);
  }

  // Update bounding box for an object
  updateObject(id: string): void {
    const object = this.objects.find(obj => obj.id === id);

    if (object) {
      object.boundingBox.setFromObject(object.mesh);
    }
  }

  // Check if position is valid (no collision)
  isPositionValid(mesh: THREE.Mesh, id: string): boolean {
    // Create a temporary bounding box for the mesh at its current position
    const testBox = new THREE.Box3().setFromObject(mesh);

    // Check for intersections with other objects (except itself)
    return !this.objects.some(obj => {
      if (obj.id === id) return false;
      return testBox.intersectsBox(obj.boundingBox);
    });
  }

  // Find a valid position near the target position
  findValidPosition(
    mesh: THREE.Mesh,
    targetPosition: THREE.Vector3,
    id: string,
    maxAttempts: number = 10,
    maxOffset: number = 10
  ): THREE.Vector3 {
    // Save original position
    const originalPosition = mesh.position.clone();

    // First try the exact position
    mesh.position.copy(targetPosition);
    if (this.isPositionValid(mesh, id)) {
      return targetPosition.clone();
    }

    // Try various offsets
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const offsetScale = (attempt / maxAttempts) * maxOffset;

      // Try 8 directions around the point
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const offsetX = Math.cos(angle) * offsetScale;
        const offsetZ = Math.sin(angle) * offsetScale;

        const testPosition = new THREE.Vector3(
          targetPosition.x + offsetX,
          targetPosition.y,
          targetPosition.z + offsetZ
        );

        mesh.position.copy(testPosition);
        if (this.isPositionValid(mesh, id)) {
          return testPosition;
        }
      }
    }

    // Restore original position if no valid position found
    mesh.position.copy(originalPosition);
    return originalPosition;
  }
}

export const collisionManager = new CollisionManager();
