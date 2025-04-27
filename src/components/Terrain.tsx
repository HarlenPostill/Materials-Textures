'use client';
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { TerrainConfig } from '@/types/models';
import { generateTerrain } from '@/utils/terrainGenerator';

interface TerrainProps {
  config: TerrainConfig;
  onTerrainGenerated?: (terrain: THREE.Mesh) => void;
}

export default function Terrain({ config, onTerrainGenerated }: TerrainProps) {
  const terrainRef = useRef<THREE.Mesh>(null);

  // Generate terrain geometry based on config
  const geometry = useMemo(() => {
    return generateTerrain(config);
  }, [config]);

  // Load textures with proper typing
  const textures = useTexture({
    map: '/textures/terrain/ground_diffuse.jpg',
    normalMap: '/textures/terrain/ground_normal.jpg',
    roughnessMap: '/textures/terrain/ground_roughness.jpg',
    aoMap: '/textures/terrain/ground_ao.jpg',
    displacementMap: '/textures/terrain/ground_height.jpg',
  });

  // Apply texture properties
  useEffect(() => {
    if (!textures) return;

    // Configure all texture properties
    Object.values(textures).forEach(texture => {
      if (texture instanceof THREE.Texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(config.width / 10, config.height / 10);
      }
    });
  }, [textures, config]);

  // Notify parent component when terrain is ready
  useEffect(() => {
    if (terrainRef.current && onTerrainGenerated) {
      onTerrainGenerated(terrainRef.current);
    }
  }, [terrainRef.current, onTerrainGenerated]);

  return (
    <mesh
      ref={terrainRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow>
      <meshStandardMaterial
        map={textures.map}
        normalMap={textures.normalMap}
        normalScale={new THREE.Vector2(1, 1)}
        roughnessMap={textures.roughnessMap}
        roughness={0.9}
        aoMap={textures.aoMap}
        displacementMap={textures.displacementMap}
        displacementScale={0.1}
        metalness={0.1}
      />
    </mesh>
  );
}
