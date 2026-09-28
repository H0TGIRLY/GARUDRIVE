import React, { useState } from 'react';
import { ArrowRight, Bot, Compass, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleStart = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onStart();
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-40 w-screen h-screen overflow-y-auto sm:overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-[#F8FAFC] via-[#EEF2F6] to-[#E2E8F0] p-3 sm:p-6 md:p-8 transition-opacity duration-500 ease-in-out ${
        isLeaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-80 bg-gradient-to-tr from-blue-300/25 via-teal-300/20 to-emerald-300/25 rounded-full blur-3xl pointer-events-none" />

      {/* Full-width responsive container matching one full page */}
      <div className="relative w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-slate-200/80 text-center flex flex-col items-center justify-between my-auto">
        {/* Modern minimal badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-600 mb-3 sm:mb-4">
          <Bot className="w-4 h-4 text-[#1E88E5]" />
          <span>Transformasi Digital</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-[#00C896]">Simulator Edukatif Mobil Otonom</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[#1A1F2B] mb-2 sm:mb-3 tracking-tight">
          Selamat Datang di <span className="text-gradient-garudrive">GARUDRIVE</span>
        </h1>

        {/* 1-2 sentence simple explanation */}
        <p className="text-xs sm:text-base md:text-lg text-[#6B7280] leading-relaxed max-w-3xl mb-4 sm:mb-6">
          Simulator edukasi interaktif untuk mempelajari bagaimana kecerdasan buatan (AI)
          mengendalikan mobil agar dapat melaju, mengenali rintangan, dan mengerem
          otomatis secara mandiri tanpa disetir manusia.
        </p>

        {/* Expansive feature highlight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full mb-5 sm:mb-7 text-left">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 transition-colors">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center mb-2 sm:mb-3">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-sm sm:text-base font-semibold font-heading text-[#1A1F2B]">Mobil Jalan Sendiri</h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-[#6B7280] mt-1 leading-relaxed">
              AI memandu mobil menelusuri jalanan kota Malang dari Stasiun ke Univ Ma Chung secara mandiri.
            </p>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-emerald-200 transition-colors">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#00C896] flex items-center justify-center mb-2 sm:mb-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-sm sm:text-base font-semibold font-heading text-[#1A1F2B]">Sensor LiDAR Pintar</h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-[#6B7280] mt-1 leading-relaxed">
              Pancaran laser 360° mendeteksi dan memberi kotak pembatas visual (*bounding box*) pada seluruh objek.
            </p>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-amber-200 transition-colors">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 sm:mb-3">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-sm sm:text-base font-semibold font-heading text-[#1A1F2B]">Uji Skenario Bahaya</h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-[#6B7280] mt-1 leading-relaxed">
              Uji respon komputer AI saat pejalan kaki menyeberang, mobil depan mengerem, dan lampu merah.
            </p>
          </div>
        </div>

        {/* Main CTA Button: Big gradient button with hover scale up + soft glow */}
        <button
          onClick={handleStart}
          className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl text-white font-heading font-semibold text-base sm:text-xl gradient-garudrive shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer mb-4 sm:mb-6"
        >
          <span>Mulai Simulasi</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1.5 transition-transform duration-200" />
        </button>

        {/* Credits and Course Info */}
        <div className="pt-3 sm:pt-4 border-t border-slate-100 w-full flex flex-col items-center gap-0.5 text-xs text-[#6B7280]">
          <p className="font-semibold text-[#1A1F2B] text-[11px] sm:text-xs">
            Dibuat oleh Cornelia Gisela Thealova (322410003) dan Siti Nur Hadiah (322410015)
          </p>
          <p className="text-slate-400 text-[10px] sm:text-xs">
            Tugas Mata Kuliah Transformasi Digital
          </p>
        </div>
      </div>
    </div>
  );
};
