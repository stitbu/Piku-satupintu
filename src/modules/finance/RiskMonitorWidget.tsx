
import React, { useState } from 'react';
import { Icon } from '../../components/Icon';
import { GeminiService } from '../../services/geminiService';

interface RiskMonitorProps {
    accounts: any[];
}

export const RiskMonitorWidget: React.FC<RiskMonitorProps> = ({ accounts }) => {
    const criticalAccounts = [...accounts].sort((a, b) => b.billing.late_level - a.billing.late_level);
    const [strategy, setStrategy] = useState<{ id: string; content: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGetStrategy = async (acc: any) => {
        setIsLoading(true);
        setStrategy({ id: acc.id, content: 'Analyzing with AI...' });
        const res = await GeminiService.suggestRecoveryStrategy(acc.full_name, acc.billing.remaining_balance, acc.billing.late_level);
        setStrategy({ id: acc.id, content: res });
        setIsLoading(false);
    };

    return (
        <div className="bg-[#020617] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-red-500/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-xl text-red-400 animate-pulse"><Icon name="Siren" size={20} /></div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white">Risk Intelligence</h3>
                </div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    {criticalAccounts.filter(a => a.billing.late_level >= 4).length} ALERTS
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {criticalAccounts.map((acc) => (
                    <div key={acc.id} className="space-y-3">
                        <div className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${acc.billing.late_level === 5 ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-pk-400 transition-colors">{acc.full_name}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{acc.billing.invoice_number}</p>
                                </div>
                                <button 
                                    onClick={() => handleGetStrategy(acc)}
                                    className="px-3 py-1.5 bg-pk-500/10 text-pk-400 border border-pk-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pk-500 hover:text-slate-950 transition-all flex items-center gap-2"
                                >
                                    <Icon name="Zap" size={12}/> AI Strategy
                                </button>
                            </div>

                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sisa Tagihan</p>
                                    <p className="text-xl font-black text-white font-mono">Rp {new Intl.NumberFormat('id-ID').format(acc.billing.remaining_balance)}</p>
                                </div>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(l => <div key={l} className={`w-1 h-6 rounded-full ${l <= acc.billing.late_level ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`} />)}
                                </div>
                            </div>
                        </div>

                        {strategy && strategy.id === acc.id && (
                            <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-[1.5rem] animate-slide-up">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">AI Recommended Steps</span>
                                    <button onClick={() => setStrategy(null)}><Icon name="X" size={12}/></button>
                                </div>
                                <p className="text-xs text-indigo-100 leading-relaxed italic">"{strategy.content}"</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
