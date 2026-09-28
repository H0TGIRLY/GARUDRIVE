export type AppStage = 'splash' | 'welcome' | 'onboarding' | 'simulator';

export type DriveMode = 'auto' | 'manual';

export type WeatherMode = 'sunny' | 'rain' | 'night';

export type CameraView = 'orbit' | 'top' | 'driver' | 'chase';

export type DisplayVisionMode = 'normal' | 'technical';

export type ViewDimension = '3d' | '2d';

export type ScenarioType = 'none' | 'pedestrian' | 'car_brake' | 'red_light';

export interface ScenarioDetail {
  type: ScenarioType;
  title: string;
  step: 'detection' | 'action' | 'clearance' | 'done';
  stepText: string;
  explanation: string;
  distanceInfo: string;
}

export interface RouteStatus {
  origin: string;
  destination: string;
  progressPercent: number;
  hasArrived: boolean;
}

export interface ObstacleObject {
  id: string;
  type: 'pedestrian' | 'vehicle' | 'traffic_light';
  name: string;
  x: number;
  z: number;
  distance: number;
  status: 'safe' | 'warning' | 'danger';
  active: boolean;
}

export interface SimulatorStats {
  distanceTraveledMeters: number;
  obstaclesDetected: number;
  hazardsAvoided: number;
  currentSpeedKmH: number;
}

export interface CarState {
  x: number;
  z: number;
  rotation: number; // in radians
  speed: number;    // normalized speed
  targetSpeed: number;
  isBraking: boolean;
  steeringAngle: number;
}
