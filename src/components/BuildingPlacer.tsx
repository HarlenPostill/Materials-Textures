'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { getHeightAtPosition } from './SimpleTerrain';

interface BuildingPlacerProps {
  heightMap: number[][];
  terrainSize: number;
}

interface Building {
  id: number;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

export function BuildingPlacer({ heightMap, terrainSize }: BuildingPlacerProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedType, setSelectedType] = useState<'small' | 'medium' | 'large'>('medium');
  const [placementMode, setPlacementMode] = useState<boolean>(false);
  const { camera, raycaster, mouse, scene } = useThree();

  // Find terrain mesh
  const terrain = useRef<THREE.Mesh | null>(null);
  useEffect(() => {
    // Find terrain mesh once on component mount
    scene.traverse(object => {
      if (object instanceof THREE.Mesh && object.rotation.x === -Math.PI / 2) {
        terrain.current = object;
      }
    });
  }, [scene]);

  // Preview building position
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3 | null>(null);

  // Update preview position
  useFrame(() => {
    if (!placementMode || !terrain.current || !heightMap) return;

    // Update raycaster with current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersection with terrain
    const intersects = raycaster.intersectObject(terrain.current);

    if (intersects.length > 0) {
      const point = intersects[0].point;

      // Get height at this position
      const height = getHeightAtPosition(heightMap, point, terrainSize);
      point.y = height;

      // Update preview position
      setPreviewPosition(new THREE.Vector3(point.x, height, point.z));
    } else {
      setPreviewPosition(null);
    }
  });

  // Handle building placement
  const handlePlaceBuilding = (e: React.MouseEvent) => {
    if (!previewPosition) return;

    // Stop propagation to prevent orbit controls from capturing the event
    e.stopPropagation();

    // Create new building
    const buildingScale: [number, number, number] =
      selectedType === 'small' ? [3, 5, 3] : selectedType === 'large' ? [8, 15, 8] : [5, 10, 5];

    const buildingColors = {
      small: '#8FBFE0', // Light blue
      medium: '#2E8BC0', // Medium blue
      large: '#0C2D48', // Dark blue
    };

    const newBuilding: Building = {
      id: Date.now(),
      position: [previewPosition.x, previewPosition.y, previewPosition.z],
      scale: buildingScale,
      color: buildingColors[selectedType],
    };

    setBuildings(prev => [...prev, newBuilding]);
  };

  // Simple Building component
  const Building = ({
    position,
    scale,
    color,
    isPreview = false,
  }: {
    position: [number, number, number] | THREE.Vector3;
    scale: [number, number, number];
    color: string;
    isPreview?: boolean;
  }) => {
    const pos =
      position instanceof THREE.Vector3
        ? ([position.x, position.y, position.z] as [number, number, number])
        : position;

    return (
      <mesh position={pos}>
        <boxGeometry args={scale} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={isPreview ? 0.5 : 1} />
      </mesh>
    );
  };

  // Building placement UI
  const BuildingUI = () => {
    return (
      <Html fullscreen>
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '10px',
            borderRadius: '5px',
            color: 'white',
            fontFamily: 'sans-serif',
            pointerEvents: 'auto',
          }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Place Buildings</h3>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Building Type:</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as 'small' | 'medium' | 'large')}
              style={{
                background: '#333',
                color: 'white',
                border: 'none',
                padding: '5px',
                width: '100%',
                marginBottom: '10px',
              }}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            <button
              onClick={() => setPlacementMode(!placementMode)}
              style={{
                background: placementMode ? '#ff9800' : '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
              }}>
              {placementMode ? 'Cancel Placement' : 'Start Placing Buildings'}
            </button>
          </div>

          <div>
            <p>Buildings: {buildings.length}</p>
            <button
              onClick={() => setBuildings([])}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
              }}>
              Clear All
            </button>
          </div>
        </div>
      </Html>
    );
  };

  return (
    <>
      {/* Building placement area - captures clicks for placing buildings */}
      {placementMode && (
        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handlePlaceBuilding}
          visible={false}>
          <planeGeometry args={[terrainSize, terrainSize]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Preview building */}
      {placementMode && previewPosition && (
        <Building
          position={previewPosition}
          scale={
            selectedType === 'small'
              ? [3, 5, 3]
              : selectedType === 'large'
              ? [8, 15, 8]
              : [5, 10, 5]
          }
          color={
            selectedType === 'small' ? '#8FBFE0' : selectedType === 'large' ? '#0C2D48' : '#2E8BC0'
          }
          isPreview={true}
        />
      )}

      {/* Placed buildings */}
      {buildings.map(building => (
        <Building
          key={building.id}
          position={building.position}
          scale={building.scale}
          color={building.color}
        />
      ))}

      {/* UI */}
      <BuildingUI />
    </>
  );
}
