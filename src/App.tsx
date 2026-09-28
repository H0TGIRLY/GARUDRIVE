/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { City3DCanvas } from './components/City3DCanvas';
import { RadarMap2D } from './components/RadarMap2D';
import { ControlPanel } from './components/ControlPanel';
import { ScenarioPanelLeft } from './components/ScenarioPanelLeft';
import { HeaderBar } from './components/HeaderBar';
import {
  AppStage,
  CameraView,
  CarState,
  DisplayVisionMode,
  DriveMode,
  ObstacleObject,
  RouteStatus,
  ScenarioDetail,
  ScenarioType,
  SimulatorStats,
  ViewDimension,
  WeatherMode,
} from './types/simulator';

export default function App() {
  // App Stage Orchestrator: splash -> welcome -> onboarding -> simulator
  const [stage, setStage] = useState<AppStage>('splash');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [highlightedGuideKey, setHighlightedGuideKey] = useState<string>('mode');

  // Simulator Interactive States
  // Default cameraView: 'chase' (Ikuti Mobil) as requested
  // Default displayVision: 'normal' (Visual Biasa) as requested
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [driveMode, setDriveMode] = useState<DriveMode>('auto');
  const [weather, setWeather] = useState<WeatherMode>('sunny');
  const [cameraView, setCameraView] = useState<CameraView>('chase');
  const [displayVision, setDisplayVision] = useState<DisplayVisionMode>('normal');
  const [viewDimension, setViewDimension] = useState<ViewDimension>('3d');

  // Scenario States
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('none');
  const [scenarioDetail, setScenarioDetail] = useState<ScenarioDetail | null>(null);

  // Route Status: Stasiun Malang -> Universitas Ma Chung
  const [routeStatus, setRouteStatus] = useState<RouteStatus>({
    origin: 'Stasiun Malang',
    destination: 'Univ Ma Chung',
    progressPercent: 0,
    hasArrived: false,
  });

  // Manual driving controls
  const [manualControls, setManualControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Dynamic Telemetry & Statistics
  const [carState, setCarState] = useState<CarState>({
    x: -30,
    z: -34.2,
    rotation: Math.PI / 2,
    speed: 0,
    targetSpeed: 0,
    isBraking: false,
    steeringAngle: 0,
  });

  const [obstacles, setObstacles] = useState<ObstacleObject[]>([]);
  const [currentDecision, setCurrentDecision] = useState<string>(
    'Mobil parkir di titik start Stasiun Malang. Tekan Mulai Jalan untuk menjelajah rute.'
  );

  const [stats, setStats] = useState<SimulatorStats>({
    distanceTraveledMeters: 0,
    obstaclesDetected: 0,
    hazardsAvoided: 0,
    currentSpeedKmH: 0,
  });

  const detectedIdsRef = React.useRef<Set<string>>(new Set());

  // Telemetry callback from 3D Canvas
  const handleTelemetryUpdate = useCallback(
    (car: CarState, currentObstacles: ObstacleObject[], decision: string) => {
      setCarState(car);
      setObstacles(currentObstacles);
      setCurrentDecision(decision);

      currentObstacles.forEach((obs) => {
        if (!detectedIdsRef.current.has(obs.id)) {
          detectedIdsRef.current.add(obs.id);
          setStats((prev) => ({
            ...prev,
            obstaclesDetected: detectedIdsRef.current.size,
          }));
        }
      });

      setStats((prev) => ({
        ...prev,
        distanceTraveledMeters: prev.distanceTraveledMeters + Math.abs(car.speed) * 0.4,
        currentSpeedKmH: Math.max(0, Math.round(Math.abs(car.speed) * 650)),
      }));
    },
    []
  );

  const [simKey, setSimKey] = useState<number>(0);

  const handleHazardAvoided = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      hazardsAvoided: prev.hazardsAvoided + 1,
    }));
  }, []);

  // Scenario completions strictly happen when the physical action is finished
  const handleScenarioCompleted = useCallback(() => {
    setActiveScenario('none');
    setScenarioDetail(null);
  }, []);

  const handleScenarioDetailUpdate = useCallback((detail: ScenarioDetail | null) => {
    setScenarioDetail(detail);
  }, []);

  const handleRouteProgressUpdate = useCallback((status: RouteStatus) => {
    setRouteStatus(status);
    if (status.hasArrived) {
      setIsDriving(false);
    }
  }, []);

  const handleRestartRoute = () => {
    setRouteStatus({
      origin: 'Stasiun Malang',
      destination: 'Univ Ma Chung',
      progressPercent: 0,
      hasArrived: false,
    });
    setSimKey((prev) => prev + 1);
    setIsDriving(true);
  };

  const handleManualControlChange = (
    key: 'forward' | 'backward' | 'left' | 'right',
    val: boolean
  ) => {
    setManualControls((prev) => ({ ...prev, [key]: val }));
  };

  // Keyboard navigation for manual drive mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (driveMode !== 'manual') return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        setManualControls((prev) => ({ ...prev, forward: true }));
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        setManualControls((prev) => ({ ...prev, backward: true }));
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        setManualControls((prev) => ({ ...prev, left: true }));
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        setManualControls((prev) => ({ ...prev, right: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        setManualControls((prev) => ({ ...prev, forward: false }));
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        setManualControls((prev) => ({ ...prev, backward: false }));
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        setManualControls((prev) => ({ ...prev, left: false }));
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        setManualControls((prev) => ({ ...prev, right: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [driveMode]);

  const handleResetCamera = () => {
    setCameraView('chase');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5F7FA] font-sans">
      {/* ==================================================== */}
      {/* TAHAP 1: SPLASH SCREEN */}
      {/* ==================================================== */}
      {stage === 'splash' && (
        <SplashScreen onFinish={() => setStage('welcome')} />
      )}

      {/* ==================================================== */}
      {/* TAHAP 2: LAYAR SELAMAT DATANG */}
      {/* ==================================================== */}
      {stage === 'welcome' && (
        <WelcomeScreen
          onStart={() => {
            setStage('onboarding');
            setShowGuideModal(true);
          }}
        />
      )}

      {/* ==================================================== */}
      {/* TAHAP 3: PANDUAN INTERAKTIF (ONBOARDING SPOTLIGHT) */}
      {/* ==================================================== */}
      {(stage === 'onboarding' || showGuideModal) && (
        <OnboardingModal
          onComplete={() => {
            setStage('simulator');
            setShowGuideModal(false);
          }}
          onStepChange={(stepKey) => setHighlightedGuideKey(stepKey)}
        />
      )}

      {/* ==================================================== */}
      {/* TAHAP 4: SIMULATOR UTAMA */}
      {/* ==================================================== */}
      {(stage === 'onboarding' || stage === 'simulator') && (
        <main className="relative w-full h-full">
          {/* Top Bar Navigation */}
          <HeaderBar
            onOpenGuide={() => setShowGuideModal(true)}
            currentSpeedKmH={stats.currentSpeedKmH}
            viewDimension={viewDimension}
            onToggleDimension={() =>
              setViewDimension(viewDimension === '3d' ? '2d' : '3d')
            }
            driveMode={driveMode}
          />

          {/* Kotak Uji Skenario Khusus di Sebelah Kiri */}
          <ScenarioPanelLeft
            activeScenario={activeScenario}
            scenarioDetail={scenarioDetail}
            onTriggerScenario={(type) => {
              setActiveScenario(type);
              if (!isDriving && type !== 'none') {
                setIsDriving(true);
              }
            }}
            isDriving={isDriving}
            onStartDrive={() => setIsDriving(true)}
          />

          {/* 3D City Visualization Canvas */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              viewDimension === '3d' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <City3DCanvas
              key={simKey}
              weather={weather}
              cameraView={cameraView}
              displayVision={displayVision}
              driveMode={driveMode}
              isDriving={isDriving}
              activeScenario={activeScenario}
              manualControls={manualControls}
              onTelemetryUpdate={handleTelemetryUpdate}
              onHazardAvoided={handleHazardAvoided}
              onResetCameraView={handleResetCamera}
              is2DActive={viewDimension === '2d'}
              onScenarioDetailUpdate={handleScenarioDetailUpdate}
              onScenarioCompleted={handleScenarioCompleted}
              onRouteProgressUpdate={handleRouteProgressUpdate}
            />
          </div>

          {/* 2D Vector Radar Map Canvas */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              viewDimension === '2d' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <RadarMap2D
              carState={carState}
              obstacles={obstacles}
              displayVision={displayVision}
              weather={weather}
              isVisible={viewDimension === '2d'}
            />
          </div>

          {/* Real-time Game Control Panel on the Right */}
          <ControlPanel
            isDriving={isDriving}
            onToggleDrive={() => setIsDriving((prev) => !prev)}
            driveMode={driveMode}
            onDriveModeChange={(m) => setDriveMode(m)}
            weather={weather}
            onWeatherChange={(w) => setWeather(w)}
            cameraView={cameraView}
            onCameraViewChange={(v) => setCameraView(v)}
            onResetCamera={handleResetCamera}
            displayVision={displayVision}
            onDisplayVisionChange={(dv) => setDisplayVision(dv)}
            viewDimension={viewDimension}
            onViewDimensionChange={(dim) => setViewDimension(dim)}
            routeStatus={routeStatus}
            onRestartRoute={handleRestartRoute}
            stats={stats}
            currentDecision={currentDecision}
            manualControls={manualControls}
            onManualControlChange={handleManualControlChange}
            highlightedSection={showGuideModal ? highlightedGuideKey : undefined}
          />
        </main>
      )}
    </div>
  );
}
