// CityPlanner.js - Main application component
'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Sky, Stats } from '@react-three/drei';
import * as THREE from 'three';

// Import custom components
import { TerrainGenerator } from './TerrainGenerator';
import { RoadPainter } from './RoadPainter';
import { BuildingPlacer, CollisionManager } from './BuildingPlacer';
import { TextureManager, TerrainUtils, PerformanceOptimizer } from './utilities';

// Preload models - For a real application, you'd have actual model paths

// Mock models for demonstration (replace with your actual models)
const mockModels = {
  skyscraper: {
    url: '/models/skyscraper.glb',
    scale: [0.5, 0.5, 0.5],
    properties: { height: 100, footprint: 20 },
  },
  house: {
    url: '/models/house.glb',
    scale: [0.3, 0.3, 0.3],
    properties: { height: 10, footprint: 15 },
  },
  shop: {
    url: '/models/shop.glb',
    scale: [0.4, 0.4, 0.4],
    properties: { height: 8, footprint: 12 },
  },
  factory: {
    url: '/models/factory.glb',
    scale: [0.6, 0.6, 0.6],
    properties: { height: 15, footprint: 25 },
  },
};

// Main CityPlanner component
export default function CityPlanner() {
  // State for application
  const [heightMap, setHeightMap] = useState(null);
  const [roads, setRoads] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [quality, setQuality] = useState('high');
  const [timeOfDay, setTimeOfDay] = useState(12);
  const [weather, setWeather] = useState('clear');
  const [selectedTool, setSelectedTool] = useState('terrain');
  const [terrainParams, setTerrainParams] = useState({
    size: 500,
    height: 30,
    resolution: 128,
    roughness: 0.8,
    persistence: 0.5,
    octaves: 6,
  });

  // Refs
  const textureManager = useRef(new TextureManager());
  const performanceOptimizer = useRef(new PerformanceOptimizer());
  const terrainUtils = useRef(null);

  // Handle terrain generation
  const handleTerrainGenerated = heightMapData => {
    setHeightMap(heightMapData);
    terrainUtils.current = new TerrainUtils(
      terrainParams.size,
      terrainParams.resolution,
      heightMapData
    );
  };

  // Handle road update
  const handleRoadUpdate = roadsData => {
    setRoads(roadsData);
  };

  // Handle building update
  const handleBuildingUpdate = buildingsData => {
    setBuildings(buildingsData);
  };

  // Tool component - displays UI controls for the current tool
  const ToolControls = () => {
    // Different controls for different tools
    switch (selectedTool) {
      case 'terrain':
        return (
          <div className="tool-panel">
            <h3>Terrain Tool</h3>

            <div className="control-group">
              <label>Height: {terrainParams.height}m</label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={terrainParams.height}
                onChange={e =>
                  setTerrainParams({
                    ...terrainParams,
                    height: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="control-group">
              <label>Roughness: {terrainParams.roughness.toFixed(1)}</label>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={terrainParams.roughness}
                onChange={e =>
                  setTerrainParams({
                    ...terrainParams,
                    roughness: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="control-group">
              <label>Detail (Octaves): {terrainParams.octaves}</label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={terrainParams.octaves}
                onChange={e =>
                  setTerrainParams({
                    ...terrainParams,
                    octaves: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <button
              className="generate-button"
              onClick={() => {
                // Regenerate terrain with current params
                setHeightMap(null);
              }}>
              Regenerate Terrain
            </button>
          </div>
        );

      case 'road':
        return (
          <div className="tool-panel">
            <h3>Road Tool</h3>
            <p>Click and drag to paint roads on the terrain.</p>

            <div className="control-group">
              <label>Brush Size: {roads.brushSize || 10}m</label>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={roads.brushSize || 10}
                onChange={e =>
                  setRoads({
                    ...roads,
                    brushSize: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <button
              className="clear-button"
              onClick={() => {
                // Clear all roads
                setRoads([]);
              }}>
              Clear All Roads
            </button>
          </div>
        );

      case 'building':
        return (
          <div className="tool-panel">
            <h3>Building Tool</h3>
            <p>Click on the terrain to place buildings.</p>

            <div className="control-group">
              <label>Building Type:</label>
              <select
                value={buildings.currentType || 'skyscraper'}
                onChange={e =>
                  setBuildings({
                    ...buildings,
                    currentType: e.target.value,
                  })
                }>
                <option value="skyscraper">Skyscraper</option>
                <option value="house">House</option>
                <option value="shop">Shop</option>
                <option value="factory">Factory</option>
              </select>
            </div>

            <div className="control-group">
              <label>Auto-align to Terrain:</label>
              <input
                type="checkbox"
                checked={buildings.alignToTerrain !== false}
                onChange={e =>
                  setBuildings({
                    ...buildings,
                    alignToTerrain: e.target.checked,
                  })
                }
              />
            </div>

            <button
              className="clear-button"
              onClick={() => {
                // Clear all buildings
                setBuildings([]);
              }}>
              Clear All Buildings
            </button>
          </div>
        );

      case 'environment':
        return (
          <div className="tool-panel">
            <h3>Environment</h3>

            <div className="control-group">
              <label>Time of Day: {timeOfDay}:00</label>
              <input
                type="range"
                min="6"
                max="20"
                step="0.5"
                value={timeOfDay}
                onChange={e => setTimeOfDay(parseFloat(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label>Weather:</label>
              <select value={weather} onChange={e => setWeather(e.target.value)}>
                <option value="clear">Clear</option>
                <option value="cloudy">Cloudy</option>
                <option value="rainy">Rainy</option>
                <option value="foggy">Foggy</option>
              </select>
            </div>

            <div className="control-group">
              <label>Quality:</label>
              <select
                value={quality}
                onChange={e => {
                  setQuality(e.target.value);
                  performanceOptimizer.current.setQuality(e.target.value);
                }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Main UI Component
  const UserInterface = () => {
    return (
      <Html fullscreen>
        <div className="ui-container">
          {/* Top toolbar */}
          <div className="toolbar">
            <button
              className={selectedTool === 'terrain' ? 'active' : ''}
              onClick={() => setSelectedTool('terrain')}>
              Terrain
            </button>
            <button
              className={selectedTool === 'road' ? 'active' : ''}
              onClick={() => setSelectedTool('road')}>
              Roads
            </button>
            <button
              className={selectedTool === 'building' ? 'active' : ''}
              onClick={() => setSelectedTool('building')}>
              Buildings
            </button>
            <button
              className={selectedTool === 'environment' ? 'active' : ''}
              onClick={() => setSelectedTool('environment')}>
              Environment
            </button>
          </div>

          {/* Side panel with tool controls */}
          <div className="side-panel">
            <ToolControls />

            {/* Statistics */}
            <div className="stats-panel">
              <h3>Statistics</h3>
              <ul>
                <li>
                  Terrain Size: {terrainParams.size}m x {terrainParams.size}m
                </li>
                <li>Roads: {roads.length} segments</li>
                <li>Buildings: {buildings.length} structures</li>
              </ul>
            </div>
          </div>

          {/* Help button */}
          <button className="help-button" onClick={() => alert('City Planner Help')}>
            ?
          </button>
        </div>

        {/* Add CSS styles */}
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

          .toolbar button.active {
            background: #4caf50;
          }

          .side-panel {
            position: absolute;
            top: 80px;
            right: 20px;
            width: 300px;
            background: rgba(0, 0, 0, 0.7);
            padding: 15px;
            border-radius: 5px;
            pointer-events: auto;
          }

          .tool-panel {
            margin-bottom: 20px;
          }

          h3 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
          }

          .control-group {
            margin-bottom: 15px;
          }

          label {
            display: block;
            margin-bottom: 5px;
          }

          input[type='range'] {
            width: 100%;
          }

          select {
            background: #333;
            color: white;
            border: none;
            padding: 5px;
            width: 100%;
          }

          button {
            background: #2196f3;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
          }

          .clear-button {
            background: #f44336;
          }

          .generate-button {
            background: #4caf50;
          }

          .stats-panel {
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding-top: 15px;
          }

          .stats-panel ul {
            padding-left: 20px;
            margin: 5px 0;
          }

          .help-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.7);
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
          }
        `}</style>
      </Html>
    );
  };

  // Scene component - contains all 3D elements
  const Scene = () => {
    const { camera, scene, gl } = useThree();

    // Set up scene on mount
    useEffect(() => {
      // Set initial camera position
      camera.position.set(0, 50, 100);
      camera.lookAt(0, 0, 0);

      // Set renderer parameters for better quality
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      gl.outputEncoding = THREE.sRGBEncoding;
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.0;

      // Preload models
      // In a real app, you would use actual model paths and loading
      console.log('Preloading models...');
    }, [camera, scene, gl]);

    // Set up renderer parameters based on quality
    useEffect(() => {
      switch (quality) {
        case 'low':
          gl.shadowMap.enabled = false;
          break;
        case 'medium':
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
          break;
        case 'high':
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          break;
      }
    }, [gl, quality]);

    // Calculate sun position based on time of day
    const sunPosition = useMemo(() => {
      // Convert time to angle (0-24 hours -> 0-2π)
      const angle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;

      // Calculate x, y, z position on a circle
      const radius = 100;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.8 + 10; // Adjust for better sun arc
      const z = 0;

      return [x, Math.max(0.1, y), z]; // Ensure minimum height
    }, [timeOfDay]);

    // Calculate light intensity based on time of day
    const lightIntensity = useMemo(() => {
      const normalizedHeight = Math.max(0, Math.min(1, sunPosition[1] / 100));
      return normalizedHeight * 1.5;
    }, [sunPosition]);

    // Calculate ambient light intensity (higher at night)
    const ambientIntensity = useMemo(() => {
      return 0.2 + (1 - lightIntensity) * 0.3;
    }, [lightIntensity]);

    return (
      <>
        <Stats />

        {/* Lighting */}
        <ambientLight intensity={ambientIntensity} />
        <directionalLight
          position={sunPosition}
          intensity={lightIntensity}
          castShadow={quality !== 'low'}
          shadow-mapSize={performanceOptimizer.current.getShadowMapSize()}
          shadow-bias={-0.0001}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-camera-far={500}
        />

        {/* Sky and environment */}
        <Sky
          sunPosition={sunPosition}
          turbidity={weather === 'clear' ? 10 : 20}
          rayleigh={weather === 'foggy' ? 4 : 1}
        />
        <fog
          attach="fog"
          args={['#e1c4a4', weather === 'foggy' ? 50 : 200, weather === 'foggy' ? 500 : 2000]}
        />

        {/* Terrain */}
        <TerrainGenerator
          resolution={terrainParams.resolution}
          size={terrainParams.size}
          height={terrainParams.height}
          roughness={terrainParams.roughness}
          persistence={terrainParams.persistence}
          octaves={terrainParams.octaves}
          onTerrainGenerated={handleTerrainGenerated}
        />

        {/* Roads */}
        {heightMap && selectedTool === 'road' && (
          <RoadPainter
            heightMap={heightMap}
            terrainSize={terrainParams.size}
            terrainResolution={terrainParams.resolution}
            onRoadUpdate={handleRoadUpdate}
            brushSize={roads.brushSize || 10}
          />
        )}

        {/* Buildings */}
        {heightMap && (
          <BuildingPlacer
            heightMap={heightMap}
            terrainSize={terrainParams.size}
            terrainResolution={terrainParams.resolution}
            roads={roads}
            onBuildingUpdate={handleBuildingUpdate}
            buildingTypes={Object.keys(mockModels)}
            buildingData={mockModels}
            active={selectedTool === 'building'}
            alignToTerrain={buildings.alignToTerrain !== false}
            currentType={buildings.currentType || 'skyscraper'}
          />
        )}

        {/* Collision management */}
        <CollisionManager
          buildings={buildings}
          heightMap={heightMap}
          terrainSize={terrainParams.size}
        />

        {/* User Interface */}
        <UserInterface />

        {/* Camera Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={10}
          maxDistance={500}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      </>
    );
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Dispose textures and other resources
      if (textureManager.current) {
        textureManager.current.disposeTextures();
      }
    };
  }, []);

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        logarithmicDepthBuffer: true,
        powerPreference: quality === 'high' ? 'high-performance' : 'default',
      }}
      style={{ width: '100%', height: '100vh' }}
      camera={{ position: [0, 50, 100], fov: 75, far: 10000 }}>
      <Scene />
    </Canvas>
  );
}
