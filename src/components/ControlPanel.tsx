import React, { useState } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Compass,
  Cpu,
  Eye,
  Layers,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Flag,
} from 'lucide-react';
import {
  CameraView,
  DisplayVisionMode,
  DriveMode,
  RouteStatus,
  SimulatorStats,
  ViewDimension,
  WeatherMode,
} from '../types/simulator';

interface ControlPanelProps {
  driveMode: DriveMode;
  onDriveModeChange: (mode: DriveMode) => void;
  weather: WeatherMode;
  onWeatherChange: (w: WeatherMode) => void;
  cameraView: CameraView;
  onCameraViewChange: (pov: CameraView) => void;
  onResetCamera: () => void;
  displayVision: DisplayVisionMode;
  onDisplayVisionChange: (v: DisplayVisionMode) => void;
  viewDimension: ViewDimension;
  onViewDimensionChange: (dim: ViewDimension) => void;
  isDriving: boolean;
  onToggleDrive: () => void;
  routeStatus: RouteStatus;
  onRestartRoute: () => void;
  stats: SimulatorStats;
  currentDecision: string;
  manualControls: { forward: boolean; backward: boolean; left: boolean; right: boolean };
  onManualControlChange: (key: 'forward' | 'backward' | 'left' | 'right', val: boolean) => void;
  highlightedSection?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  driveMode,
  onDriveModeChange,
  weather,
  onWeatherChange,
  cameraView,
  onCameraViewChange,
  onResetCamera,
  displayVision,
  onDisplayVisionChange,
  viewDimension,
  onViewDimensionChange,
  isDriving,
  onToggleDrive,
  routeStatus,
  onRestartRoute,
  stats,
  currentDecision,
  manualControls,
  onManualControlChange,
  highlightedSection,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Weather Cycle with explicit 'Ganti'
  const nextWeather = () => {
    if (weather === 'sunny') onWeatherChange('rain');
    else if (weather === 'rain') onWeatherChange('night');
    else onWeatherChange('sunny');
  };

  const weatherLabel =
    weather === 'sunny' ? 'Cerah (Siang)' : weather === 'rain' ? 'Hujan Rintik' : 'Malam Hari';

  // Camera POV Cycle with explicit 'Ganti'
  const nextCamera = () => {
    if (cameraView === 'chase') onCameraViewChange('orbit');
    else if (cameraView === 'orbit') onCameraViewChange('top');
    else if (cameraView === 'top') onCameraViewChange('driver');
    else onCameraViewChange('chase');
  };

  const cameraLabel =
    cameraView === 'chase'
      ? 'Ikuti Mobil'
      : cameraView === 'orbit'
      ? 'Bebas Putar'
      : cameraView === 'top'
      ? 'Dari Atas'
      : 'Mata Sopir';

  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside
      className="fixed z-30 bottom-2 right-2 md:bottom-4 md:right-4 left-2 sm:left-auto sm:w-[325px] pointer-events-auto transition-all duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col text-[#1A1F2B]">
        {/* Sleek Top Header with Minimizer / Visibility Toggle */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/90 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
            <span className="font-heading font-bold text-xs text-slate-800">
              Panel Kontrol Simulator
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-heading font-bold text-[#1E88E5] px-1.5 py-0.5 rounded bg-blue-50">
              {stats.currentSpeedKmH} km/h
            </span>
            <button
              className="text-slate-400 hover:text-slate-700 p-0.5"
              title={isMinimized ? 'Perbesar panel kontrol' : 'Sembunyikan / Perkecil agar pandangan jalan luas'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Minimized Quick Bar */}
        {isMinimized && (
          <div className="px-3 py-2 flex items-center justify-between bg-white text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDrive();
              }}
              className={`px-3 py-1.5 rounded-xl font-heading font-bold text-xs flex items-center gap-1.5 text-white ${
                isDriving ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isDriving ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isDriving ? 'Parkir' : 'Mulai'}</span>
            </button>

            <span className="text-[11px] text-slate-500 font-medium">
              {routeStatus.progressPercent}% rute
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextCamera();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5 text-[#1E88E5]" />
              <span>Ganti POV</span>
            </button>
          </div>
        )}

        {/* Full Compact Content (Fits directly without scrolling) */}
        {!isMinimized && (
          <div className="p-2.5 sm:p-3 space-y-2 text-[#1A1F2B]">
            {/* 1. RUTE PERJALANAN & START/STOP */}
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-50/80 to-emerald-50/80 border border-blue-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 font-bold font-heading text-slate-800 text-[11px]">
                  <MapPin className="w-3 h-3 text-[#1E88E5]" />
                  <span>{routeStatus.origin}</span>
                  <span className="text-slate-400">→</span>
                  <Flag className="w-3 h-3 text-[#00C896]" />
                  <span>{routeStatus.destination}</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 tabular-nums">
                  {routeStatus.progressPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#1E88E5] to-[#00C896] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(2, routeStatus.progressPercent))}%` }}
                />
              </div>

              {routeStatus.hasArrived && (
                <div className="flex items-center justify-between text-[10px] bg-emerald-100 text-emerald-900 p-1 rounded-lg font-medium">
                  <span>🎉 Tiba di Univ Ma Chung!</span>
                  <button
                    onClick={onRestartRoute}
                    className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                  >
                    Ulangi
                  </button>
                </div>
              )}

              {/* Tombol Utama Start / Stop */}
              <button
                onClick={onToggleDrive}
                className={`w-full py-1.5 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                  isDriving
                    ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98]'
                    : 'gradient-garudrive text-white hover:brightness-105 active:scale-[0.98]'
                }`}
              >
                {isDriving ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Hentikan Mobil (Parkir)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mulai Jalan (Jelajah Rute)</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. MODE KEMUDI (AI vs MANUAL) */}
            <div
              className={`p-1.5 rounded-xl bg-slate-50 border ${
                highlightedSection === 'mode' ? 'ring-2 ring-[#00C896]' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Mode Kemudi
                </span>
                <span className="text-[9px] font-semibold text-[#1E88E5]">
                  Ganti Mode
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onDriveModeChange('auto')}
                  className={`py-1 px-2 rounded-lg font-heading font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    driveMode === 'auto'
                      ? 'gradient-garudrive text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Otomatis AI</span>
                </button>

                <button
                  onClick={() => onDriveModeChange('manual')}
                  className={`py-1 px-2 rounded-lg font-heading font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    driveMode === 'manual'
                      ? 'gradient-garudrive text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>Manual (Sopir)</span>
                </button>
              </div>

              {/* D-Pad untuk mode manual */}
              {driveMode === 'manual' && (
                <div className="mt-1.5 p-1 bg-white rounded-lg border border-slate-200 flex flex-col items-center gap-0.5">
                  <button
                    onMouseDown={() => onManualControlChange('forward', true)}
                    onMouseUp={() => onManualControlChange('forward', false)}
                    onTouchStart={() => onManualControlChange('forward', true)}
                    onTouchEnd={() => onManualControlChange('forward', false)}
                    className={`w-9 h-6 rounded flex items-center justify-center ${
                      manualControls.forward ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onMouseDown={() => onManualControlChange('left', true)}
                      onMouseUp={() => onManualControlChange('left', false)}
                      onTouchStart={() => onManualControlChange('left', true)}
                      onTouchEnd={() => onManualControlChange('left', false)}
                      className={`w-9 h-6 rounded flex items-center justify-center ${
                        manualControls.left ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onMouseDown={() => onManualControlChange('backward', true)}
                      onMouseUp={() => onManualControlChange('backward', false)}
                      onTouchStart={() => onManualControlChange('backward', true)}
                      onTouchEnd={() => onManualControlChange('backward', false)}
                      className={`w-9 h-6 rounded flex items-center justify-center ${
                        manualControls.backward ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onMouseDown={() => onManualControlChange('right', true)}
                      onMouseUp={() => onManualControlChange('right', false)}
                      onTouchStart={() => onManualControlChange('right', true)}
                      onTouchEnd={() => onManualControlChange('right', false)}
                      className={`w-9 h-6 rounded flex items-center justify-center ${
                        manualControls.right ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. DUA TOMBOL GANTI (KAMERA & CUACA) */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Tombol Kamera */}
              <button
                onClick={nextCamera}
                className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 text-slate-800 text-xs font-heading font-semibold flex items-center justify-between gap-1 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                title="Ganti Sudut Pandang Kamera"
              >
                <div className="flex items-center gap-1 truncate">
                  <Camera className="w-3 h-3 text-[#1E88E5] shrink-0" />
                  <span className="truncate text-[11px]">{cameraLabel}</span>
                </div>
                <span className="text-[8.5px] font-bold px-1 py-0.2 rounded bg-blue-100 text-blue-700 shrink-0">
                  Ganti
                </span>
              </button>

              {/* Tombol Cuaca */}
              <button
                onClick={nextWeather}
                className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 text-slate-800 text-xs font-heading font-semibold flex items-center justify-between gap-1 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                title="Ganti Kondisi Cuaca"
              >
                <div className="flex items-center gap-1 truncate">
                  {weather === 'sunny' ? (
                    <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                  ) : weather === 'rain' ? (
                    <CloudRain className="w-3 h-3 text-blue-500 shrink-0" />
                  ) : (
                    <Moon className="w-3 h-3 text-indigo-500 shrink-0" />
                  )}
                  <span className="truncate text-[11px]">{weatherLabel}</span>
                </div>
                <span className="text-[8.5px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                  Ganti
                </span>
              </button>
            </div>

            {/* 4. DUA TOGGLE MODE: LIDAR GELAP & PETA 2D */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Toggle LiDAR Gelap */}
              <button
                onClick={() => onDisplayVisionChange(displayVision === 'normal' ? 'technical' : 'normal')}
                className={`p-1.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  displayVision === 'technical'
                    ? 'bg-slate-900 border-emerald-500 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Cpu className={`w-3 h-3 shrink-0 ${displayVision === 'technical' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-heading font-bold truncate">
                    {displayVision === 'technical' ? 'LiDAR Gelap' : 'Visual Biasa'}
                  </span>
                </div>
                <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded shrink-0 ${
                  displayVision === 'technical' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-200 text-slate-600'
                }`}>
                  Ganti
                </span>
              </button>

              {/* Toggle Peta 2D */}
              <button
                onClick={() => onViewDimensionChange(viewDimension === '3d' ? '2d' : '3d')}
                className={`p-1.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  viewDimension === '2d'
                    ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Layers className={`w-3 h-3 shrink-0 ${viewDimension === '2d' ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-heading font-bold truncate">
                    {viewDimension === '2d' ? 'Peta Radar 2D' : 'Kota 3D'}
                  </span>
                </div>
                <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded shrink-0 ${
                  viewDimension === '2d' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  Ganti
                </span>
              </button>
            </div>

            {/* 5. KEPUTUSAN AI & STATISTIK RINGKAS */}
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C896] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00C896]" />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Keputusan Mobil AI
                </span>
              </div>

              <p className="text-[10.5px] font-medium text-slate-800 mb-1.5 leading-snug line-clamp-2">
                {currentDecision}
              </p>

              {/* 3 Angka Ringkas */}
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="p-1 rounded-lg bg-blue-50/70 border border-blue-100">
                  <p className="text-[8px] text-slate-500">Jarak</p>
                  <p className="text-xs font-bold font-heading text-[#1E88E5] tabular-nums">
                    {stats.distanceTraveledMeters >= 1000
                      ? `${(stats.distanceTraveledMeters / 1000).toFixed(1)} km`
                      : `${Math.round(stats.distanceTraveledMeters)} m`}
                  </p>
                </div>

                <div className="p-1 rounded-lg bg-amber-50/70 border border-amber-100">
                  <p className="text-[8px] text-slate-500">Deteksi</p>
                  <p className="text-xs font-bold font-heading text-amber-600 tabular-nums">
                    {stats.obstaclesDetected}
                  </p>
                </div>

                <div className="p-1 rounded-lg bg-emerald-50/70 border border-emerald-100">
                  <p className="text-[8px] text-slate-500">Dihindari</p>
                  <p className="text-xs font-bold font-heading text-[#00C896] tabular-nums">
                    {stats.hazardsAvoided}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
