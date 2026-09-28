import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { ViewDimension } from '../types/simulator';

interface HeaderBarProps {
  onOpenGuide: () => void;
  currentSpeedKmH: number;
  viewDimension: ViewDimension;
  onToggleDimension: () => void;
  driveMode: 'auto' | 'manual';
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenGuide,
  currentSpeedKmH,
  viewDimension,
  onToggleDimension,
  driveMode,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <span className="text-xl md:text-2xl font-bold font-heading tracking-tight text-gradient-garudrive">
          GARUDRIVE
        </span>
        <span className="hidden sm:inline-block text-xs text-[#6B7280]">
          ·
        </span>
        <span className="hidden sm:inline-block text-xs font-medium text-[#6B7280]">
          Masa Depan Berkendara, Dikendalikan AI
        </span>
      </div>

      {/* Zone 2: Live Status Readout */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
          <span>Sistem Otonom Aktif</span>
        </div>
        <span>·</span>
        <span>Mode: <strong className="text-slate-900">{driveMode === 'auto' ? 'Otomatis (AI)' : 'Manual (Sopir)'}</strong></span>
        <span>·</span>
        <span>Visual: <strong className="text-slate-900">{viewDimension === '3d' ? '3D Mini Kota' : '2D Radar Map'}</strong></span>
      </div>

      {/* Zone 3: Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Speedometer badge */}
        <div className="flex items-baseline gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-900 font-heading">
          <span className="text-base font-bold tabular-nums text-[#1E88E5]">
            {currentSpeedKmH}
          </span>
          <span className="text-[10px] text-slate-500 font-sans">km/jam</span>
        </div>

        {/* 2D/3D Fast Switch Button with 'Ganti' */}
        <button
          onClick={onToggleDimension}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-heading border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          title="Ganti tampilan 2D / 3D"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00C896]" />
          <span>Ganti: {viewDimension === '3d' ? 'Peta 2D' : 'Kota 3D'}</span>
        </button>

        {/* Interactive Guide Reopen Button */}
        <button
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-heading bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title="Buka kembali panduan penggunaan"
        >
          <HelpCircle className="w-4 h-4 text-[#1E88E5]" />
          <span className="hidden sm:inline">Panduan</span>
        </button>
      </div>
    </header>
  );
};
