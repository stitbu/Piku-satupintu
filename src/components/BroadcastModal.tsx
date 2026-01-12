
import React, { useState } from 'react';
import { Icon } from './Icon';
import { DivisionType, UserRole } from '../types';
import { DIVISIONS } from '../constants';
import { GeminiService } from '../services/geminiService';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (content: string, targets: string[]) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose, onSend }) => {
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'DIVISIONS' | 'MANAGERS'>('ALL');
  const [selectedDivs, setSelectedDivs] = useState<Set<string>>(new Set());
  const [isPolishing, setIsPolishing] = useState(false);

  if (!isOpen) return null;

  const handlePolish = async () => {
    if (!content.trim()) return;
    setIsPolishing(true);
    const polished = await GeminiService.polishMessage(content);
    setContent(polished);
    setIsPolishing(false);
  };

  const toggleDiv = (id: string) => {
    const next = new Set(selectedDivs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDivs(next);
  };

  const handleConfirmSend = () => {
    if (!content.trim()) return;
    
    let targetIds: string[] = [];
    if (targetType === 'ALL') targetIds = ['GENERAL'];
    else if (targetType === 'MANAGERS') targetIds = ['GENERAL']; // Logic in backend would filter by role
    else targetIds = Array.from(selectedDivs);

    onSend(content, targetIds);
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]">
      <div className="bg-[#1e293b] w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl"><Icon name="Megaphone" size={20} /></div>
            <div>
              <h3 className="text-xl font-bold">Kirim Pesan Siaran</h3>
              <p className="text-white/60 text-xs mt-0.5">Kirim pengumuman ke banyak channel sekaligus</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><Icon name="X" size={24} /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
          {/* Target Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Penerima</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setTargetType('ALL')}
                className={`py-3 rounded-2xl text-xs font-bold border transition-all ${targetType === 'ALL' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
              >
                Seluruh Tim
              </button>
              <button 
                onClick={() => setTargetType('DIVISIONS')}
                className={`py-3 rounded-2xl text-xs font-bold border transition-all ${targetType === 'DIVISIONS' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
              >
                Pilih Divisi
              </button>
              <button 
                onClick={() => setTargetType('MANAGERS')}
                className={`py-3 rounded-2xl text-xs font-bold border transition-all ${targetType === 'MANAGERS' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
              >
                Hanya Manager
              </button>
            </div>

            {targetType === 'DIVISIONS' && (
              <div className="flex flex-wrap gap-2 pt-2 animate-[fadeIn_0.3s]">
                {DIVISIONS.map(div => (
                  <button 
                    key={div.id}
                    onClick={() => toggleDiv(div.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${selectedDivs.has(div.id) ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}
                  >
                    {div.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Isi Pesan Siaran</label>
              <button 
                onClick={handlePolish}
                disabled={isPolishing || !content.trim()}
                className="flex items-center gap-1.5 text-[10px] font-bold text-brand-400 hover:text-brand-300 disabled:opacity-50"
              >
                {isPolishing ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="Sparkles" size={12} />}
                Gunakan AI (Sopan & Formal)
              </button>
            </div>
            <textarea 
              className="w-full h-40 bg-black/30 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-brand-500 transition-all resize-none placeholder-gray-600"
              placeholder="Contoh: Info libur besok, semua staff dimohon cek..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <p className="text-[10px] text-gray-500 italic">Pesan akan ditandai sebagai "📢 SIARAN RESMI"</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white">Batal</button>
          <button 
            onClick={handleConfirmSend}
            disabled={!content.trim() || (targetType === 'DIVISIONS' && selectedDivs.size === 0)}
            className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Icon name="Send" size={16} /> Kirim Siaran
          </button>
        </div>
      </div>
    </div>
  );
};
