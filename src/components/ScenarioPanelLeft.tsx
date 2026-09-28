import React from 'react';
import {
  Car,
  CheckCircle2,
  Info,
  Octagon,
  ShieldAlert,
  UserCheck,
  X,
  Play,
} from 'lucide-react';
import { ScenarioDetail, ScenarioType } from '../types/simulator';

interface ScenarioPanelLeftProps {
  activeScenario: ScenarioType;
  scenarioDetail: ScenarioDetail | null;
  onTriggerScenario: (type: ScenarioType) => void;
  onCloseModal?: () => void;
  isDriving: boolean;
  onStartDrive: () => void;
}

export const ScenarioPanelLeft: React.FC<ScenarioPanelLeftProps> = ({
  activeScenario,
  scenarioDetail,
  onTriggerScenario,
  onCloseModal,
  isDriving,
  onStartDrive,
}) => {
  const [showDetailModal, setShowDetailModal] = React.useState<boolean>(true);
  const [isMinimized, setIsMinimized] = React.useState<boolean>(false);

  // Re-open modal whenever a scenario is triggered
  React.useEffect(() => {
    if (activeScenario !== 'none') {
      setShowDetailModal(true);
    }
  }, [activeScenario]);

  return (
    <>
      {/* Box Skenario Kiri (Clean, ramping, dengan opsi sembunyikan/minimize) */}
      <div className="fixed z-30 left-3 top-16 md:top-20 md:left-5 pointer-events-auto">
        <div className="w-[260px] sm:w-[285px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden text-[#1A1F2B]">
          <div
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/80 cursor-pointer hover:bg-slate-100/70 select-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5] animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold font-heading text-[#1A1F2B]">
                Uji Skenario Bahaya
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-[#1E88E5]">
                {activeScenario !== 'none' ? 'Aktif' : '3 Skenario'}
              </span>
              <button
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title={isMinimized ? 'Tampilkan panel skenario' : 'Sembunyikan panel skenario agar jalan terlihat luas'}
              >
                {isMinimized ? '▼' : '▲'}
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="p-3 sm:p-3.5 space-y-2">
              <p className="text-[10.5px] text-[#6B7280] leading-tight">
                Pilih skenario untuk menguji respons AI mobil (berjalan 1x per klik):
              </p>

          {/* 3 Tombol Skenario */}
          <div className="flex flex-col gap-1.5">
            {/* Skenario 1: Orang Menyeberang */}
            <button
              onClick={() => onTriggerScenario(activeScenario === 'pedestrian' ? 'none' : 'pedestrian')}
              className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                activeScenario === 'pedestrian'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-amber-50 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${activeScenario === 'pedestrian' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold font-heading">Orang Menyeberang</p>
                  <p className={`text-[9.5px] ${activeScenario === 'pedestrian' ? 'text-amber-100' : 'text-slate-500'}`}>
                    Pejalan kaki melintas dari trotoar
                  </p>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                activeScenario === 'pedestrian' ? 'bg-white text-amber-600' : 'bg-slate-200 text-slate-600'
              }`}>
                {activeScenario === 'pedestrian' ? 'Aktif' : 'Uji'}
              </span>
            </button>

            {/* Skenario 2: Mobil Depan Ngerem */}
            <button
              onClick={() => onTriggerScenario(activeScenario === 'car_brake' ? 'none' : 'car_brake')}
              className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                activeScenario === 'car_brake'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-400'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-rose-50 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${activeScenario === 'car_brake' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'}`}>
                  <Car className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold font-heading">Mobil Depan Ngerem</p>
                  <p className={`text-[9.5px] ${activeScenario === 'car_brake' ? 'text-rose-100' : 'text-slate-500'}`}>
                    Jaga jarak aman & rem bertahap halus
                  </p>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                activeScenario === 'car_brake' ? 'bg-white text-rose-600' : 'bg-slate-200 text-slate-600'
              }`}>
                {activeScenario === 'car_brake' ? 'Aktif' : 'Uji'}
              </span>
            </button>

            {/* Skenario 3: Lampu Merah */}
            <button
              onClick={() => onTriggerScenario(activeScenario === 'red_light' ? 'none' : 'red_light')}
              className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                activeScenario === 'red_light'
                  ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-red-50 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${activeScenario === 'red_light' ? 'bg-red-700 text-white' : 'bg-red-100 text-red-700'}`}>
                  <Octagon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold font-heading">Lampu Merah</p>
                  <p className={`text-[9.5px] ${activeScenario === 'red_light' ? 'text-red-100' : 'text-slate-500'}`}>
                    Berhenti aman di garis henti
                  </p>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                activeScenario === 'red_light' ? 'bg-white text-red-600' : 'bg-slate-200 text-slate-600'
              }`}>
                {activeScenario === 'red_light' ? 'Aktif' : 'Uji'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  </div>

      {/* POP-UP EDUKASI SEBAGAI FLOATING TOP NOTIFICATION (LETAK DI ATAS TENGAH, TIDAK MENUTUPI JALUR MAUPUN BAWAH) */}
      {activeScenario !== 'none' && scenarioDetail && showDetailModal && (
        <div className="fixed z-40 top-16 md:top-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-md pointer-events-auto transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 text-white backdrop-blur-xl rounded-2xl border border-blue-400/50 shadow-2xl p-3 sm:p-3.5 flex flex-col gap-2">
            {/* Header Pop-up Notification */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-heading text-white leading-tight">
                    {scenarioDetail.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-blue-300 font-semibold">
                      Analisis AI:
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 uppercase tracking-wide">
                      {scenarioDetail.stepText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {scenarioDetail.distanceInfo}
                </span>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                  title="Tutup Notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Pop-up Notification */}
            <p className="text-[11px] sm:text-xs text-slate-200 leading-snug">
              {scenarioDetail.explanation}
            </p>

            {/* Mobile sensor readout */}
            <div className="sm:hidden flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
              <span>Status Jarak Sensor:</span>
              <span className="font-bold text-emerald-400">{scenarioDetail.distanceInfo}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
