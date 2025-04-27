'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { ModelData } from '@/types/models';
import { collisionManager } from '@/utils/collisionManager';
import { getHeightAtPosition } from '@/utils/terrainGenerator';

interface ModelProps {
  model: ModelData;
  terrain: THREE.Mesh | null;
  onUpdatePosition: (id: string, position: THREE.Vector3) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

// Single model component
function Model({ model, terrain, onUpdatePosition, onSelect, isSelected }: ModelProps) {
  const { scene } = useGLTF(model.path);
  const meshRef = useRef<THREE.Group>(null);
  const { raycaster, camera, scene: threeScene } = useThree();

  useEffect(() => {
    if (meshRef.current) {
      // Clone the scene to avoid affecting the original
      const clonedScene = scene.clone();

      // Add to the mesh ref group
      meshRef.current.clear();
      meshRef.current.add(clonedScene);

      // Apply initial transform
      meshRef.current.scale.set(model.scale, model.scale, model.scale);
      meshRef.current.rotation.set(model.rotation[0], model.rotation[1], model.rotation[2]);

      // Find the main mesh inside the loaded group
      const mainMesh = findMainMesh(meshRef.current);

      if (mainMesh) {
        // Add to collision system
        collisionManager.addObject(mainMesh, model.id);

        // Position on terrain if available
        if (terrain) {
          placeOnTerrain(meshRef.current, terrain, model.position);
        } else {
          meshRef.current.position.set(model.position[0], model.position[1], model.position[2]);
        }
      }
    }

    return () => {
      collisionManager.removeObject(model.id);
    };
  }, [model, terrain]);

  // Helper to find a mesh in the loaded model
  const findMainMesh = (group: THREE.Group): THREE.Mesh | null => {
    let mainMesh: THREE.Mesh | null = null;

    group.traverse(child => {
      if (child instanceof THREE.Mesh && !mainMesh) {
        mainMesh = child;
      }
    });

    return mainMesh;
  };

  // Place model on terrain
  const placeOnTerrain = (
    group: THREE.Group,
    terrain: THREE.Mesh,
    position: [number, number, number]
  ) => {
    const x = position[0];
    const z = position[2];

    // Get height at position
    const height = getHeightAtPosition(terrain, x, z);

    // Set position with calculated height
    group.position.set(x, height + 0.5, z); // Adding offset to ensure model sits on terrain

    // Update collision
    const mainMesh = findMainMesh(group);
    if (mainMesh) {
      collisionManager.updateObject(model.id);
    }

    // Notify position change
    onUpdatePosition(model.id, group.position);
  };

  // Handle dragging
  const handleDrag = (event: THREE.Event) => {
    if (!isSelected || !terrain || !meshRef.current) return;

    // Cast ray from cursor position
    const rect = event.target.ownerDocument
      .getElementById('scene-container')
      ?.getBoundingClientRect();
    if (!rect) return;

    const x = (((event as unknown as MouseEvent).clientX - rect.left) / rect.width) * 2 - 1;
    const y = (-((event as unknown as MouseEvent).clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera({ x, y }, camera);

    // Check intersection with terrain
    const intersects = raycaster.intersectObject(terrain);

    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;

      // Get main mesh for collision check
      const mainMesh = findMainMesh(meshRef.current);

      if (mainMesh) {
        // Find a valid position (avoiding collisions)
        const validPosition = collisionManager.findValidPosition(
          mainMesh,
          intersectionPoint,
          model.id
        );

        // Update position
        meshRef.current.position.copy(validPosition);
        collisionManager.updateObject(model.id);

        // Notify parent
        onUpdatePosition(model.id, validPosition);
      }
    }
  };

  return (
    <group
      ref={meshRef}
      onClick={() => onSelect(model.id)}
      onPointerMove={isSelected ? handleDrag : undefined}>
      {/* Highlight when selected */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial wireframe color="yellow" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

interface ModelManagerProps {
  models: ModelData[];
  terrain: THREE.Mesh | null;
  onUpdateModel: (id: string, position: THREE.Vector3) => void;
}

export default function ModelManager({ models, terrain, onUpdateModel }: ModelManagerProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // Handle model selection
  const handleSelectModel = (id: string) => {
    setSelectedModel(id === selectedModel ? null : id);
  };

  // Handle position updates
  const handleUpdatePosition = (id: string, position: THREE.Vector3) => {
    onUpdateModel(id, position);
  };

  return (
    <>
      {models.map(model => (
        <Model
          key={model.id}
          model={model}
          terrain={terrain}
          onUpdatePosition={handleUpdatePosition}
          onSelect={handleSelectModel}
          isSelected={selectedModel === model.id}
        />
      ))}
    </>
  );
}

// Pre-load the GLTF models to avoid errors
useGLTF.preload('/models/tree.glb');
useGLTF.preload('/models/rock.glb');
useGLTF.preload('/models/house.glb');
