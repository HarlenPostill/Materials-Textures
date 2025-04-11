'use client';
import { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControlsProps {
  speed?: number;
}

export default function CameraControls({ speed = 200.0 }: CameraControlsProps) {
  const { camera } = useThree();
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  useEffect(() => {
    camera.position.set(0, 1, 0);
    // Capture the current clock reference
    const clock = clockRef.current;
    // Reset the clock when the component mounts
    clock.start();

    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [event.key]: true }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [event.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clock.stop();
    };
  }, [camera]);

  useFrame(() => {
    // Get delta time (time since last frame in seconds)
    const delta = clockRef.current.getDelta();
    // Calculate movement based on delta time and speed
    const movementDistance = speed * delta;

    // Forward/backward movement
    if (keysPressed['ArrowUp']) {
      camera.position.z -= movementDistance;
    }
    if (keysPressed['ArrowDown']) {
      camera.position.z += movementDistance;
    }

    // Left/right movement
    if (keysPressed['ArrowLeft']) {
      camera.position.x -= movementDistance;
    }
    if (keysPressed['ArrowRight']) {
      camera.position.x += movementDistance;
    }
  });

  return null;
}
