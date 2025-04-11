'use client';
import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { SimpleTerrain } from './SimpleTerrain';
import { BuildingPlacer } from './BuildingPlacer';

export default function SimpleCityPlanner() {
  const [terrainData, setTerrainData] = useState<{
    heightMap: number[][];
    size: number;
  } | null>(null);

  const [activeTool, setActiveTool] = useState<'terrain' | 'buildings'>('terrain');

  // Handle terrain generation - only called once when terrain is created
  const handleTerrainGenerated = (heightMap: number[][], size: number) => {
    console.log('Terrain data received in parent component');
    setTerrainData({ heightMap, size });
  };

  // Simple UI
  const UI = () => {
    return (
      <Html fullscreen>
        <div className="ui-container">
          <div className="toolbar">
            <button
              className={activeTool === 'terrain' ? 'active' : ''}
              onClick={() => setActiveTool('terrain')}>
              Terrain
            </button>
            <button
              className={activeTool === 'buildings' ? 'active' : ''}
              onClick={() => setActiveTool('buildings')}
              disabled={!terrainData}>
              Buildings
            </button>
          </div>

          <style jsx>{`
            .ui-container {
              font-family: Arial, sans-serif;
              color: white;
              position: relative;
              width: 100%;
              height: 100%;
              pointer-events: none;
            }

            .toolbar {
              position: absolute;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.7);
              padding: 10px;
              border-radius: 5px;
              display: flex;
              gap: 10px;
              pointer-events: auto;
            }

            .toolbar button {
              background: #333;
              color: white;
              border: none;
              padding: 8px 15px;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.3s;
            }

            .toolbar button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            .toolbar button.active {
              background: #4caf50;
            }
          `}</style>
        </div>
      </Html>
    );
  };

  return (
    <>
      {/* Basic terrain */}
      <SimpleTerrain onTerrainGenerated={handleTerrainGenerated} />

      {/* Building placement */}
      {terrainData && activeTool === 'buildings' && (
        <BuildingPlacer heightMap={terrainData.heightMap} terrainSize={terrainData.size} />
      )}

      {/* UI */}
      <UI />
    </>
  );
}
