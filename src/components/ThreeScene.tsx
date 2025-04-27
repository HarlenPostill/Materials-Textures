'use client';
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, PerformanceMonitor, Sky } from '@react-three/drei';
import * as THREE from 'three';
import styles from './ThreeScene.module.css';
import Terrain from './Terrain';
import ModelManager from './ModelManager';
import SceneControls from './SceneControls';
import { ModelData, SceneConfig } from '@/types/models';

export default function ThreeScene() {
  const [dpr, setDpr] = useState(1.5);
  const terrainRef = useRef<THREE.Mesh | null>(null);

  // Scene configuration
  const [sceneConfig, setSceneConfig] = useState<SceneConfig>({
    terrainConfig: {
      width: 500,
      height: 500,
      segmentsX: 100,
      segmentsZ: 100,
      amplitude: 15,
      seed: 42,
    },
    lightIntensity: 1.2,
    ambientLightIntensity: 0.4,
    fogDensity: 0.002,
    skyTurbidity: 10,
  });

  // Models
  const [models, setModels] = useState<ModelData[]>([]);

  // Handle terrain generation
  const handleTerrainGenerated = (terrain: THREE.Mesh) => {
    terrainRef.current = terrain;
  };

  // Handle model position updates
  const handleUpdateModel = (id: string, position: THREE.Vector3) => {
    setModels(prevModels =>
      prevModels.map(model =>
        model.id === id
          ? {
              ...model,
              position: [position.x, position.y, position.z],
            }
          : model
      )
    );
  };

  // Handle scene config updates
  const handleUpdateConfig = (newConfig: SceneConfig) => {
    setSceneConfig(newConfig);
  };

  // Add a new model
  const handleAddModel = (model: ModelData) => {
    setModels(prevModels => [...prevModels, model]);
  };

  // Clear all models
  const handleClearModels = () => {
    setModels([]);
  };

  return (
    <div className={styles.sceneContainer} id="scene-container">
      {/* Scene Controls UI */}
      <SceneControls
        sceneConfig={sceneConfig}
        onUpdateConfig={handleUpdateConfig}
        onAddModel={handleAddModel}
        onClearModels={handleClearModels}
      />

      {/* 3D Scene */}
      <Canvas
        shadows
        dpr={dpr}
        gl={{
          antialias: true,
          logarithmicDepthBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}>
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />

        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 50, 200]} fov={60} near={0.1} far={10000} />

        {/* Lights */}
        <ambientLight intensity={sceneConfig.ambientLightIntensity} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={sceneConfig.lightIntensity}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-camera-far={500}
        />

        {/* Environment */}
        <Sky
          distance={450000}
          sunPosition={[50, 80, 50]}
          inclination={0.6}
          azimuth={0.25}
          turbidity={sceneConfig.skyTurbidity}
          rayleigh={0.5}
        />
        <fog attach="fog" args={['#e1c4a4', 150, 1000]} />

        {/* Terrain */}
        <Terrain config={sceneConfig.terrainConfig} onTerrainGenerated={handleTerrainGenerated} />

        {/* Models */}
        <ModelManager
          models={models}
          terrain={terrainRef.current}
          onUpdateModel={handleUpdateModel}
        />

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={10}
          maxDistance={500}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      </Canvas>
    </div>
  );
}
