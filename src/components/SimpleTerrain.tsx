// components/SimpleTerrain.tsx
'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

interface SimpleTerrainProps {
  size?: number;
  resolution?: number;
  height?: number;
  onTerrainGenerated?: (heightMap: number[][], size: number) => void;
}

export function SimpleTerrain({
  size = 500,
  resolution = 128,
  height = 30,
  onTerrainGenerated,
}: SimpleTerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate terrain geometry and heightmap
  const { geometry, heightMap } = useMemo(() => {
    console.log('Generating terrain...');

    // Create simplex noise function using the correct API
    const noise2D = createNoise2D();

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
    const vertices = geometry.attributes.position.array;

    // Initialize heightmap
    const heightMap: number[][] = Array(resolution + 1)
      .fill(0)
      .map(() => Array(resolution + 1).fill(0));

    // Set heights using simplex noise
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i] / size;
      const z = vertices[i + 2] / size;

      // Generate noise value using the noise2D function
      const noise = noise2D(x * 5, z * 5);

      // Set vertex height
      const y = noise * height;
      vertices[i + 1] = y;

      // Store in heightmap for later use
      const xIndex = Math.floor(i / 3) % (resolution + 1);
      const zIndex = Math.floor(i / (3 * (resolution + 1)));
      heightMap[xIndex][zIndex] = y;
    }

    // Update normals for lighting calculations
    geometry.computeVertexNormals();

    return { geometry, heightMap };
  }, [size, resolution, height]);

  // Notify parent component when terrain is generated
  // Using an additional ref to prevent infinite updates
  const initializedRef = useRef(false);

  useEffect(() => {
    if (onTerrainGenerated && !initializedRef.current) {
      initializedRef.current = true;
      onTerrainGenerated(heightMap, size);
    }
  }, [heightMap, size, onTerrainGenerated]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color="#4b7f52"
        roughness={0.8}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Helper functions to get height and normal at position
export function getHeightAtPosition(
  heightMap: number[][],
  position: THREE.Vector3,
  terrainSize: number
): number {
  if (!heightMap) return 0;

  const resolution = heightMap.length - 1;

  // Convert world position to grid coordinates
  const halfSize = terrainSize / 2;
  const gridX = Math.floor(((position.x + halfSize) / terrainSize) * resolution);
  const gridZ = Math.floor(((position.z + halfSize) / terrainSize) * resolution);

  // Check bounds
  if (gridX < 0 || gridX >= resolution || gridZ < 0 || gridZ >= resolution) {
    return 0;
  }

  return heightMap[gridX][gridZ];
}
