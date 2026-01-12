
import React, { useState } from 'react';
import { Icon } from './Icon';
import { GeminiService } from '../services/geminiService';
import { DIVISIONS } from '../constants';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: any[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [inputText, setInputText] = useState('');
  const [scannedTasks, setScannedTasks] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  const handleScan = async () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    try {
      const result = await GeminiService.parseBulkTasks(inputText);
      if (Array.isArray(result)) {
        setScannedTasks(result);
        setStep('preview');
      } else {
        alert("Gagal membaca hasil AI. Coba lagi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi AI.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = (index: number) => {
    setScannedTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
      onImport(scannedTasks);
      onClose();
      // Reset
      setInputText('');
      setScannedTasks([]);
      setStep('input');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e2e] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Icon name="ListPlus" className="text-purple-400" /> Import Tugas Massal
          </h2>
          <button onClick={onClose}><Icon name="X" className="text-gray-400 hover:text-white" /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === 'input' ? (
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-xs text-purple-200">
                <strong>Tips:</strong> Copy-paste notulen rapat atau chat WhatsApp yang panjang di sini. AI akan otomatis memisahkan tugasnya.
              </div>
              <textarea
                className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-purple-500 outline-none resize-none placeholder-gray-600"
                placeholder="Contoh: Tolong IT benerin wifi lt 2 segera, Marketing posting konten IG jam 5, Keuangan rekap gaji besok..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Ditemukan <strong>{scannedTasks.length} tugas</strong>. Silakan periksa sebelum disimpan.</p>
              <div className="space-y-2">
                {scannedTasks.map((task, idx) => (
                  <div key={idx} className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/5 items-center">
                    <div className="p-2 bg-white/10 rounded text-gray-300"><Icon name="CheckSquare" size={16}/></div>
                    <div className="flex-1 min-w-0">
                      <input 
                        value={task.title} 
                        onChange={(e) => {
                           const newTasks = [...scannedTasks];
                           newTasks[idx].title = e.target.value;
                           setScannedTasks(newTasks);
                        }}
                        className="bg-transparent border-b border-transparent focus:border-purple-500 outline-none w-full text-sm text-white font-bold mb-1"
                      />
                      <div className="flex gap-2">
                        <select 
                            value={task.divisionId} 
                            onChange={(e) => {
                                const n = [...scannedTasks];
                                n[idx].divisionId = e.target.value;
                                setScannedTasks(n);
                            }}
                            className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase outline-none"
                        >
                            <option value="BROADCAST">BROADCAST</option>
                            {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select 
                            value={task.priority} 
                            onChange={(e) => {
                                const n = [...scannedTasks];
                                n[idx].priority = e.target.value;
                                setScannedTasks(n);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded border uppercase outline-none ${task.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-gray-700 text-gray-300 border-gray-600'}`}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(idx)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"><Icon name="Trash2" size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20">
          {step === 'input' ? (
            <button 
              onClick={handleScan} 
              disabled={isScanning || !inputText}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-purple-900/20"
            >
              <Icon name={isScanning ? "Loader2" : "Sparkles"} className={isScanning ? "animate-spin" : ""} size={16}/>
              {isScanning ? "Sedang Membaca..." : "Scan dengan AI"}
            </button>
          ) : (
            <>
              <button onClick={() => setStep('input')} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium">Kembali</button>
              <button 
                onClick={handleSaveAll}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-green-900/20 flex items-center gap-2"
              >
                <Icon name="Save" size={16} />
                Simpan Semua
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
