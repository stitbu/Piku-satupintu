
import React from 'react';
import { Icon } from './Icon';

interface MorningBriefProps {
    isOpen: boolean;
    content: string;
    onClose: () => void;
}

export const MorningBrief: React.FC<MorningBriefProps> = ({ isOpen, content, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
            <div className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-[scaleIn_0.3s_ease-out] border-t-pk-500/50">
                <div className="p-10 bg-gradient-to-br from-slate-900 to-black text-white relative overflow-hidden border-b border-white/5">
                    <div className="absolute -right-20 -top-20 p-40 bg-pk-500/10 rounded-full blur-[100px]"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-pk-500 rounded-2xl shadow-lg shadow-pk-500/40 text-slate-950">
                                <Icon name="Sparkles" size={24} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500">Executive Daily Report</span>
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Operational Intelligence</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10">
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 min-h-[350px] relative">
                         <div className="absolute top-6 right-8 opacity-10"><Icon name="Quote" size={60} /></div>
                         <div className="relative z-10">
                            {content ? (
                                <div className="text-slate-200 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                                    {content}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-600">
                                    <Icon name="Loader2" className="animate-spin" size={48} />
                                    <p className="font-bold uppercase tracking-[0.3em] text-[10px]">Assembling Data Streams...</p>
                                </div>
                            )}
                         </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                         <button 
                            onClick={onClose}
                            className="flex-1 py-5 bg-pk-500 text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-pk-500/20"
                        >
                            Execute Today's Plan
                        </button>
                    </div>
                </div>
                
                <div className="px-10 py-6 bg-black/40 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5">
                    <span>PK-SYSTEM V3.5 CORE</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> AI Engine Online</span>
                </div>
            </div>
        </div>
    );
};
