'use client';
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, PerformanceMonitor } from '@react-three/drei';
import styles from './ThreeScene.module.css';
import CustomSky from './CustomSky';
import Floor from './Floor';

export default function ThreeScene() {
  const [dpr, setDpr] = useState(1.5);

  return (
    <div className={styles.sceneContainer}>
      <Canvas
        shadows
        dpr={dpr}
        gl={{
          antialias: true,
          logarithmicDepthBuffer: true,
        }}>
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        <PerspectiveCamera makeDefault position={[0, 10, 50]} fov={75} far={10000} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-camera-far={500}
        />

        {/* Scene Elements */}
        <CustomSky sunPosition={[50, 80, 50]} />
        <fog attach="fog" args={['#e1c4a4', 200, 2000]} />
        <Floor />

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
