import React from 'react';
import { useMesob } from '../../context/MesobContext';
import { X, QrCode, Sparkles, Check, Smartphone } from 'lucide-react';
import { QRCodeSvg } from '../common/QRCodeSvg';

export const QRSimulatorModal: React.FC = () => {
  const {
    isQRScannerOpen,
    setIsQRScannerOpen,
    tableNumber,
    setTableNumber,
    navigateTo,
  } = useMesob();

  if (!isQRScannerOpen) return null;

  const tables = ['12', '4', '7', '9', '14', 'VIP-1', 'Patio-3'];

  const handleSelectTable = (tbl: string) => {
    setTableNumber(tbl);
    navigateTo(`/mesob/table/${tbl}`);
    setIsQRScannerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-slide-up space-y-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            <span>Simulate QR / NFC Table Scan</span>
          </div>
          <button
            onClick={() => setIsQRScannerOpen(false)}
            className="p-1 rounded-full text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Scannable QR Code Graphic Display */}
        <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col items-center justify-center">
          <div className="w-36 h-36 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg">
            <QRCodeSvg
              value={`mesob.restaurant/table/${tableNumber}`}
              size={130}
            />
          </div>
          <span className="text-[11px] text-stone-400 mt-2 font-mono">
            mesob.restaurant/table/{tableNumber}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white font-display">
            Select Dining Table
          </h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Simulates tapping an NFC table tag or scanning the tabletop QR code disc.
          </p>
        </div>

        {/* Table Selection Grid */}
        <div className="grid grid-cols-4 gap-2">
          {tables.map((tbl) => {
            const isSelected = tableNumber === tbl;
            return (
              <button
                key={tbl}
                onClick={() => handleSelectTable(tbl)}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-amber-600 text-stone-950 ring-2 ring-amber-400 shadow-md'
                    : 'bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                <span>#{tbl}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-[11px] text-stone-500">
          Instant zero-friction entry • No login required
        </div>
      </div>
    </div>
  );
};
