"use client";
import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { TerrainConfig } from "@/types/models";
import { generateTerrain } from "@/utils/terrainGenerator";

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

  // Create procedural material using vertex colors
  const material = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false,
    });

    // We'll use onBeforeCompile to modify the shader for custom roughness
    material.onBeforeCompile = (shader) => {
      // Add our roughness attribute to the vertex shader
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>
        attribute float roughness;
        varying float vRoughness;`
      );

      // Pass roughness to fragment shader
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vRoughness = roughness;`
      );

      // Add varying to fragment shader
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>
        varying float vRoughness;`
      );

      // Override roughness in fragment shader
      shader.fragmentShader = shader.fragmentShader.replace(
        "roughnessFactor *= texture2D( roughnessMap, vUv ).g;",
        "roughnessFactor = vRoughness;"
      );
    };

    return material;
  }, []);

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
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    ></mesh>
  );
}
