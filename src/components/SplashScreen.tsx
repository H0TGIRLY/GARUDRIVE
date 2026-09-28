import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Show tagline after 1000ms with dramatic sound/visual feel
    const timerTagline = setTimeout(() => {
      setTaglineVisible(true);
    }, 1000);

    // Show educational detail line after 2000ms
    const timerDetail = setTimeout(() => {
      setDetailVisible(true);
    }, 2000);

    // Trigger fade-out after 4200ms
    const timerFadeOut = setTimeout(() => {
      setFadingOut(true);
    }, 4200);

    // Call onFinish after 4700ms
    const timerComplete = setTimeout(() => {
      onFinish();
    }, 4700);

    return () => {
      clearTimeout(timerTagline);
      clearTimeout(timerDetail);
      clearTimeout(timerFadeOut);
      clearTimeout(timerComplete);
    };
  }, [onFinish]);

  return (
    <div
      onClick={() => onFinish()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFinish(); }}
      aria-label="Klik untuk langsung lanjut"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050B14] transition-opacity duration-700 ease-in-out cursor-pointer ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Cinematic Cyberpunk / Autonomous Tech Laser Waves */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,150,0.15)_0,transparent_70%)]" />
      <div className="absolute w-[560px] h-[560px] rounded-full border border-cyan-500/20 animate-ping opacity-30 pointer-events-none" />
      <div className="absolute w-[380px] h-[380px] rounded-full border border-emerald-500/30 animate-pulse pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] rounded-full border border-blue-500/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Animated Brand Icon */}
        <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-tr from-[#1E88E5] to-[#00C896] flex items-center justify-center shadow-lg shadow-emerald-500/20 transform transition-transform duration-700 hover:scale-105">
          <Cpu className="w-9 h-9 text-white animate-pulse" />
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-heading mb-3 text-gradient-garudrive select-none">
          GARUDRIVE
        </h1>

        {/* Tagline */}
        <p
          className={`text-lg md:text-xl font-medium text-slate-100 transition-all duration-700 select-none ${
            taglineVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          Masa Depan Berkendara, Dikendalikan AI
        </p>

        {/* Dramatic Sub-info */}
        <p
          className={`text-xs md:text-sm font-light text-cyan-300/90 mt-2 transition-all duration-700 select-none ${
            detailVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          Inisialisasi Sistem Sensor LiDAR & Jaringan Saraf Tiruan...
        </p>

        {/* Subtle affordance */}
        <div className="mt-10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>Simulator Edukatif Mobil Otonom</span>
          <span>·</span>
          <span className="text-slate-500">Ketuk layar untuk melewati</span>
        </div>
      </div>
    </div>
  );
};
