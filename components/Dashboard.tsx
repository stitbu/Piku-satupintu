
import React, { useState } from 'react';
import { Tool, User, DivisionData, Announcement, Task, TaskPriority } from '../types';
import { Icon } from './Icon';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  tools: Tool[];
  user: User;
  handleToolClick: (tool: Tool) => void;
  onOpenAttendance: () => void;
  onOpenProfile: () => void;
  dashboardDivisions: DivisionData[];
  tasks: Task[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    tools, user, handleToolClick, onOpenAttendance, onOpenProfile, dashboardDivisions, tasks 
}) => {
    const navigate = useNavigate();
    const [expandedDiv, setExpandedDiv] = useState<string | null>('Direksi');

    // Filter divisions to match image order
    const displayOrder = ['Direksi', 'Marketing', 'Administrasi', 'Keuangan'];
    const filteredDivisions = displayOrder.map(name => 
        dashboardDivisions.find(d => d.name === name)
    ).filter(Boolean) as DivisionData[];

    return (
        <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950 pb-28">
            
            {/* 1. TOP HEADER */}
            <header className="px-5 py-5 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/40">
                        <Icon name="GraduationCap" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">Pintu Kuliah</h1>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1">ONE-GATE SYSTEM</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 rounded-full">
                        <Icon name="Bell" size={22} />
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-md">3</div>
                    </button>
                    <button onClick={onOpenProfile} className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-black text-sm shadow-xl border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform">
                        {user.name.charAt(0)}
                    </button>
                </div>
            </header>

            {/* 2. PENTING ALERT BAR */}
            <div className="bg-brand-600 px-5 py-3 flex items-center justify-between text-white shadow-inner">
                <div className="flex items-center gap-3">
                    <span className="bg-white text-brand-700 text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase">PENTING</span>
                    <p className="text-xs font-bold flex items-center gap-2 truncate">
                        <Icon name="AlertTriangle" size={14} className="text-yellow-300" />
                        Batas akhir pendaftaran: 30 Okt
                    </p>
                </div>
                <button className="p-1 hover:bg-white/20 rounded-lg transition-colors"><Icon name="X" size={18} /></button>
            </div>

            {/* 3. SEARCH BAR */}
            <div className="px-5 py-8">
                <div className="relative group max-w-2xl mx-auto">
                    <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari alat, SOP, atau orang..." 
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-3xl text-sm shadow-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder-slate-400 font-medium" 
                    />
                </div>
            </div>

            {/* 4. QUICK ACTIONS GRID */}
            <div className="px-5 grid grid-cols-4 gap-4 mb-10">
                <QuickActionButton icon="Fingerprint" label="Absensi" color="text-purple-600" bg="bg-purple-100" onClick={onOpenAttendance} />
                <QuickActionButton icon="MessageSquare" label="Pesan" color="text-brand-600" bg="bg-brand-100" badge={3} onClick={() => navigate('/messages')} />
                <QuickActionButton icon="ClipboardList" label="Tugas" color="text-amber-600" bg="bg-amber-100" onClick={() => {}} />
                <QuickActionButton icon="User" label="Profil" color="text-emerald-600" bg="bg-emerald-100" onClick={onOpenProfile} />
            </div>

            {/* 5. WORKSPACE STATUS CARD */}
            <div className="px-5 mb-10">
                <div className="bg-[#0f172a] dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Icon name="Activity" size={140} className="text-brand-500" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">WORKSPACE PULSE</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-5xl font-black text-white tracking-tighter">{tools.length} Alat</span>
                            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border-2 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
                                ONLINE
                            </span>
                        </div>
                        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Divisi Aktif</span>
                            <div className="flex -space-x-3">
                                {['MK', 'IT', 'HR'].map((initial, i) => (
                                    <div key={i} className={`w-9 h-9 rounded-full border-4 border-[#0f172a] flex items-center justify-center text-[10px] font-black text-white shadow-xl ${['bg-blue-600', 'bg-purple-600', 'bg-orange-600'][i]}`}>
                                        {initial}
                                    </div>
                                ))}
                                <div className="w-9 h-9 rounded-full border-4 border-[#0f172a] bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-300 shadow-xl">+5</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. DIVISION FOLDERS */}
            <div className="px-5 space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight uppercase italic">Folder Divisi</h3>
                    <button className="text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest hover:underline">Lihat Semua</button>
                </div>

                <div className="space-y-4">
                    {filteredDivisions.map(div => {
                        const isExpanded = expandedDiv === div.name;
                        const divTools = tools.filter(t => t.divisionId === div.id);
                        
                        return (
                            <div key={div.id} className={`bg-white dark:bg-slate-900 rounded-[2rem] border-2 transition-all duration-300 ${isExpanded ? 'border-brand-500/20 shadow-2xl scale-[1.01]' : 'border-slate-100 dark:border-white/5 shadow-md'}`}>
                                <button 
                                    onClick={() => setExpandedDiv(isExpanded ? null : div.name)}
                                    className="w-full flex items-center justify-between p-5"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-3.5 rounded-2xl ${getDivisionColor(div.name)} shadow-inner border border-white/50 dark:border-transparent`}>
                                            <Icon name={div.icon} size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight">{div.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{divTools.length} Resources</p>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-brand-600 text-white rotate-180 shadow-lg' : 'bg-slate-100 text-slate-400 dark:bg-white/5'}`}>
                                        <Icon name="ChevronDown" size={20} />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-5 pb-5 animate-slide-up">
                                        <div className="pt-4 grid grid-cols-1 gap-2 border-t border-slate-50 dark:border-white/5">
                                            {divTools.map(tool => (
                                                <button 
                                                    key={tool.id} 
                                                    onClick={() => handleToolClick(tool)}
                                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-500/10 group transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl ${tool.color || 'bg-slate-200'} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                                            <Icon name={tool.icon || 'Link'} size={18} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-brand-400">{tool.name}</span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-brand-600 transition-colors">
                                                        <Icon name="ChevronRight" size={18} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const QuickActionButton: React.FC<{ icon: string; label: string; color: string; bg: string; badge?: number; onClick: () => void }> = ({ icon, label, color, bg, badge, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group">
        <div className={`w-16 h-16 rounded-[1.5rem] ${bg} dark:bg-slate-800 flex items-center justify-center ${color} shadow-lg border-2 border-white dark:border-white/5 group-active:scale-90 transition-all relative`}>
            <Icon name={icon} size={32} className="group-hover:scale-110 transition-transform" />
            {badge && (
                <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center shadow-lg">
                    {badge}
                </div>
            )}
        </div>
        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight group-hover:text-brand-600 transition-colors">{label}</span>
    </button>
);

const getDivisionColor = (name: string) => {
    switch(name) {
        case 'Direksi': return 'bg-purple-100 text-purple-700';
        case 'Marketing': return 'bg-blue-100 text-blue-700';
        case 'Administrasi': return 'bg-amber-100 text-amber-700';
        case 'Keuangan': return 'bg-emerald-100 text-emerald-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};
