
import React, { useState } from 'react';
import { Icon } from './Icon';
import { GeminiService } from '../services/geminiService';
import { UnifiedDataService } from '../services/UnifiedDataService';
import { Task, User } from '../types';

interface AIAssistantProps {
    tasks: Task[];
    user: User;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ tasks, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleIngest = async () => {
        setIsProcessing(true);
        const res = await GeminiService.intelligentIngest(query);
        
        if (res.type === 'TASK') {
            /* FIX: Pass user.id as the second argument to addTask to comply with the service signature and enable audit logging */
            await UnifiedDataService.addTask({
                id: crypto.randomUUID(),
                title: res.data.title || "Tugas Baru dari AI",
                isCompleted: false,
                priority: res.data.priority || 'medium',
                creatorId: user.id,
                targetDivisionId: res.data.division || user.division,
                timestamp: Date.now()
            }, user.id);
            setResult("✅ Berhasil membuat tugas otomatis.");
        } else {
            setResult(typeof res === 'string' ? res : JSON.stringify(res));
        }
        
        setIsProcessing(false);
        setQuery('');
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end pointer-events-none">
            {isOpen && (
                <div className="pointer-events-auto bg-[#020617]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.2)] rounded-[2rem] w-96 mb-4 overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col">
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl animate-pulse"><Icon name="Zap" size={20} /></div>
                            <div>
                                <h3 className="font-black text-xs tracking-[0.2em] uppercase text-white">OG-Intelligence</h3>
                                <p className="text-[10px] text-white/60 font-bold">Operational Support Active</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-all text-white"><Icon name="X" size={20} /></button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                             <textarea 
                                className="w-full bg-transparent text-sm text-slate-300 outline-none resize-none h-24 font-medium placeholder-slate-600"
                                placeholder="Paste instruksi, chat WA, atau tanya data..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                             />
                        </div>

                        {result && (
                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium animate-fade-in">
                                {result}
                            </div>
                        )}

                        <button 
                            onClick={handleIngest}
                            disabled={isProcessing || !query.trim()}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isProcessing ? <Icon name="Loader2" className="animate-spin" /> : <Icon name="Zap" />}
                            Execute Operation
                        </button>
                    </div>
                </div>
            )}
            
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`pointer-events-auto w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all ring-8 ring-slate-950/50 ${isOpen ? 'bg-slate-800' : 'bg-gradient-to-br from-indigo-600 to-purple-600'}`}
            >
                <Icon name={isOpen ? "X" : "Zap"} size={28} />
            </button>
        </div>
    );
};
