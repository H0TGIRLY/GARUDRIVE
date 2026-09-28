import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  Layers,
  MapPin,
  Play,
  SlidersHorizontal,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
  onStepChange?: (stepKey: string) => void;
}

interface StepItem {
  id: string;
  targetKey: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tip: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: StepItem[] = [
    {
      id: 'step-mode',
      targetKey: 'mode',
      title: '1. Mode Manual & Otomatis',
      desc: 'Pilih apakah mobil berjalan sendiri dikendalikan kecerdasan buatan (AI) atau Anda ingin menyetir sendiri dengan tombol panah/WASD.',
      icon: <SlidersHorizontal className="w-5 h-5 text-[#1E88E5]" />,
      tip: 'Saat mode otomatis aktif, AI akan mengatur gas, rem, dan setir secara mandiri.',
    },
    {
      id: 'step-scenarios',
      targetKey: 'scenarios',
      title: '2. Tombol Uji Skenario',
      desc: 'Coba tiga situasi darurat jalan raya: Orang Menyeberang, Mobil Berhenti Mendadak, dan Lampu Merah.',
      icon: <Play className="w-5 h-5 text-[#00C896]" />,
      tip: 'Perhatikan mobil akan mengerem seketika dan lampu rem belakang menyala merah terang!',
    },
    {
      id: 'step-pov',
      targetKey: 'pov',
      title: '3. Sudut Pandang Kamera',
      desc: 'Ganti sudut pandang kamera: Tampilan Bebas (putar sendiri), Tampilan dari Atas, Mata Pengemudi, atau Mengikuti Mobil.',
      icon: <Compass className="w-5 h-5 text-[#1E88E5]" />,
      tip: 'Anda juga bisa menekan tombol Reset untuk mengembalikan kamera ke posisi awal.',
    },
    {
      id: 'step-vision',
      targetKey: 'vision',
      title: '4. Tampilan Teknis AI (Sensor)',
      desc: 'Nyalakan mode ini untuk melihat apa yang dilihat "otak" mobil: garis laser LiDAR dan kotak pendeteksi objek.',
      icon: <Cpu className="w-5 h-5 text-[#00C896]" />,
      tip: 'Warna kuning berarti pejalan kaki, hijau untuk mobil lain, dan merah untuk bahaya dekat.',
    },
    {
      id: 'step-dimension',
      targetKey: 'dimension',
      title: '5. Tampilan Peta 2D & 3D',
      desc: 'Beralih instan antara tampilan 3D kota atau peta radar 2D dari atas yang sangat ringan dan responsif.',
      icon: <Layers className="w-5 h-5 text-[#1E88E5]" />,
      tip: 'Kedua mode tetap terhubung dan bergerak serempak secara real-time.',
    },
    {
      id: 'step-status',
      targetKey: 'status',
      title: '6. Panel Status & Statistik',
      desc: 'Pantau pesan keputusan mobil secara langsung, jarak tempuh, rintangan terdeteksi, dan bahaya yang berhasil dihindari.',
      icon: <MapPin className="w-5 h-5 text-[#00C896]" />,
      tip: 'Angka statistik akan terus bertambah seiring perjalanan mobil di kota.',
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(steps[nextStep].targetKey);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(steps[prevStep].targetKey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar of modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C896] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Panduan Simulator ({currentStep + 1} dari {steps.length})
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 shrink-0">
            {step.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-[#1A1F2B] mb-2">
              {step.title}
            </h2>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
              {step.desc}
            </p>
            <div className="text-xs bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100/80">
              <span className="font-semibold">💡 Tips: </span>
              {step.tip}
            </div>
          </div>
        </div>

        {/* Progress step dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-6 bg-gradient-to-r from-[#1E88E5] to-[#00C896]'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onComplete}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Lewati Panduan
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold text-white font-heading gradient-garudrive shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>{currentStep === steps.length - 1 ? 'Mulai Simulator' : 'Lanjut'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
