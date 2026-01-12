
import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/Icon';
import { CompanyCode } from '../../types/schema';

interface AdsTrackerWidgetProps {
    company: CompanyCode;
}

export const AdsTrackerWidget: React.FC<AdsTrackerWidgetProps> = ({ company }) => {
    // State
    const [spend, setSpend] = useState<string>('');
    const [leads, setLeads] = useState<string>('');
    const [cpr, setCpr] = useState<number>(0);

    // Theme Config
    const theme = company === 'PK' 
        ? { text: 'text-pk-400', border: 'focus:border-pk-500', glow: 'shadow-pk-500/20' }
        : { text: 'text-ks-400', border: 'focus:border-ks-500', glow: 'shadow-ks-500/20' };

    useEffect(() => {
        const s = parseFloat(spend) || 0;
        const l = parseFloat(leads) || 0;
        if (l > 0) {
            setCpr(s / l);
        } else {
            setCpr(0);
        }
    }, [spend, leads]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const getCprStatus = (val: number) => {
        if (val === 0) return { color: 'text-gray-500', label: 'No Data' };
        if (val < 35000) return { color: 'text-emerald-400', label: 'Excellent', bg: 'bg-emerald-500/10 border-emerald-500/20' };
        if (val > 50000) return { color: 'text-red-400', label: 'Expensive', bg: 'bg-red-500/10 border-red-500/20' };
        return { color: 'text-yellow-400', label: 'Average', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    };

    const status = getCprStatus(cpr);

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 ${company === 'PK' ? 'bg-pk-500/10' : 'bg-ks-500/10'} blur-[50px] rounded-full group-hover:blur-[60px] transition-all`}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="Target" className={theme.text} />
                        Ads Performance
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Harian • {company === 'PK' ? 'Pintu Kuliah' : 'Kunci Sarjana'}</p>
                </div>
                {status.bg && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}>
                        {status.label}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Today's Spend</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Rp</span>
                        <input 
                            type="number" 
                            className={`w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-sm text-white outline-none ${theme.border} transition-colors`}
                            placeholder="0"
                            value={spend}
                            onChange={e => setSpend(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Total Leads</label>
                    <div className="relative">
                        <Icon name="Users" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="number" 
                            className={`w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white outline-none ${theme.border} transition-colors`}
                            placeholder="0"
                            value={leads}
                            onChange={e => setLeads(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Cost Per Result (CPR)</label>
                <div className={`text-3xl font-bold font-mono tracking-tight ${status.color}`}>
                    {formatCurrency(cpr)}
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${status.color.replace('text-', 'bg-')}`} 
                        style={{ width: `${Math.min((cpr / 60000) * 100, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[9px] text-gray-600 mt-1 font-mono">
                    <span>0</span>
                    <span>Target: 35k</span>
                    <span>Max: 50k</span>
                </div>
            </div>
        </div>
    );
};
