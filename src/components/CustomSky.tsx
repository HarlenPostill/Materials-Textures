'use client';
import React from 'react';
import { Sky } from '@react-three/drei';

interface DesertSkyProps {
  sunPosition?: [number, number, number];
}

export default function CustomSky({ sunPosition = [1, 0.25, 0.25] }: DesertSkyProps) {
  return (
    <Sky
      distance={450000}
      sunPosition={sunPosition}
      inclination={0.6}
      azimuth={0.25}
      mieCoefficient={0.001}
      mieDirectionalG={0.8}
      rayleigh={0.5}
      turbidity={10}
    />
  );
}
