import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';
import { TerrainConfig } from '@/types/models';

// Generate terrain geometry based on noise
export function generateTerrain(config: TerrainConfig): THREE.BufferGeometry {
  const { width, height, segmentsX, segmentsZ, amplitude, seed } = config;

  // Create a seeded noise generator
  const noise2D = createNoise2D(() => seed);

  // Create plane geometry
  const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsZ);
  const positions = geometry.attributes.position as THREE.BufferAttribute;

  // Update vertex positions based on noise
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);

    // Generate noise value based on position
    const nx = x / width;
    const nz = z / height;

    // Multi-octave noise for more natural terrain
    const y1 = noise2D(nx * 1.5, nz * 1.5) * amplitude;
    const y2 = noise2D(nx * 3, nz * 3) * (amplitude * 0.5);
    const y3 = noise2D(nx * 6, nz * 6) * (amplitude * 0.25);

    // Set new Y position
    positions.setY(i, y1 + y2 + y3);
  }

  // Update normals and tangents
  geometry.computeVertexNormals();
  geometry.computeTangents();

  return geometry;
}

// Helper function to get height at a specific point
export function getHeightAtPosition(terrain: THREE.Mesh, x: number, z: number): number {
  const raycaster = new THREE.Raycaster();
  const position = new THREE.Vector3(x, 1000, z);
  const direction = new THREE.Vector3(0, -1, 0);

  raycaster.set(position, direction);
  const intersects = raycaster.intersectObject(terrain);

  if (intersects.length > 0) {
    return intersects[0].point.y;
  }

  return 0;
}
