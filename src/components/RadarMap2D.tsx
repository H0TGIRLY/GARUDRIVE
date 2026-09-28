import React from 'react';
import {
  CarState,
  DisplayVisionMode,
  ObstacleObject,
  WeatherMode,
} from '../types/simulator';

interface RadarMap2DProps {
  carState: CarState;
  obstacles: ObstacleObject[];
  displayVision: DisplayVisionMode;
  weather: WeatherMode;
  isVisible: boolean;
}

export const RadarMap2D: React.FC<RadarMap2DProps> = ({
  carState,
  obstacles,
  displayVision,
  weather,
  isVisible,
}) => {
  // World coordinates range from approx -50 to 50.
  // Center is (300, 300) in a 600x600 SVG viewBox.
  const scale = 5.2; // pixels per world unit
  const toSvgX = (worldX: number) => 300 + worldX * scale;
  const toSvgY = (worldZ: number) => 300 + worldZ * scale;

  const carSvgX = toSvgX(carState.x);
  const carSvgY = toSvgY(carState.z);
  const carAngleDeg = (carState.rotation * 180) / Math.PI;

  const isDarkLiDAR = displayVision === 'technical';
  const isNight = weather === 'night';
  const isRain = weather === 'rain';

  const bgColor = isDarkLiDAR
    ? 'bg-[#050A14]'
    : isNight
    ? 'bg-[#0B1120]'
    : isRain
    ? 'bg-[#CBD5E1]'
    : 'bg-[#EEF2F6]';

  return (
    <div
      className={`absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      } ${bgColor}`}
    >
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full max-w-[900px] max-h-[900px] p-4 select-none"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="radarGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke={isDarkLiDAR ? 'rgba(0, 229, 255, 0.12)' : isNight ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
              strokeWidth="1"
            />
          </pattern>

          {/* Sensor beam gradient */}
          <radialGradient id="sensorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#00C896" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00C896" stopOpacity="0" />
          </radialGradient>

          {/* Danger sensor gradient */}
          <radialGradient id="dangerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Grid */}
        <rect width="600" height="600" fill="url(#radarGrid)" />

        {/* Outer City Blocks */}
        <g opacity={isDarkLiDAR ? 0.3 : isNight ? 0.35 : 0.6}>
          <rect x={toSvgX(-52)} y={toSvgY(-52)} width={80} height={80} rx="6" fill={isDarkLiDAR ? '#0F172A' : '#E2E8F0'} stroke={isDarkLiDAR ? '#00E5FF' : 'none'} strokeWidth="1" />
          <rect x={toSvgX(20)} y={toSvgY(-52)} width={80} height={80} rx="6" fill={isDarkLiDAR ? '#0F172A' : '#E2E8F0'} stroke={isDarkLiDAR ? '#00E5FF' : 'none'} strokeWidth="1" />
          <rect x={toSvgX(-52)} y={toSvgY(20)} width={80} height={80} rx="6" fill={isDarkLiDAR ? '#0F172A' : '#E2E8F0'} stroke={isDarkLiDAR ? '#00E5FF' : 'none'} strokeWidth="1" />
          <rect x={toSvgX(20)} y={toSvgY(20)} width={80} height={80} rx="6" fill={isDarkLiDAR ? '#0F172A' : '#E2E8F0'} stroke={isDarkLiDAR ? '#00E5FF' : 'none'} strokeWidth="1" />
        </g>

        {/* Central Alun-Alun Tugu Malang Circle */}
        <circle
          cx={toSvgX(0)}
          cy={toSvgY(0)}
          r={7 * scale}
          fill={isDarkLiDAR ? '#09182A' : isNight ? '#1E293B' : '#86EFAC'}
          stroke={isDarkLiDAR ? '#00E5FF' : '#00C896'}
          strokeWidth="2"
        />
        <circle
          cx={toSvgX(0)}
          cy={toSvgY(0)}
          r={3.8 * scale}
          fill={isDarkLiDAR ? '#0284C7' : '#38BDF8'}
        />
        <circle
          cx={toSvgX(0)}
          cy={toSvgY(0)}
          r={1.2 * scale}
          fill="#F59E0B"
        />

        {/* Expanded Asphalt Road Circuit & Center Avenue */}
        <g stroke={isDarkLiDAR ? '#00E5FF' : 'none'} strokeWidth={isDarkLiDAR ? 1 : 0} opacity={isDarkLiDAR ? 0.95 : 1}>
          {/* North Road */}
          <rect x={toSvgX(-42)} y={toSvgY(-38.45)} width={84 * scale} height={8.5 * scale} fill={isDarkLiDAR ? '#091224' : isNight ? '#1E2530' : '#2A313D'} rx="4" />
          {/* South Road */}
          <rect x={toSvgX(-42)} y={toSvgY(29.95)} width={84 * scale} height={8.5 * scale} fill={isDarkLiDAR ? '#091224' : isNight ? '#1E2530' : '#2A313D'} rx="4" />
          {/* West Road */}
          <rect x={toSvgX(-38.45)} y={toSvgY(-42)} width={8.5 * scale} height={84 * scale} fill={isDarkLiDAR ? '#091224' : isNight ? '#1E2530' : '#2A313D'} rx="4" />
          {/* East Road */}
          <rect x={toSvgX(29.95)} y={toSvgY(-42)} width={8.5 * scale} height={84 * scale} fill={isDarkLiDAR ? '#091224' : isNight ? '#1E2530' : '#2A313D'} rx="4" />
          {/* Central North-South Avenue */}
          <rect x={toSvgX(-4)} y={toSvgY(-34)} width={8.0 * scale} height={68 * scale} fill={isDarkLiDAR ? '#091224' : isNight ? '#1E2530' : '#2A313D'} />
          {/* Central East-West Boulevard */}
          <rect x={toSvgX(-34)} y={toSvgY(-4)} width={68 * scale} height={8.0 * scale} fill={isDarkLiDAR ? '#091224' : isNight ? '#1E2530' : '#2A313D'} />
        </g>

        {/* Lane Center Dashed Lines */}
        <g stroke={isDarkLiDAR ? '#00F5FF' : '#FFFFFF'} strokeWidth="1.5" strokeDasharray="5 7" opacity={isDarkLiDAR ? 0.85 : 0.6}>
          <line x1={toSvgX(-38)} y1={toSvgY(-36)} x2={toSvgX(38)} y2={toSvgY(-36)} />
          <line x1={toSvgX(-38)} y1={toSvgY(36)} x2={toSvgX(38)} y2={toSvgY(36)} />
          <line x1={toSvgX(-36)} y1={toSvgY(-38)} x2={toSvgX(-36)} y2={toSvgY(38)} />
          <line x1={toSvgX(36)} y1={toSvgY(-38)} x2={toSvgX(36)} y2={toSvgY(38)} />
        </g>

        {/* Crosswalk Stripes at North Road (X = 0, Z = -36) */}
        <g stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8">
          {[-10, -6, -2, 2, 6, 10].map((off) => (
            <line
              key={off}
              x1={toSvgX(0) + off}
              y1={toSvgY(-40)}
              x2={toSvgX(0) + off}
              y2={toSvgY(-32)}
            />
          ))}
        </g>

        {/* Stop Line at X = 12, Z = -34.2 */}
        <line
          x1={toSvgX(12)}
          y1={toSvgY(-36.2)}
          x2={toSvgX(12)}
          y2={toSvgY(-32.2)}
          stroke="#EF4444"
          strokeWidth="3"
          opacity="0.9"
        />

        {/* 2D Landmark Pin 1: Stasiun Malang */}
        <g transform={`translate(${toSvgX(-30)}, ${toSvgY(-43)})`}>
          <rect x="-42" y="-12" width="84" height="18" rx="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1" />
          <text x="0" y="1" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="Space Grotesk, sans-serif" textAnchor="middle">
            🚉 Stasiun Malang
          </text>
        </g>

        {/* 2D Landmark Pin 2: Universitas Ma Chung */}
        <g transform={`translate(${toSvgX(-43)}, ${toSvgY(-20)})`}>
          <rect x="-48" y="-12" width="96" height="18" rx="4" fill="#B91C1C" stroke="#FFFFFF" strokeWidth="1" />
          <text x="0" y="1" fill="#FFFFFF" fontSize="8.5" fontWeight="bold" fontFamily="Space Grotesk, sans-serif" textAnchor="middle">
            🎓 Univ Ma Chung
          </text>
        </g>

        {/* Obstacles Rendering in 2D */}
        {obstacles.map((obs) => {
          const obsX = toSvgX(obs.x);
          const obsY = toSvgY(obs.z);
          const isDanger = obs.status === 'danger';
          const isWarning = obs.status === 'warning';
          const color = isDanger ? '#EF4444' : isWarning ? '#FFB800' : '#00C896';

          return (
            <g key={obs.id}>
              {/* Pulse circle for obstacle */}
              <circle
                cx={obsX}
                cy={obsY}
                r="15"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.6"
                className="animate-ping"
              />

              {obs.type === 'pedestrian' && (
                <g transform={`translate(${obsX}, ${obsY})`}>
                  <circle r="6" fill={color} />
                  <circle r="2.5" fill="#FFFFFF" />
                </g>
              )}

              {obs.type === 'vehicle' && (
                <rect
                  x={obsX - 8}
                  y={obsY - 16}
                  width="16"
                  height="32"
                  rx="3"
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )}

              {obs.type === 'traffic_light' && (
                <g transform={`translate(${obsX}, ${obsY})`}>
                  <rect x="-6" y="-10" width="12" height="20" rx="3" fill="#1E293B" stroke="#CBD5E1" strokeWidth="1" />
                  <circle cx="0" cy="0" r="4.5" fill={color} />
                </g>
              )}

              {/* Technical label in 2D mode */}
              {displayVision === 'technical' && (
                <g transform={`translate(${obsX}, ${obsY - 18})`}>
                  <rect
                    x="-42"
                    y="-14"
                    width="84"
                    height="14"
                    rx="3"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke={color}
                    strokeWidth="0.5"
                  />
                  <text
                    x="0"
                    y="-3"
                    fill="#FFFFFF"
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                    textAnchor="middle"
                  >
                    {obs.name} · {obs.distance}m
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Autonomous Lamborghini Car & LiDAR Sensor Range in 2D */}
        <g transform={`translate(${carSvgX}, ${carSvgY})`}>
          {/* Thin sensor range ring (Always visible in 2D mode) */}
          <circle
            cx="0"
            cy="0"
            r="85"
            fill={displayVision === 'technical' ? 'url(#sensorGlow)' : 'none'}
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.65"
          />

          {/* Front radar cone indicator */}
          <path
            d="M 0 0 L -25 55 L 25 55 Z"
            transform={`rotate(${carAngleDeg + 180})`}
            fill="#00C896"
            opacity="0.2"
          />

          {/* Lamborghini Vehicle Glyph */}
          <g transform={`rotate(${carAngleDeg})`}>
            {/* Brake light red bar behind car when braking */}
            {carState.isBraking && (
              <rect
                x="-11"
                y="-22"
                width="22"
                height="6"
                rx="2"
                fill="#EF4444"
                className="animate-pulse"
              />
            )}

            {/* Rear Supercar Wing */}
            <rect x="-12" y="-18" width="24" height="4" rx="1.5" fill="#0F172A" />

            {/* Lamborghini Low Wedge Body */}
            <polygon
              points="0,18 -8,12 -9,-14 9,-14 8,12"
              fill="#FFFFFF"
              stroke="#00C896"
              strokeWidth="2"
            />

            {/* Racing Cyber Stripes */}
            <line x1="-6" y1="-10" x2="-6" y2="10" stroke="#1E88E5" strokeWidth="1.5" />
            <line x1="6" y1="-10" x2="6" y2="10" stroke="#00C896" strokeWidth="1.5" />

            {/* Raked Cockpit Canopy */}
            <polygon points="0,7 -5,1 -5,-8 5,-8 5,1" fill="#090D16" />

            {/* Front Splitter Carbon Lip */}
            <line x1="-7" y1="16" x2="7" y2="16" stroke="#0F172A" strokeWidth="2" />

            {/* LiDAR roof sensor pod */}
            <circle cx="0" cy="-2" r="3" fill="#00C896" stroke="#090D16" strokeWidth="1" />
          </g>
        </g>

        {/* Compass Rose */}
        <g transform="translate(555, 45)">
          <circle cx="0" cy="0" r="18" fill={isDarkLiDAR ? '#0F172A' : '#FFFFFF'} stroke="#CBD5E1" strokeWidth="1" />
          <polygon points="0,-13 3,0 -3,0" fill="#EF4444" />
          <polygon points="0,13 3,0 -3,0" fill="#94A3B8" />
          <text x="0" y="-15" fill="#EF4444" fontSize="8" fontWeight="bold" textAnchor="middle">
            U
          </text>
        </g>
      </svg>
    </div>
  );
};
