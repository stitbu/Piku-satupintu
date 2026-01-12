
import React from 'react';
import { Icon } from '../../components/Icon';
import { CompanyCode } from '../../types/schema';

// Local interface for leads in this view
export interface MarketingLead {
    id: string;
    name: string;
    phone: string;
    source: string;
    status: 'NEW' | 'FOLLOW_UP' | 'CLOSING';
    notes?: string;
    date: string;
}

interface LeadKanbanProps {
    company: CompanyCode;
    leads: MarketingLead[];
    onMoveLead: (leadId: string, newStatus: MarketingLead['status']) => void;
    onConvertToStudent: (lead: MarketingLead) => void;
}

export const LeadKanban: React.FC<LeadKanbanProps> = ({ company, leads, onMoveLead, onConvertToStudent }) => {
    
    const theme = company === 'PK' 
        ? { header: 'bg-pk-500', sub: 'bg-pk-500/10 text-pk-400', border: 'hover:border-pk-500/50' }
        : { header: 'bg-ks-500', sub: 'bg-ks-500/10 text-ks-400', border: 'hover:border-ks-500/50' };

    const columns: { id: MarketingLead['status']; label: string; icon: string }[] = [
        { id: 'NEW', label: 'New Leads', icon: 'Inbox' },
        { id: 'FOLLOW_UP', label: 'Follow Up', icon: 'MessageCircle' },
        { id: 'CLOSING', label: 'Closing / Deal', icon: 'CheckCircle' },
    ];

    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {columns.map(col => {
                const colLeads = leads.filter(l => l.status === col.id);
                
                return (
                    <div key={col.id} className="min-w-[320px] w-[320px] flex flex-col bg-white/5 border border-white/5 rounded-2xl h-[600px]">
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 rounded-t-2xl">
                            <div className="flex items-center gap-2 font-bold text-gray-200">
                                <Icon name={col.icon} size={16} className={col.id === 'CLOSING' ? 'text-emerald-400' : 'text-gray-400'} />
                                {col.label}
                            </div>
                            <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs font-mono text-gray-400">
                                {colLeads.length}
                            </span>
                        </div>

                        {/* Drop Zone / List */}
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                            {colLeads.length === 0 && (
                                <div className="text-center py-10 opacity-30">
                                    <Icon name="Ghost" size={32} className="mx-auto mb-2"/>
                                    <p className="text-xs">No leads here</p>
                                </div>
                            )}
                            
                            {colLeads.map(lead => (
                                <div key={lead.id} className={`bg-[#1e293b]/50 p-4 rounded-xl border border-white/5 transition-all group ${theme.border}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                                        <span className="text-[10px] text-gray-500 bg-black/30 px-1.5 py-0.5 rounded border border-white/5">{lead.source}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                        <Icon name="Phone" size={10} /> {lead.phone}
                                    </div>

                                    {lead.notes && (
                                        <p className="text-[10px] text-gray-500 italic mb-3 bg-black/20 p-1.5 rounded">
                                            "{lead.notes}"
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-auto">
                                        {col.id === 'NEW' && (
                                            <button onClick={() => onMoveLead(lead.id, 'FOLLOW_UP')} className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-300">
                                                Next: Follow Up
                                            </button>
                                        )}
                                        {col.id === 'FOLLOW_UP' && (
                                            <button onClick={() => onMoveLead(lead.id, 'CLOSING')} className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg text-[10px] font-bold">
                                                Mark Closing
                                            </button>
                                        )}
                                        {col.id === 'CLOSING' && (
                                            <button 
                                                onClick={() => onConvertToStudent(lead)} 
                                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                                            >
                                                <Icon name="UserPlus" size={14} />
                                                Convert to Student
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
