'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import styles from './ThreeScene.module.css';
import SimpleCityPlanner from './SimpleCityPlanner';

export default function ThreeScene() {
  return (
    <div className={styles.sceneContainer}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          logarithmicDepthBuffer: true,
        }}>
        <PerspectiveCamera makeDefault position={[0, 10, 50]} fov={75} far={10000} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <SimpleCityPlanner />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={10}
          maxDistance={500}
        />
      </Canvas>
    </div>
  );
}
