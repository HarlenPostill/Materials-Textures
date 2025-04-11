'use client';
import React from 'react';

interface FloorProps {
  size?: number;
  divisions?: number;
  color?: string;
}

export default function Floor({ size = 20, divisions = 20, color = 'red' }: FloorProps) {
  return (
    <gridHelper args={[size, divisions, color, color]} position={[0, 0, 0]} rotation={[0, 0, 0]} />
  );
}
