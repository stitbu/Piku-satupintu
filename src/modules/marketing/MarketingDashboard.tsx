
import React, { useState } from 'react';
import { CompanyCode } from '../../types/schema';
import { AdsTrackerWidget } from './AdsTrackerWidget';
import { Icon } from '../../components/Icon';
import { GeminiService } from '../../services/geminiService';

export interface MarketingLead {
    id: string;
    name: string;
    phone: string;
    source: string;
    status: 'NEW' | 'FOLLOW_UP' | 'CLOSING';
    notes?: string;
    date: string;
    hotScore?: number;
    scoreReason?: string;
}

export const MarketingDashboard: React.FC = () => {
    const [activeCompany, setActiveCompany] = useState<CompanyCode>('PK');
    const [leads, setLeads] = useState<MarketingLead[]>([
        { id: 'l1', name: 'Budi Santoso', phone: '08123456789', source: 'FB Ads', status: 'NEW', date: '2023-10-25', hotScore: 85 },
        { id: 'l2', name: 'Siti Aminah', phone: '08567890123', source: 'Instagram', status: 'FOLLOW_UP', notes: 'Minat kelas karyawan', date: '2023-10-24', hotScore: 40 },
        { id: 'l3', name: 'Ahmad Rizky', phone: '08111222333', source: 'Referral', status: 'CLOSING', notes: 'Tinggal bayar pendaftaran', date: '2023-10-23', hotScore: 95 },
    ]);

    const [aiDraft, setAiDraft] = useState<{ isOpen: boolean; content: string; leadName: string }>({ isOpen: false, content: '', leadName: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleMoveLead = (id: string, status: MarketingLead['status']) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    };

    const handleGenerateAIDraft = async (lead: MarketingLead) => {
        setAiDraft({ isOpen: true, content: '', leadName: lead.name });
        setIsGenerating(true);
        const draft = await GeminiService.generateMarketingDraft(lead.name, lead.source, lead.notes || 'No notes');
        setAiDraft(prev => ({ ...prev, content: draft }));
        setIsGenerating(false);
    };

    const isPK = activeCompany === 'PK';
    const accentColor = isPK ? 'text-pk-400' : 'text-ks-400';
    const btnAccent = isPK ? 'bg-pk-500 hover:bg-pk-400 shadow-pk-900/40' : 'bg-ks-500 hover:bg-ks-400 shadow-ks-900/40';

    return (
        <div className="flex flex-col h-full gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                        <Icon name="Target" className={accentColor} size={40} />
                        Lead Intelligence
                    </h1>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mt-2">Marketing Acquisition Engine V3.0</p>
                </div>

                <div className="bg-slate-900 p-2 rounded-3xl border border-white/10 flex gap-2 shadow-2xl">
                    <button onClick={() => setActiveCompany('PK')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isPK ? 'bg-pk-500 text-slate-950 shadow-[0_0_25px_rgba(14,165,233,0.5)] scale-105' : 'text-slate-500 hover:text-white'}`}>Pintu Kuliah</button>
                    <button onClick={() => setActiveCompany('KS')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!isPK ? 'bg-ks-500 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-105' : 'text-slate-500 hover:text-white'}`}>Kunci Sarjana</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <AdsTrackerWidget company={activeCompany} />
                </div>
                <div className="lg:col-span-2 grid grid-cols-3 gap-6">
                    <SummaryCard icon="Inbox" label="Incoming" value={leads.filter(l => l.status === 'NEW').length} color={accentColor} />
                    <SummaryCard icon="Zap" label="Hot Potential" value={leads.filter(l => (l.hotScore || 0) >= 80).length} color="text-orange-500" />
                    <SummaryCard icon="CheckCircle" label="Closed Deals" value={leads.filter(l => l.status === 'CLOSING').length} color="text-emerald-500" />
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <div className="flex gap-8 h-full overflow-x-auto pb-10 custom-scrollbar">
                    {['NEW', 'FOLLOW_UP', 'CLOSING'].map((status) => (
                        <div key={status} className="min-w-[380px] flex flex-col bg-slate-900/40 border border-white/5 rounded-[3rem] h-[650px] shadow-2xl relative">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40 rounded-t-[3rem]">
                                <span className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">{status.replace('_', ' ')}</span>
                                <span className="bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-300 border border-white/10 shadow-inner">
                                    {leads.filter(l => l.status === status).length}
                                </span>
                            </div>
                            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                {leads.filter(l => l.status === status).map(lead => (
                                    <div key={lead.id} className="bg-slate-800 border border-white/10 p-8 rounded-[2.5rem] group hover:border-pk-500/40 hover:bg-slate-800/80 transition-all shadow-2xl relative overflow-hidden">
                                        {lead.hotScore && (
                                            <div className="absolute top-0 right-0 p-2">
                                                <div className={`px-4 py-1.5 rounded-bl-3xl text-[11px] font-black uppercase tracking-tighter flex items-center gap-2 ${lead.hotScore >= 80 ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400'}`}>
                                                    <Icon name="Flame" size={12} />
                                                    {lead.hotScore}%
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <h4 className="font-black text-white text-xl tracking-tight">{lead.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">{lead.source} • {lead.date}</p>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-slate-300 mb-8 bg-black/60 p-4 rounded-2xl border border-white/5 shadow-inner">
                                            <Icon name="Phone" size={14} className="text-emerald-500" />
                                            <span className="font-mono font-bold tracking-wider">{lead.phone}</span>
                                        </div>

                                        <div className="flex gap-3">
                                            {status !== 'CLOSING' && (
                                                <button 
                                                    onClick={() => handleMoveLead(lead.id, status === 'NEW' ? 'FOLLOW_UP' : 'CLOSING')}
                                                    className={`flex-1 py-4 ${btnAccent} text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95 group-hover:scale-[1.02]`}
                                                >
                                                    Move to {status === 'NEW' ? 'F-Up' : 'Closing'}
                                                </button>
                                            )}
                                            {status === 'CLOSING' && (
                                                <button 
                                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-900/40"
                                                >
                                                    Process to Admin
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleGenerateAIDraft(lead)}
                                                className="p-4 bg-white/10 hover:bg-pk-500 text-pk-400 hover:text-slate-950 rounded-2xl transition-all shadow-lg hover:scale-110 active:scale-90 border border-white/5"
                                                title="AI WhatsApp Draft"
                                            >
                                                <Icon name="Zap" size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* AI Draft Modal */}
            {aiDraft.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-[scaleIn_0.3s]">
                        <div className="p-8 bg-gradient-to-br from-pk-600 to-indigo-700 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl animate-pulse"><Icon name="Zap" size={24}/></div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">AI Lead Draft</h3>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Target: {aiDraft.leadName}</p>
                                </div>
                            </div>
                            <button onClick={() => setAiDraft({ ...aiDraft, isOpen: false })} className="hover:bg-white/10 p-2 rounded-full transition-all"><Icon name="X" size={24}/></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-black/40 border border-white/5 p-8 rounded-[2rem] min-h-[300px] relative">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                                        <Icon name="Loader2" className="animate-spin" size={40} />
                                        <p className="text-xs font-black uppercase tracking-[0.3em]">AI Copywriter Working...</p>
                                    </div>
                                ) : (
                                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium h-[300px] overflow-y-auto custom-scrollbar pr-4">
                                        {aiDraft.content}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 py-4 bg-pk-500 text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-pk-400 transition-all flex items-center justify-center gap-3">
                                    <Icon name="Copy" size={18}/> Copy Message
                                </button>
                                <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-3">
                                    <Icon name="MessageCircle" size={18}/> Open WA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SummaryCard = ({ icon, label, value, color }: any) => (
    <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-center hover:border-pk-500/30 transition-all group shadow-xl">
        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${color} shadow-inner group-hover:scale-110 transition-transform`}><Icon name={icon} size={30} /></div>
        <span className="text-5xl font-black text-white tracking-tighter mb-2 italic">{value}</span>
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em]">{label}</span>
    </div>
);
