
import React, { useState, useEffect } from 'react';
import { UnifiedDataService } from '../services/UnifiedDataService';
import { Icon } from './Icon';

export const AuditLogsView: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await UnifiedDataService.getSystemActivity();
            setLogs(data);
            setIsLoading(false);
        };
        fetchLogs();
    }, []);

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'text-red-400';
        if (action.includes('CREATE')) return 'text-emerald-400';
        if (action.includes('UPDATE')) return 'text-pk-400';
        return 'text-slate-400';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Audit Center</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">System Traceability & Security Logs</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all">Export CSV</button>
                    <button onClick={() => window.location.reload()} className="p-2 bg-pk-500 text-slate-950 rounded-xl hover:bg-pk-400 transition-all"><Icon name="RefreshCw" size={20}/></button>
                </div>
            </div>

            <div className="bg-[#020617] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 bg-white/5 border-b border-white/5 flex gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Monitoring</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Database: Connected</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-6">Timestamp</th>
                                <th className="p-6">User Identity</th>
                                <th className="p-6">Action Event</th>
                                <th className="p-6">Object Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-20 text-center text-slate-600 uppercase font-black tracking-widest">Accessing Secure Logs...</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6 text-slate-500">{new Date(log.created_at || log.timestamp).toLocaleString()}</td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-bold uppercase">{log.user_id?.substring(0,2) || 'SYS'}</div>
                                            <span className="text-slate-300 font-bold">{log.users?.full_name || log.user_id || 'System Process'}</span>
                                        </div>
                                    </td>
                                    <td className={`p-6 font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </td>
                                    <td className="p-6 text-slate-500 truncate max-w-[200px]">
                                        {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
