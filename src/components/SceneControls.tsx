'use client';
import React, { useState } from 'react';
import { SceneConfig, ModelData, TerrainConfig } from '@/types/models';

interface SceneControlsProps {
  sceneConfig: SceneConfig;
  onUpdateConfig: (config: SceneConfig) => void;
  onAddModel: (model: ModelData) => void;
  onClearModels: () => void;
}

export default function SceneControls({
  sceneConfig,
  onUpdateConfig,
  onAddModel,
  onClearModels,
}: SceneControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const [modelType, setModelType] = useState('tree');

  // Create a deep copy of configs to avoid direct mutation
  const [terrainConfig, setTerrainConfig] = useState<TerrainConfig>({
    ...sceneConfig.terrainConfig,
  });

  // Update a single terrain config field
  const handleTerrainChange = (field: keyof TerrainConfig, value: number) => {
    const newConfig = { ...terrainConfig, [field]: value };
    setTerrainConfig(newConfig);
  };

  // Apply terrain changes
  const applyTerrainChanges = () => {
    onUpdateConfig({
      ...sceneConfig,
      terrainConfig,
    });
  };

  // Update a single scene config field
  const handleSceneChange = (field: keyof Omit<SceneConfig, 'terrainConfig'>, value: number) => {
    onUpdateConfig({
      ...sceneConfig,
      [field]: value,
    });
  };

  // Add a model to the scene
  const handleAddModel = () => {
    // Get placement location
    const getRandomPosition = (): [number, number, number] => {
      const size = terrainConfig.width / 2 - 2; // Keep within bounds
      return [
        Math.random() * size * 2 - size,
        0, // Y will be set based on terrain
        Math.random() * size * 2 - size,
      ];
    };

    // Model templates
    const modelTemplates: Record<string, Omit<ModelData, 'id' | 'position'>> = {
      tree: {
        name: 'Tree',
        path: '/models/tree.glb',
        scale: 0.5,
        rotation: [0, Math.random() * Math.PI * 2, 0],
      },
      rock: {
        name: 'Rock',
        path: '/models/rock.glb',
        scale: 0.8,
        rotation: [0, Math.random() * Math.PI * 2, 0],
      },
      house: {
        name: 'House',
        path: '/models/house.glb',
        scale: 1.2,
        rotation: [0, Math.random() * Math.PI * 2, 0],
      },
    };

    // Get selected template
    const template = modelTemplates[modelType] || modelTemplates.tree;

    // Create new model with random position and unique ID
    const newModel: ModelData = {
      ...template,
      id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: getRandomPosition(),
    };

    onAddModel(newModel);
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const controlsStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '300px',
    padding: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    borderRadius: '8px',
    fontFamily: 'sans-serif',
    zIndex: 1000,
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    margin: '5px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4a4a4a',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '8px 15px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    cursor: 'pointer',
    zIndex: 1001,
  };

  return (
    <>
      {/* Toggle button - always visible */}
      <button style={toggleButtonStyle} onClick={toggleControls}>
        {showControls ? 'Hide Controls' : 'Show Controls'}
      </button>

      {/* Controls panel */}
      {showControls && (
        <div style={controlsStyle}>
          <h3 style={{ marginTop: 0 }}>Terrain Controls</h3>
          <div>
            <label>Width:</label>
            <input
              type="range"
              min="100"
              max="1000"
              value={terrainConfig.width}
              onChange={e => handleTerrainChange('width', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{terrainConfig.width}</span>
          </div>

          <div>
            <label>Height:</label>
            <input
              type="range"
              min="100"
              max="1000"
              value={terrainConfig.height}
              onChange={e => handleTerrainChange('height', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{terrainConfig.height}</span>
          </div>

          <div>
            <label>Amplitude:</label>
            <input
              type="range"
              min="1"
              max="500"
              value={terrainConfig.amplitude}
              onChange={e => handleTerrainChange('amplitude', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{terrainConfig.amplitude}</span>
          </div>

          <div>
            <label>Detail:</label>
            <input
              type="range"
              min="20"
              max="200"
              value={terrainConfig.segmentsX}
              onChange={e => {
                const value = Number(e.target.value);
                handleTerrainChange('segmentsX', value);
                handleTerrainChange('segmentsZ', value);
              }}
              style={{ width: '100%' }}
            />
            <span>{terrainConfig.segmentsX}</span>
          </div>

          <div>
            <label>Seed:</label>
            <input
              type="range"
              min="1"
              max="100"
              value={terrainConfig.seed}
              onChange={e => handleTerrainChange('seed', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{terrainConfig.seed}</span>
          </div>

          <button style={buttonStyle} onClick={applyTerrainChanges}>
            Apply Terrain Changes
          </button>

          <h3>Light Controls</h3>
          <div>
            <label>Light Intensity:</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={sceneConfig.lightIntensity}
              onChange={e => handleSceneChange('lightIntensity', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{sceneConfig.lightIntensity}</span>
          </div>

          <div>
            <label>Ambient Light:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sceneConfig.ambientLightIntensity}
              onChange={e => handleSceneChange('ambientLightIntensity', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{sceneConfig.ambientLightIntensity}</span>
          </div>

          <div>
            <label>Fog Density:</label>
            <input
              type="range"
              min="0"
              max="0.01"
              step="0.0001"
              value={sceneConfig.fogDensity}
              onChange={e => handleSceneChange('fogDensity', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{sceneConfig.fogDensity.toFixed(4)}</span>
          </div>

          <div>
            <label>Sky Turbidity:</label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={sceneConfig.skyTurbidity}
              onChange={e => handleSceneChange('skyTurbidity', Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <span>{sceneConfig.skyTurbidity}</span>
          </div>

          <h3>Models</h3>
          <div>
            <label>Model Type:</label>
            <select
              value={modelType}
              onChange={e => setModelType(e.target.value)}
              style={{ width: '100%', padding: '5px', marginBottom: '10px' }}>
              <option value="tree">Tree</option>
              <option value="rock">Rock</option>
              <option value="house">House</option>
            </select>
          </div>

          <button style={buttonStyle} onClick={handleAddModel}>
            Add Model
          </button>

          <button style={{ ...buttonStyle, backgroundColor: '#aa3333' }} onClick={onClearModels}>
            Clear All Models
          </button>
        </div>
      )}
    </>
  );
}
