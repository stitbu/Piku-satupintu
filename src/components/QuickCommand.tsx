
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { Tool, User, DivisionData, Task } from '../types';

interface QuickCommandProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
  users: User[];
  divisions: DivisionData[];
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
}

export const QuickCommand: React.FC<QuickCommandProps> = ({ isOpen, onClose, tools, users, divisions, tasks, onTaskSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredItems = React.useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();

    const commands = [
        { label: 'Buka Dasbor Utama', action: () => navigate('/'), icon: 'LayoutGrid', category: 'Navigasi' },
        { label: 'Tulis Pesan Baru', action: () => navigate('/messages'), icon: 'MessageSquare', category: 'Navigasi' },
        { label: 'Pengaturan Sistem', action: () => navigate('/settings'), icon: 'Settings', category: 'Navigasi' },
    ].filter(c => c.label.toLowerCase().includes(lowerQuery));

    const resultDivs = divisions.filter(d => d.name.toLowerCase().includes(lowerQuery)).map(d => ({ type: 'DIVISION', data: d, category: 'Divisi' }));
    const resultTools = tools.filter(t => t.name.toLowerCase().includes(lowerQuery)).map(t => ({ type: 'TOOL', data: t, category: 'Alat Kerja' }));
    const resultTasks = tasks.filter(t => t.title.toLowerCase().includes(lowerQuery) && !t.isCompleted).map(t => ({ type: 'TASK', data: t, category: 'Tugas Aktif' }));
    const resultUsers = users.filter(u => u.name.toLowerCase().includes(lowerQuery)).map(u => ({ type: 'USER', data: u, category: 'Personel' }));

    return [...commands.map(c => ({ type: 'COMMAND', data: c, category: c.category })), ...resultDivs, ...resultTools, ...resultTasks, ...resultUsers].slice(0, 10);
  }, [query, tools, users, divisions, tasks, navigate]);

  const handleSelect = (item: any) => {
    if (!item) return;
    if (item.type === 'COMMAND') {
        item.data.action();
    } else if (item.type === 'DIVISION') {
        navigate(`/division/${item.data.id}`);
    } else if (item.type === 'TOOL') {
        if(item.data.url && item.data.url !== '#') window.open(item.data.url, '_blank');
    } else if (item.type === 'TASK') {
        onTaskSelect?.(item.data);
    } else if (item.type === 'USER') {
        navigate('/messages'); 
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-slate-950/80 backdrop-blur-md transition-all animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden animate-[scaleIn_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 px-8 py-6 border-b border-white/5 bg-white/5">
          <Icon name="Search" className="text-pk-400" size={28} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-xl font-bold tracking-tight"
            placeholder="Cari alat, orang, atau ketik perintah..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest shrink-0">
             ESC
          </div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
            {filteredItems.length === 0 && (
                <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon name="Search" size={40} className="text-slate-800" />
                    </div>
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">
                        {query ? 'Tidak ada hasil ditemukan' : 'Mulai mengetik untuk perintah cepat'}
                    </p>
                </div>
            )}
            
            {filteredItems.map((item, idx) => {
                const showCategory = idx === 0 || filteredItems[idx-1].category !== item.category;
                return (
                    <React.Fragment key={idx}>
                        {showCategory && (
                            <div className="px-6 pt-6 pb-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                                {item.category}
                            </div>
                        )}
                        <button
                            onClick={() => handleSelect(item)}
                            className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-5 transition-all ${idx === selectedIndex ? 'bg-pk-500 text-slate-950 shadow-xl shadow-pk-500/20 translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${idx === selectedIndex ? 'bg-white/20' : 'bg-slate-900 text-slate-500'}`}>
                                <Icon 
                                    name={
                                        item.type === 'COMMAND' ? (item.data as any).icon : 
                                        item.type === 'DIVISION' ? 'Briefcase' :
                                        item.type === 'TASK' ? 'CheckSquare' :
                                        item.type === 'USER' ? 'User' : 
                                        (item.data as Tool).icon || 'Link'
                                    } 
                                    size={20} 
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate tracking-wide ${idx === selectedIndex ? 'text-slate-950' : 'text-white'}`}>
                                    {item.type === 'COMMAND' ? (item.data as any).label : 
                                     item.type === 'TASK' ? (item.data as Task).title : 
                                     (item.data as any).name}
                                </p>
                                <p className={`text-[10px] mt-1 font-black uppercase tracking-widest ${idx === selectedIndex ? 'text-slate-950/60' : 'text-slate-600'}`}>
                                    {item.type} {item.type === 'TOOL' && `• ${(item.data as Tool).category}`} {item.type === 'USER' && `• ${(item.data as User).role}`}
                                </p>
                            </div>
                            {idx === selectedIndex && (
                                <Icon name="CornerDownLeft" size={16} className="opacity-40" />
                            )}
                        </button>
                    </React.Fragment>
                );
            })}
        </div>
        
        <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <div className="flex gap-6">
                <span className="flex items-center gap-2"><Icon name="ArrowDown" size={12} /> Navigasi</span>
                <span className="flex items-center gap-2"><Icon name="CornerDownLeft" size={12} /> Pilih</span>
            </div>
            <span>PK Unified Search Engine</span>
        </div>
      </div>
    </div>
  );
};
