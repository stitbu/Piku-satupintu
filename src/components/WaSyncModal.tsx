
import React, { useState } from 'react';
import { Icon } from './Icon';
import { GeminiService } from '../services/geminiService';

interface WaSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: any[]) => void;
  divisionName: string;
}

export const WaSyncModal: React.FC<WaSyncModalProps> = ({ isOpen, onClose, onImport, divisionName }) => {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSync = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    const extractedCards = await GeminiService.parseWaChat(rawText);
    onImport(extractedCards);
    setIsProcessing(false);
    setRawText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#1e293b] w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-[scaleIn_0.2s]">
        <div className="p-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl shadow-inner"><Icon name="MessageCircle" size={24} /></div>
                <div>
                    <h3 className="text-xl font-bold">WhatsApp Free Sync</h3>
                    <p className="text-green-100 text-xs mt-1">Impor pesan grup {divisionName} via Clipboard</p>
                </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white"><Icon name="X" size={24} /></button>
        </div>

        <div className="p-8 space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3 items-start">
                <Icon name="Info" className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-blue-200 leading-relaxed">
                    <p className="font-bold mb-1">Cara Sinkronisasi Gratis:</p>
                    <ol className="list-decimal ml-4 space-y-1 opacity-80">
                        <li>Buka WhatsApp Web, masuk ke Grup <strong>{divisionName}</strong>.</li>
                        <li>Tekan <strong>Ctrl+A</strong> (pilih semua chat) lalu <strong>Ctrl+C</strong> (copy).</li>
                        <li>Paste (Ctrl+V) ke kotak di bawah ini. AI akan merapikannya.</li>
                    </ol>
                </div>
            </div>

            <textarea 
                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-green-500 transition-all resize-none placeholder-gray-600 font-mono"
                placeholder="Paste chat WhatsApp di sini..."
                value={rawText}
                onChange={e => setRawText(e.target.value)}
            />
        </div>

        <div className="p-8 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors">Batal</button>
          <button 
            onClick={handleSync}
            disabled={isProcessing || !rawText.trim()}
            className="px-10 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-900/40 transition-all flex items-center gap-2"
          >
            {isProcessing ? <Icon name="Loader2" className="animate-spin" size={18} /> : <Icon name="RefreshCw" size={18} />}
            {isProcessing ? 'AI sedang merapikan...' : 'Mulai Sinkronisasi AI'}
          </button>
        </div>
      </div>
    </div>
  );
};
