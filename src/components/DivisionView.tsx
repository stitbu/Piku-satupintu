
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tool, User, DivisionType, Task, ToolCategory, UserRole, ChatMessage, TaskPriority } from '../types';
import { DIVISIONS } from '../constants';
import { Icon } from './Icon';
import { ToolCard } from './ToolCard';
import { WorkflowMap } from './WorkflowMap';
import { TaskBoard } from './TaskBoard';
import { translations, LanguageCode } from '../translations';
import { NotificationService } from '../services/notificationService';
import { StorageService } from '../services/storageService';
import { TaskDetailView } from './TaskDetailView'; 

interface DivisionViewProps {
  tools: Tool[];
  user: User;
  handleToolClick: (tool: Tool) => void;
  onContextMenu: (e: any, tool: Tool) => void;
  onSelect: (tool: Tool) => void;
  onAddTool: (divisionId: string) => void;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onOpenChat: (divisionId: string) => void;
  onOpenDivisionTasks: (divisionId: DivisionType) => void;
  lang: LanguageCode;
  tasks: Task[];
  onAddTask: (divId: DivisionType, title: string, priority: TaskPriority) => void;
  onToggleTask: (divId: DivisionType, taskId: string) => void;
  onDeleteTask: (divId: DivisionType, taskId: string) => void;
  onUpdateTask: (divId: DivisionType, taskId: string, updates: Partial<Task>) => void;
  messages: ChatMessage[];
  onSendMessage: (content: string, channelId: string) => void;
}

export const DivisionView: React.FC<DivisionViewProps> = ({ 
    tools, user, handleToolClick, onContextMenu, onSelect, onAddTool, isSelectionMode, selectedIds, 
    lang, tasks, onAddTask, onToggleTask, onDeleteTask, onUpdateTask, messages, onSendMessage 
}) => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate(); 
    
    const [searchTerm, setSearchTerm] = useState(''); 
    const [showMobileSidebar, setShowMobileSidebar] = useState(false); // Mobile state
    
    // Persistent Side Panel State
    const [activeSideTab, setActiveSideTab] = useState<'tasks' | 'chat'>('tasks');
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [selectedTask, setSelectedTask] = useState<(Task & { divName?: string, divIcon?: string, description?: string, divId?: string }) | null>(null);

    const prefs = StorageService.getPreferences();
    const t = translations[lang] || translations.en;

    // --- 1. ACCESS CONTROL LOGIC ---
    if (user.role !== UserRole.ADMIN && user.division !== id) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#020617] via-[#0f172a] to-[#172554]">
                <div className="bg-red-500/10 p-8 rounded-2xl border border-red-500/20 backdrop-blur-xl shadow-2xl max-w-md animate-[scaleIn_0.3s_ease-out]">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon name="ShieldAlert" size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Maaf, Anda tidak memiliki izin untuk mengakses area <strong>{DIVISIONS.find(d => d.id === id)?.name || id}</strong>.
                    </p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all border border-white/5 shadow-lg flex items-center justify-center gap-2 w-full"
                    >
                        <Icon name="ArrowLeft" size={18} /> Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const division = DIVISIONS.find(d => d.id === id); 
    if (!division) return <div className="p-10 text-white text-center pt-20">{t.division.notFound}</div>;

    const canAddTool = user.role === UserRole.ADMIN || (user.role === UserRole.MANAGER && user.division === id);

    // Scroll chat to bottom
    useEffect(() => {
        if (activeSideTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeSideTab, showMobileSidebar]);
    
    // --- 2. FILTER TOOLS ---
    const filteredTools = tools.filter((t: Tool) => 
        t.divisionId === id && 
        (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const groupedTools = useMemo(() => { 
        return { 
            [ToolCategory.DAILY]: filteredTools.filter((t: Tool) => t.category === ToolCategory.DAILY), 
            [ToolCategory.SHARED]: filteredTools.filter((t: Tool) => t.category === ToolCategory.SHARED), 
            [ToolCategory.PROJECT]: filteredTools.filter((t: Tool) => t.category === ToolCategory.PROJECT), 
        }; 
    }, [filteredTools]);

    const divisionTasks = tasks.filter(t => t.targetDivisionId === division.id || (!t.targetDivisionId && t.originDivisionId === division.id));
    const divisionMessages = messages.filter(m => m.channelId === division.id);

    const handleChatSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(!chatInput.trim()) return;
        onSendMessage(chatInput, division.id);
        setChatInput('');
    };
    
    const ToolColumn: React.FC<{ title: string; categoryTools: Tool[]; color: string }> = ({ title, categoryTools, color }) => (
        <div className="flex-1 min-w-[280px] flex flex-col glass-card rounded-2xl border border-white/5 h-full overflow-hidden">
            <div className={`p-4 border-b border-white/5 bg-white/5 flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
                    <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wide">{title}</h3>
                </div>
                <span className="text-xs text-gray-500 bg-black/20 px-2 py-0.5 rounded-full">{categoryTools.length}</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2 bg-black/10">
                {categoryTools.map(tool => (
                    <div key={tool.id} draggable={!tool.isLocked}>
                        <ToolCard tool={tool} onClick={() => handleToolClick(tool)} onContextMenu={onContextMenu} onSelect={() => onSelect(tool)} variant="list" isSelectionMode={isSelectionMode} isSelected={selectedIds.has(tool.id)} />
                    </div>
                ))}
                {categoryTools.length === 0 && <div className="h-20 flex items-center justify-center text-xs text-gray-500 italic">No tools</div>}
            </div>
        </div>
    );

    const handleAddTaskBoard = (task: Task) => {
        onAddTask(division.id, task.title, task.priority);
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask({ ...task, divId: division.id });
    };

    const handleWhatsApp = (task: Task) => NotificationService.sendToWhatsApp(task, prefs);

    return (
        <div className="flex h-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#020617] via-[#0f172a] to-[#172554] relative">
            
            {/* MAIN CONTENT (TOOLS) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-6 border-b border-white/5 bg-white/5 shrink-0 gap-3">
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors shrink-0"><Icon name="ArrowLeft" size={20} /></button>
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight flex items-center gap-2 truncate">
                                <Icon name={division.icon} className="text-brand-400 shrink-0" />
                                <span className="truncate">{division.name}</span>
                            </h1>
                            <p className="text-xs text-gray-500 mt-1 truncate hidden md:block">{division.description}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Search Bar (Hidden on small mobile if needed, or collapsed) */}
                        <div className="relative group w-32 md:w-64 hidden sm:block">
                            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search tools..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:border-brand-500 transition-all" 
                            />
                        </div>

                        {canAddTool && (<button onClick={() => onAddTool(division.id)} className="flex items-center justify-center w-8 h-8 md:w-auto md:px-4 md:py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg shadow-lg"><Icon name="Plus" size={16} /> <span className="hidden md:inline ml-2">{t.division.addTool}</span></button>)}
                        
                        {/* Mobile Sidebar Toggle */}
                        <button 
                            onClick={() => setShowMobileSidebar(true)}
                            className="md:hidden p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg relative"
                        >
                            <Icon name="Layout" size={20} />
                            {divisionTasks.filter(t => !t.isCompleted).length > 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black"></div>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Tools Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                    <div className="max-w-7xl mx-auto h-full space-y-6 md:space-y-8 animate-[fadeIn_0.3s]">
                        {division.workflow.length > 0 && (
                            <div className="glass-card rounded-2xl p-4 md:p-6 border border-white/5 overflow-x-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <Icon name="GitMerge" className="text-brand-400" size={18} />
                                    <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wide">{t.division.workflow}</h3>
                                </div>
                                <WorkflowMap steps={division.workflow} onStepClick={() => {}} />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
                            <ToolColumn title={t.division.daily} categoryTools={groupedTools[ToolCategory.DAILY]} color="bg-blue-500" />
                            <ToolColumn title={t.division.shared} categoryTools={groupedTools[ToolCategory.SHARED]} color="bg-purple-500" />
                            <ToolColumn title={t.division.projects} categoryTools={groupedTools[ToolCategory.PROJECT]} color="bg-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* RESPONSIVE RIGHT SIDEBAR (TASKS & CHAT) */}
            {/* Desktop: Static relative. Mobile: Fixed overlay slide-in. */}
            <div className={`
                fixed inset-y-0 right-0 z-50 bg-[#0b1120]/95 backdrop-blur-xl border-l border-white/5 shadow-2xl transition-transform duration-300
                w-full md:w-[400px] md:relative md:transform-none md:flex flex-col
                ${showMobileSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}>
                
                {/* Mobile Header Close */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Icon name="Layout" className="text-indigo-400" /> Division Activity
                    </h3>
                    <button onClick={() => setShowMobileSidebar(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full">
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Sidebar Tabs */}
                <div className="flex p-3 gap-2 border-b border-white/5 bg-white/5 shrink-0">
                    <button 
                        onClick={() => setActiveSideTab('tasks')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeSideTab === 'tasks' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Icon name="Layout" size={14} /> Workload
                        <span className="bg-black/20 px-1.5 py-0.5 rounded-full text-[10px]">{divisionTasks.filter(t => !t.isCompleted).length}</span>
                    </button>
                    <button 
                        onClick={() => setActiveSideTab('chat')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeSideTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Icon name="MessageSquare" size={14} /> Team Chat
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    
                    {/* TASKS VIEW */}
                    {activeSideTab === 'tasks' && (
                        <div className="flex-1 overflow-y-auto custom-scrollbar animate-[fadeIn_0.2s]">
                            <TaskBoard 
                                user={user} 
                                tasks={tasks} 
                                onAdd={handleAddTaskBoard} 
                                onToggle={(tid) => onToggleTask(division.id, tid)} 
                                onDelete={(tid) => onDeleteTask(division.id, tid)} 
                                onTaskClick={handleTaskClick} 
                                onWhatsApp={handleWhatsApp}
                                divisionContext={division.id} 
                                isEmbedded={true} 
                            />
                        </div>
                    )}

                    {/* CHAT VIEW */}
                    {activeSideTab === 'chat' && (
                        <div className="flex-1 flex flex-col animate-[fadeIn_0.2s] overflow-hidden">
                            <div className="p-3 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {division.name} Channel
                                </div>
                                <Icon name="Users" size={14} className="text-gray-500" />
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/10">
                                {divisionMessages.length === 0 && (
                                    <div className="text-center py-10 text-gray-500 opacity-50">
                                        <Icon name="MessageCircle" size={32} className="mx-auto mb-2" />
                                        <p className="text-xs">No messages yet.</p>
                                    </div>
                                )}
                                {divisionMessages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs shadow-sm ${msg.senderId === user.id ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-gray-200 border border-white/10'}`}>
                                            {msg.senderId !== user.id && <p className="text-[9px] font-bold text-indigo-300 mb-0.5">{msg.senderName}</p>}
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <span className="text-[9px] text-gray-600 mt-1 px-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-3 border-t border-white/5 bg-white/5 shrink-0 safe-area-pb">
                                <form onSubmit={handleChatSend} className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none placeholder-gray-500 transition-all"
                                        placeholder={`Message...`}
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!chatInput.trim()}
                                        className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg transition-all"
                                    >
                                        <Icon name="Send" size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Backdrop for Mobile Sidebar */}
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setShowMobileSidebar(false)}
                ></div>
            )}

            {selectedTask && (
                <TaskDetailView 
                    task={selectedTask} 
                    isOpen={!!selectedTask} 
                    onClose={() => setSelectedTask(null)} 
                    onToggle={() => onToggleTask(division.id, selectedTask.id)} 
                    onDelete={() => { onDeleteTask(division.id, selectedTask.id); setSelectedTask(null); }} 
                    onUpdate={(updates) => onUpdateTask && onUpdateTask(division.id, selectedTask.id, updates)} 
                />
            )}
        </div>
    );
};
