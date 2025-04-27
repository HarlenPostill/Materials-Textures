export interface ModelData {
  id: string;
  name: string;
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface TerrainConfig {
  width: number;
  height: number;
  segmentsX: number;
  segmentsZ: number;
  amplitude: number;
  seed: number;
}

export interface SceneConfig {
  terrainConfig: TerrainConfig;
  lightIntensity: number;
  ambientLightIntensity: number;
  fogDensity: number;
  skyTurbidity: number;
}
