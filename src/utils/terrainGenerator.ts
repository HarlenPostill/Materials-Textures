// src/utils/terrainGenerator.ts
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";
import { TerrainConfig } from "@/types/models";

// Generate terrain geometry based on noise
export function generateTerrain(config: TerrainConfig): THREE.BufferGeometry {
  const { width, height, segmentsX, segmentsZ, amplitude, seed } = config;

  // Create seeded noise generators
  const heightNoise = createNoise2D(() => seed);
  const detailNoise = createNoise2D(() => seed + 1);
  const moistureNoise = createNoise2D(() => seed + 2);
  const roughnessNoise = createNoise2D(() => seed + 3);

  // Create plane geometry
  const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsZ);
  const positions = geometry.attributes.position as THREE.BufferAttribute;

  // Create additional attribute buffers for procedural texturing
  const vertexCount = positions.count;
  const colorArray = new Float32Array(vertexCount * 3);
  const roughnessArray = new Float32Array(vertexCount);

  // Temporary array to store heights for calculating slopes
  const heightMap = new Array(segmentsX + 1)
    .fill(0)
    .map(() => new Array(segmentsZ + 1).fill(0));

  // First pass: Calculate heights
  let idx = 0;
  for (let z = 0; z <= segmentsZ; z++) {
    for (let x = 0; x <= segmentsX; x++) {
      // Get normalized position for noise sampling
      const nx = x / segmentsX;
      const nz = z / segmentsZ;

      // Multi-octave noise for natural terrain
      const y1 = heightNoise(nx * 1.5, nz * 1.5) * amplitude;
      const y2 = heightNoise(nx * 3, nz * 3) * (amplitude * 0.5);
      const y3 = detailNoise(nx * 6, nz * 6) * (amplitude * 0.25);
      const y4 = detailNoise(nx * 12, nz * 12) * (amplitude * 0.125);

      // Combined height
      const height = y1 + y2 + y3 + y4;

      // Store in height map for slope calculations
      heightMap[x][z] = height;

      // Update vertex position
      positions.setY(idx, height);
      idx++;
    }
  }

  // Second pass: Calculate colors and material properties
  idx = 0;
  for (let z = 0; z <= segmentsZ; z++) {
    for (let x = 0; x <= segmentsX; x++) {
      const nx = x / segmentsX;
      const nz = z / segmentsZ;

      const height = heightMap[x][z];
      const normalizedHeight = (height + amplitude) / (amplitude * 2); // 0-1 range

      // Calculate slope by comparing neighbors
      let slope = 0;
      if (x > 0 && x < segmentsX && z > 0 && z < segmentsZ) {
        const left = heightMap[x - 1][z];
        const right = heightMap[x + 1][z];
        const top = heightMap[x][z - 1];
        const bottom = heightMap[x][z + 1];

        const dx = Math.abs(right - left) / 2;
        const dz = Math.abs(bottom - top) / 2;

        slope = Math.min(Math.sqrt(dx * dx + dz * dz) / (amplitude * 0.1), 1);
      }

      // Generate moisture value
      const moisture = (moistureNoise(nx * 3, nz * 3) + 1) * 0.5;

      // Calculate roughness
      const baseRoughness = (roughnessNoise(nx * 5, nz * 5) + 1) * 0.5;
      const roughness = Math.min(baseRoughness + slope * 0.3, 1);
      roughnessArray[idx] = roughness;

      // Color blending based on height, slope and moisture
      let r, g, b;

      // Sand (yellow/tan) for low, dry areas
      const sandColor = { r: 0.9, g: 0.8, b: 0.6 };
      // Grass (green) for mid areas with moisture
      const grassColor = { r: 0.3, g: 0.5, b: 0.2 };
      // Rock (gray) for steep areas
      const rockColor = { r: 0.5, g: 0.5, b: 0.5 };
      // Snow (white) for high areas
      const snowColor = { r: 0.9, g: 0.9, b: 0.9 };

      // Base color on height
      const snowLine = 0.75;
      const rockLine = 0.5;
      const grassLine = 0.25;

      if (normalizedHeight > snowLine) {
        // Snow on peaks
        const t = (normalizedHeight - snowLine) / (1 - snowLine);
        r = THREE.MathUtils.lerp(rockColor.r, snowColor.r, t);
        g = THREE.MathUtils.lerp(rockColor.g, snowColor.g, t);
        b = THREE.MathUtils.lerp(rockColor.b, snowColor.b, t);
      } else if (normalizedHeight > rockLine) {
        // Rock in high areas
        const t = (normalizedHeight - rockLine) / (snowLine - rockLine);
        r = THREE.MathUtils.lerp(grassColor.r, rockColor.r, t);
        g = THREE.MathUtils.lerp(grassColor.g, rockColor.g, t);
        b = THREE.MathUtils.lerp(grassColor.b, rockColor.b, t);
      } else if (normalizedHeight > grassLine) {
        // Grass in middle areas
        const t = (normalizedHeight - grassLine) / (rockLine - grassLine);
        r = THREE.MathUtils.lerp(sandColor.r, grassColor.r, t);
        g = THREE.MathUtils.lerp(sandColor.g, grassColor.g, t);
        b = THREE.MathUtils.lerp(sandColor.b, grassColor.b, t);
      } else {
        // Sand in low areas
        r = sandColor.r;
        g = sandColor.g;
        b = sandColor.b;
      }

      // Slope affects color (more rock on steep slopes)
      if (slope > 0.3) {
        const rockInfluence = (slope - 0.3) / 0.7;
        r = THREE.MathUtils.lerp(r, rockColor.r, rockInfluence);
        g = THREE.MathUtils.lerp(g, rockColor.g, rockInfluence);
        b = THREE.MathUtils.lerp(b, rockColor.b, rockInfluence);
      }

      // Moisture affects color (more grass with moisture)
      if (normalizedHeight < snowLine && moisture > 0.5 && slope < 0.5) {
        const moistureInfluence = ((moisture - 0.5) / 0.5) * 0.5;
        r = THREE.MathUtils.lerp(r, grassColor.r, moistureInfluence);
        g = THREE.MathUtils.lerp(g, grassColor.g, moistureInfluence);
        b = THREE.MathUtils.lerp(b, grassColor.b, moistureInfluence);
      }

      // Add slight color variation
      const variation = detailNoise(nx * 10, nz * 10) * 0.05;
      r = Math.max(0, Math.min(1, r + variation));
      g = Math.max(0, Math.min(1, g + variation));
      b = Math.max(0, Math.min(1, b + variation));

      // Set color
      const colorIdx = idx * 3;
      colorArray[colorIdx] = r;
      colorArray[colorIdx + 1] = g;
      colorArray[colorIdx + 2] = b;

      idx++;
    }
  }

  // Add attributes to geometry
  geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
  geometry.setAttribute(
    "roughness",
    new THREE.BufferAttribute(roughnessArray, 1)
  );

  // Update normals
  geometry.computeVertexNormals();

  return geometry;
}

// Helper function to get height at a specific point
export function getHeightAtPosition(
  terrain: THREE.Mesh,
  x: number,
  z: number
): number {
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
