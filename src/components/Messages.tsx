
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, ChatMessage, ChatGroup, TaskPriority } from '../types';
import { Icon } from './Icon';
import { StorageService } from '../services/storageService';
import { DIVISIONS } from '../constants';
import { GeminiService } from '../services/geminiService';
import { UnifiedDataService } from '../services/UnifiedDataService';

interface MessagesProps {
  user: User;
  messages: ChatMessage[];
  onSendMessage: (content: string, channelId: string) => void;
  groups: ChatGroup[];
  onCreateGroup: (name: string, members: string[]) => void;
}

export const Messages: React.FC<MessagesProps> = ({ user, messages, onSendMessage, groups, onCreateGroup }) => {
  const [activeChannelId, setActiveChannelId] = useState<string>('GENERAL');
  const [msgInput, setMsgInput] = useState('');
  
  // AI States
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const allUsers = StorageService.getUsers();
  const currentMessages = messages.filter(m => m.channelId === activeChannelId);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages.length, activeChannelId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    onSendMessage(msgInput, activeChannelId);
    setMsgInput('');
  };

  const handleSummarize = async () => {
    if (currentMessages.length === 0) return;
    setIsSummarizing(true);
    const res = await GeminiService.summarizeChat(currentMessages);
    setSummary(res);
    setIsSummarizing(false);
  };

  const handleExtractTask = async (msg: ChatMessage) => {
      const loadingToast = alert("AI sedang mengekstrak tugas...");
      const result = await GeminiService.extractTaskFromMessage(msg.content);
      if (result && result.title) {
          await UnifiedDataService.addTask({
              id: crypto.randomUUID(),
              title: result.title,
              isCompleted: false,
              priority: result.priority || 'medium',
              creatorId: user.id,
              targetDivisionId: user.division,
              timestamp: Date.now()
          }, user.id);
          alert(`✅ Tugas Baru Dibuat: ${result.title}`);
      }
  };

  const getChannelName = (id: string) => {
      if (id === 'GENERAL') return 'GLOBAL DISPATCH';
      const division = DIVISIONS.find(d => d.id === id);
      if (division) return division.name.toUpperCase();
      const group = groups.find(g => g.id === id);
      if (group) return group.name.toUpperCase();
      return "DIRECT CHANNEL";
  };

  return (
    <div className="flex h-full bg-[#020617] overflow-hidden">
      {/* CHANNEL LIST */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-black/20">
        <div className="p-8 border-b border-white/5">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Secure Comms</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">End-to-End Encrypted</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            {['GENERAL', ...DIVISIONS.map(d => d.id)].map(ch => (
                <button 
                    key={ch} 
                    onClick={() => setActiveChannelId(ch)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${activeChannelId === ch ? 'bg-pk-500 text-slate-950 font-black' : 'text-slate-500 hover:bg-white/5'}`}
                >
                    <Icon name={ch === 'GENERAL' ? 'Globe' : 'Hash'} size={18} />
                    <span className="text-xs uppercase tracking-widest">{ch === 'GENERAL' ? 'All Team' : ch}</span>
                </button>
            ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col relative">
        <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="font-black text-white text-sm tracking-widest uppercase">{getChannelName(activeChannelId)}</h3>
            </div>
            <button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="px-4 py-2 bg-pk-500/10 text-pk-400 border border-pk-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pk-500 hover:text-slate-950 transition-all flex items-center gap-2"
            >
                {isSummarizing ? <Icon name="Loader2" className="animate-spin" size={14}/> : <Icon name="Sparkles" size={14} />}
                Summarize Channel
            </button>
        </div>

        {summary && (
            <div className="p-6 bg-pk-600/10 border-b border-pk-500/20 animate-slide-up relative">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[10px] font-black text-pk-400 uppercase tracking-widest flex items-center gap-2"><Icon name="Sparkles" size={12}/> AI Discussion Summary</h4>
                    <button onClick={() => setSummary(null)} className="text-pk-400 hover:text-white"><Icon name="X" size={14}/></button>
                </div>
                <p className="text-xs text-pk-100 italic leading-relaxed">{summary}</p>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
             {currentMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'} group`}>
                    <div className="flex items-center gap-3 mb-1 px-1">
                        {msg.senderId !== user.id && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{msg.senderName}</span>}
                        <span className="text-[9px] text-slate-700">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="relative">
                        <div className={`max-w-[500px] p-4 rounded-3xl text-sm leading-relaxed ${msg.senderId === user.id ? 'bg-pk-600 text-white rounded-tr-sm shadow-xl shadow-pk-600/20' : 'bg-slate-900 text-slate-300 border border-white/5 rounded-tl-sm'}`}>
                            {msg.content}
                        </div>
                        {msg.senderId !== user.id && (
                            <button 
                                onClick={() => handleExtractTask(msg)}
                                title="Extract Task with AI"
                                className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-indigo-500/20 text-indigo-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-500 hover:text-white"
                            >
                                <Icon name="PlusCircle" size={16} />
                            </button>
                        )}
                    </div>
                </div>
             ))}
             <div ref={chatEndRef} />
        </div>

        <div className="p-8 border-t border-white/5 bg-black/40">
            <form onSubmit={handleSend} className="flex gap-4 max-w-5xl mx-auto">
                <input 
                    className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-pk-500 transition-all font-medium"
                    placeholder="Type message..."
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                />
                <button type="submit" disabled={!msgInput.trim()} className="px-8 bg-pk-500 hover:bg-pk-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-pk-500/20 active:scale-95"><Icon name="Send" /></button>
            </form>
        </div>
      </div>
    </div>
  );
};
