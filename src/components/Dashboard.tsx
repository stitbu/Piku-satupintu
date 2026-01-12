
import React, { useState } from 'react';
import { Tool, User, DivisionData, Task } from '../types';
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

    // Filter divisions
    const displayOrder = ['Direksi', 'Marketing', 'Administrasi', 'Keuangan'];
    const filteredDivisions = displayOrder.map(name => 
        dashboardDivisions.find(d => d.name === name)
    ).filter(Boolean) as DivisionData[];

    return (
        <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950 pb-28">
            
            {/* 1. TOP HEADER */}
            <header className="px-6 py-6 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 shadow-sm/50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Icon name="GraduationCap" size={26} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Pintu Kuliah</h1>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1.5">ONE-GATE SYSTEM</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 rounded-full hover:bg-blue-50">
                        <Icon name="Bell" size={22} />
                        <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm">3</div>
                    </button>
                    <button onClick={onOpenProfile} className="w-11 h-11 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white dark:border-slate-800 hover:scale-105 transition-transform">
                        {user.name.charAt(0)}
                    </button>
                </div>
            </header>

            {/* 2. PENTING ALERT BAR */}
            <div className="bg-slate-900 px-6 py-3 flex items-center justify-between text-white shadow-md border-b border-white/10">
                <div className="flex items-center gap-3">
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">URGENT</span>
                    <p className="text-xs font-bold flex items-center gap-2 truncate text-slate-200">
                        <Icon name="AlertTriangle" size={14} className="text-yellow-400" />
                        Batas akhir pendaftaran: 30 Okt 2023
                    </p>
                </div>
                <button className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><Icon name="X" size={16} /></button>
            </div>

            {/* 3. SEARCH BAR */}
            <div className="px-6 py-8">
                <div className="relative group max-w-3xl mx-auto">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Icon name="Search" size={22} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Cari alat, SOP, atau orang..." 
                        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/5 rounded-2xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-slate-400" 
                    />
                </div>
            </div>

            {/* 4. QUICK ACTIONS GRID (Fokus pada Tombol Pesan) */}
            <div className="px-6 grid grid-cols-4 gap-4 mb-10 max-w-5xl mx-auto w-full">
                <QuickActionButton icon="Fingerprint" label="Absensi" color="text-slate-700" bg="bg-white border-slate-200" onClick={onOpenAttendance} />
                
                {/* HIGHLIGHTED MESSAGE BUTTON */}
                <button onClick={() => navigate('/messages')} className="col-span-1 flex flex-col items-center gap-2 group">
                    <div className="w-full aspect-square max-w-[5.5rem] rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 border-2 border-white dark:border-slate-800 group-active:scale-95 transition-all relative overflow-hidden group-hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Icon name="MessageSquare" size={32} className="relative z-10 drop-shadow-sm" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center shadow-sm animate-pulse">3</div>
                    </div>
                    <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wide group-hover:text-blue-800">Pesan</span>
                </button>

                <QuickActionButton icon="ClipboardList" label="Tugas" color="text-slate-700" bg="bg-white border-slate-200" onClick={() => {}} />
                <QuickActionButton icon="User" label="Profil" color="text-slate-700" bg="bg-white border-slate-200" onClick={onOpenProfile} />
            </div>

            {/* 5. WORKSPACE STATUS CARD */}
            <div className="px-6 mb-10 max-w-5xl mx-auto w-full">
                <div className="bg-[#0f172a] dark:bg-black rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group border border-slate-800">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue-900/20 to-transparent opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">SYSTEM STATUS</h2>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-black text-white tracking-tighter">{tools.length}</span>
                            <span className="text-lg font-medium text-slate-400">Apps Active</span>
                        </div>
                        <div className="mt-8 flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">75% Load</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. DIVISION FOLDERS */}
            <div className="px-6 space-y-6 max-w-5xl mx-auto w-full">
                <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight uppercase border-l-4 border-blue-600 pl-3">Akses Divisi</h3>

                <div className="grid grid-cols-1 gap-4">
                    {filteredDivisions.map(div => {
                        const isExpanded = expandedDiv === div.name;
                        const divTools = tools.filter(t => t.divisionId === div.id);
                        
                        return (
                            <div key={div.id} className={`bg-white dark:bg-slate-900 rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-500 shadow-xl ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-white/5 shadow-sm'}`}>
                                <button 
                                    onClick={() => setExpandedDiv(isExpanded ? null : div.name)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${getDivisionColor(div.name)}`}>
                                            <Icon name={div.icon} size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{div.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{divTools.length} Aplikasi</p>
                                        </div>
                                    </div>
                                    <Icon name="ChevronDown" size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                                </button>

                                {isExpanded && (
                                    <div className="px-5 pb-5 pt-0 animate-slide-up">
                                        <div className="h-px bg-slate-100 dark:bg-white/5 mb-4"></div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {divTools.map(tool => (
                                                <button 
                                                    key={tool.id} 
                                                    onClick={() => handleToolClick(tool)}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-black/20 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-slate-100 dark:border-white/5 hover:border-blue-200 transition-all group text-left"
                                                >
                                                    <div className={`w-8 h-8 rounded-lg ${tool.color || 'bg-slate-400'} flex items-center justify-center text-white text-xs shadow-sm`}>
                                                        <Icon name={tool.icon || 'Link'} size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 line-clamp-1">{tool.name}</span>
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

// Default button for less important actions
const QuickActionButton: React.FC<{ icon: string; label: string; color: string; bg: string; onClick: () => void }> = ({ icon, label, color, bg, onClick }) => (
    <button onClick={onClick} className="col-span-1 flex flex-col items-center gap-2 group">
        <div className={`w-full aspect-square max-w-[5.5rem] rounded-[1.5rem] ${bg} border-2 flex items-center justify-center ${color} shadow-sm group-hover:shadow-md group-active:scale-95 transition-all`}>
            <Icon name={icon} size={28} className="group-hover:scale-110 transition-transform opacity-80 group-hover:opacity-100" />
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide group-hover:text-slate-900">{label}</span>
    </button>
);

const getDivisionColor = (name: string) => {
    switch(name) {
        case 'Direksi': return 'bg-purple-600';
        case 'Marketing': return 'bg-blue-600';
        case 'Administrasi': return 'bg-orange-500';
        case 'Keuangan': return 'bg-emerald-600';
        default: return 'bg-slate-600';
    }
};
