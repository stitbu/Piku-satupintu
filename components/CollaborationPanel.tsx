
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DivisionData, ChatMessage, Announcement, User, TaskPriority, Task, UserPreferences, UserRole, ChatGroup } from '../types';
import { Icon } from './Icon';
import { GeminiService } from '../services/geminiService';
import { NotificationService } from '../services/notificationService';
import { StorageService } from '../services/storageService';
import { UnifiedDataService } from '../services/UnifiedDataService';
import { DIVISIONS } from '../constants';
import { TaskItem } from './TaskItem';

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  divisions: DivisionData[];
  onToggleTask: (divisionId: any, taskId: string) => void;
  onAddTask: (divisionId: any, text: string, priority: any, dueDate: string) => void;
  onDeleteTask: (divisionId: any, taskId: string) => void;
  announcements: Announcement[];
  messages: ChatMessage[];
  onSendMessage: (content: string, channelId: string) => void;
  activeChannel: string;
  onChangeChannel: (id: string) => void;
  initialTab?: 'tasks' | 'discussion';
  onUpdateTask?: (divisionId: any, taskId: string, updates: Partial<Task>) => void;
  groups?: ChatGroup[]; // Added groups prop
}

const ChatColumn: React.FC<{
    col: { id: string; name: string; icon: string; color: string };
    messages: ChatMessage[];
    user: User;
    inputValue: string;
    onInputChange: (val: string) => void;
    onSend: (e: React.FormEvent) => void;
    onFocus: () => void;
}> = ({ col, messages, user, inputValue, onInputChange, onSend, onFocus }) => {
    const lastMsgRef = useRef<HTMLDivElement>(null);
    useEffect(() => { lastMsgRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);
    return (
        <div className="flex flex-col w-80 min-w-[320px] h-full max-h-full glass-card rounded-2xl border border-white/5 bg-black/20 shrink-0">
            <div className={`p-3 border-b border-white/5 bg-white/5 flex items-center justify-between`}>
                <div className="flex items-center gap-2 font-bold text-gray-200 text-sm truncate">
                    <div className={`p-1.5 rounded-md ${col.color} text-white`}><Icon name={col.icon} size={14} /></div>
                    {col.name}
                </div>
                <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] text-gray-400">{messages.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {messages.length === 0 && <p className="text-center text-[10px] text-gray-600 italic mt-10">No messages yet.</p>}
                {messages.map(msg => {
                    const isMe = msg.senderId === user.id;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs shadow-sm ${isMe ? 'bg-brand-600 text-white' : 'bg-[#1e293b] text-gray-200 border border-white/10'}`}>
                                {!isMe && <p className="text-[9px] font-bold text-brand-400 mb-0.5 truncate">{msg.senderName}</p>}
                                <p className="whitespace-pre-wrap leading-tight">{msg.content}</p>
                            </div>
                            <span className="text-[9px] text-gray-600 mt-1 px-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    );
                })}
                <div ref={lastMsgRef} />
            </div>
            <div className="p-3 border-t border-white/5 bg-black/20">
                <form onSubmit={onSend} className="flex gap-2">
                    <input value={inputValue} onChange={(e) => onInputChange(e.target.value)} onFocus={onFocus} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-500 transition-colors" placeholder="Reply..." />
                    <button type="submit" disabled={!inputValue?.trim()} className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50"><Icon name="Send" size={14} /></button>
                </form>
            </div>
        </div>
    );
};

const TaskDetailView: React.FC<{
    task: Task & { divName?: string, divIcon?: string, description?: string, divId?: string };
    isOpen: boolean; onClose: () => void; onToggle: () => void; onDelete: () => void; onUpdate: (updates: Partial<Task>) => void;
}> = ({ task, isOpen, onClose, onToggle, onDelete, onUpdate }) => {
    const [desc, setDesc] = useState(task.description || '');
    const [title, setTitle] = useState(task.title || '');
    const [isUploading, setIsUploading] = useState(false);
    
    useEffect(() => { 
        setDesc(task.description || ''); 
        setTitle(task.title || ''); 
    }, [task.id]);
    
    const handleSave = () => { onUpdate({ title: title, description: desc } as any); };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await UnifiedDataService.uploadAttachment(file);
            if (url) {
                onUpdate({ attachmentUrl: url });
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Upload gagal.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`absolute inset-y-0 right-0 w-4/5 md:w-3/5 lg:w-1/2 bg-[#0f172a]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-16 border-b border-white/5 bg-white/5 flex items-center justify-between px-6 shrink-0">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Icon name="X" size={24} /></button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-full border border-white/5"><Icon name={task.divIcon || "CheckSquare"} size={14} className="text-brand-400" /><span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{task.divName || "Task"}</span></div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <button onClick={onToggle} className={`mt-1.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-brand-400'}`}>{task.isCompleted && <Icon name="Check" size={14} className="text-white" />}</button>
                        <input className="w-full bg-transparent text-2xl font-bold text-white outline-none border-none p-0 focus:ring-0" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave} />
                    </div>
                    <div className="flex flex-wrap gap-3 pl-9">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${task.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-blue-500/10 border-blue-500/20 text-blue-300'}`}><Icon name="Flag" size={14} /><span className="text-xs font-bold uppercase">{task.priority} Priority</span></div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-300"><Icon name="Calendar" size={14} /><span className="text-xs font-medium">{task.dueDate || 'No Due Date'}</span></div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-300"><Icon name="User" size={14} /><span className="text-xs font-medium">{task.assigneeId ? 'Assigned' : 'Unassigned'}</span></div>
                    </div>
                </div>
                
                {/* ATTACHMENT SECTION */}
                <div className="h-px bg-white/5 w-full"></div>
                <div className="pl-9 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Icon name="Paperclip" size={14} /> Lampiran / Dokumen</h4>
                    
                    {task.attachmentUrl ? (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group hover:border-brand-500/50 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-brand-500/20 text-brand-400 rounded-lg"><Icon name="FileText" size={20} /></div>
                                <div className="min-w-0">
                                    <a href={task.attachmentUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:underline truncate block">Lihat Dokumen</a>
                                    <p className="text-[10px] text-gray-500 truncate">{task.attachmentUrl}</p>
                                </div>
                            </div>
                            <button onClick={() => onUpdate({ attachmentUrl: undefined })} className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="Trash2" size={16}/></button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input 
                                type="file" 
                                onChange={handleFileUpload} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={isUploading}
                            />
                            <div className={`border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 transition-all ${isUploading ? 'bg-white/5' : 'hover:bg-white/5 hover:border-white/20'}`}>
                                {isUploading ? (
                                    <>
                                        <Icon name="Loader2" size={24} className="animate-spin mb-2 text-brand-400" />
                                        <p className="text-xs font-medium">Mengunggah...</p>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="UploadCloud" size={24} className="mb-2" />
                                        <p className="text-xs font-medium">Klik untuk upload file</p>
                                        <p className="text-[10px] opacity-70 mt-1">PDF, Images (Max 2MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-px bg-white/5 w-full"></div>
                <div className="pl-9 space-y-2"><h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Icon name="AlignLeft" size={14} /> Deskripsi</h4><textarea className="w-full min-h-[150px] bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-gray-300 focus:bg-black/40 focus:border-brand-500/50 outline-none transition-all resize-none leading-relaxed" placeholder="Tambahkan detail tugas..." value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={handleSave} /></div>
            </div>
            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between"><button onClick={onDelete} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"><Icon name="Trash2" size={16} /> Hapus Tugas</button><div className="flex gap-3"><button onClick={onClose} className="px-5 py-2 text-gray-400 hover:text-white font-bold text-sm transition-colors">Tutup</button><button onClick={() => { onToggle(); onClose(); }} className={`px-5 py-2 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2 ${task.isCompleted ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'}`}><Icon name={task.isCompleted ? "RotateCcw" : "Check"} size={16} />{task.isCompleted ? 'Tandai Pending' : 'Tandai Selesai'}</button></div></div>
        </div>
    );
};

const DivisionColumn: React.FC<{
    division: DivisionData; tasks: Task[]; onToggle: (taskId: string) => void; onSelect: (taskId: string) => void; onDelete: (taskId: string) => void; onDiscuss: (title: string) => void; onWhatsApp: (task: Task) => void; onReminder: (task: Task) => void; onQuickAdd: (text: string) => void;
}> = ({ division, tasks, onToggle, onSelect, onDelete, onDiscuss, onWhatsApp, onReminder, onQuickAdd }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [quickInput, setQuickInput] = useState('');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if(!quickInput.trim()) return; onQuickAdd(quickInput); setQuickInput(''); setIsAdding(false); }
    return (
        <div className="flex flex-col w-80 min-w-[320px] h-full max-h-full glass-card rounded-2xl border border-white/5 bg-black/20 shrink-0">
             <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center"><div className="flex items-center gap-2 font-bold text-gray-200"><Icon name={division.icon} size={16} className="text-brand-400" /><span className="text-sm truncate">{division.name}</span></div><span className="bg-black/30 px-2 py-0.5 rounded text-xs text-gray-400 font-mono">{tasks.filter(t => !t.isCompleted).length}</span></div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {tasks.length === 0 && <div className="text-center py-10 text-gray-600 text-xs italic border-2 border-dashed border-white/5 rounded-xl">No active tasks</div>}
                {tasks.map(task => (<div key={task.id}><TaskItem task={task} onToggle={() => onToggle(task.id)} onSelect={() => onSelect(task.id)} onDelete={() => onDelete(task.id)} onDiscuss={() => onDiscuss(task.title)} onWhatsApp={() => onWhatsApp(task)} onReminder={() => onReminder(task)} /></div>))}
            </div>
            <div className="p-3 border-t border-white/5 bg-black/20">{isAdding ? (<form onSubmit={handleSubmit} className="flex flex-col gap-2 animate-[fadeIn_0.2s]"><input autoFocus className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-500" placeholder="Task title..." value={quickInput} onChange={e => setQuickInput(e.target.value)} onBlur={() => !quickInput && setIsAdding(false)} /><div className="flex gap-2"><button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-1.5 rounded-lg text-xs font-bold transition-colors">Add</button><button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors">Cancel</button></div></form>) : (<button onClick={() => setIsAdding(true)} className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10"><Icon name="Plus" size={14} /> Quick Add to {division.name}</button>)}</div>
        </div>
    )
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
    isOpen, onClose, user, divisions, onToggleTask, onAddTask, onDeleteTask,
    announcements, messages, onSendMessage, activeChannel, onChangeChannel,
    initialTab = 'tasks', onUpdateTask, groups = []
}) => {
    // --- STATE MANAGEMENT ---
    const [activeMainTab, setActiveMainTab] = useState<'tasks' | 'discussion' | 'analytics'>('tasks');
    const [activeChatTab, setActiveChatTab] = useState<'announcements' | 'chat'>('announcements');
    const [isExpanded, setIsExpanded] = useState(false);
    const [taskViewMode, setTaskViewMode] = useState<'list' | 'board'>('board');
    const [tasksDisplayMode, setTasksDisplayMode] = useState<'folder' | 'list'>('folder');
    const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single');
    const [newTaskText, setNewTaskText] = useState('');
    const [targetDivision, setTargetDivision] = useState<string>('AUTO');
    const [targetPriority, setTargetPriority] = useState<TaskPriority>('medium');
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [bulkPreview, setBulkPreview] = useState<any[]>([]);
    const [bulkStage, setBulkStage] = useState<'edit' | 'preview'>('edit');
    const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
    const [selectedTask, setSelectedTask] = useState<(Task & { divName?: string, divIcon?: string, description?: string, divId?: string }) | null>(null);
    const [msgInput, setMsgInput] = useState('');
    const [chatContext, setChatContext] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [columnInputs, setColumnInputs] = useState<Record<string, string>>({});
    const [prefs, setPrefs] = useState<UserPreferences>(StorageService.getPreferences());
    
    // Voice & Reporting States
    const [isListening, setIsListening] = useState(false);
    const [isSendingReport, setIsSendingReport] = useState(false);

    const allUsers = StorageService.getUsers();

    useEffect(() => { if (isOpen) { setActiveMainTab(initialTab === 'discussion' ? 'discussion' : 'tasks'); setPrefs(StorageService.getPreferences()); } }, [isOpen, initialTab]);

    // --- FILTER LOGIC ---
    // Only show divisions relevant to user (All for Admin, Single for User)
    const visibleDivisions = useMemo(() => {
        if (user.role === UserRole.ADMIN) return divisions;
        return divisions.filter(d => d.id === user.division);
    }, [user, divisions]);

    // Filter Groups user is part of
    const myGroups = useMemo(() => groups.filter(g => g.memberIds.includes(user.id) || g.createdBy === user.id), [groups, user.id]);

    type FlatTask = Task & { divName: string; divId: string; divIcon: string };
    const allFlatTasks = useMemo<FlatTask[]>(() => {
        const flat: FlatTask[] = [];
        // Only iterate over VISIBLE divisions to filter tasks automatically
        visibleDivisions.forEach(div => {
            div.tasks.forEach(t => { flat.push({ ...t, divName: div.name, divId: div.id, divIcon: div.icon }); });
        });
        return flat.sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return Number(a.isCompleted) - Number(b.isCompleted);
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (b.priority === 'high' && a.priority !== 'high') return 1;
            return (b.timestamp || 0) - (a.timestamp || 0);
        });
    }, [visibleDivisions]);

    const activeChannelId = activeChannel;
    const filteredMessages = useMemo(() => messages.filter((m) => m.channelId === activeChannelId), [messages, activeChannelId]);
    useEffect(() => { if (isOpen && activeMainTab === 'discussion' && activeChatTab === 'chat' && !isExpanded) { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } }, [isOpen, activeMainTab, activeChatTab, filteredMessages.length, chatContext, isExpanded]);

    // --- HELPER: Identify Channel Name ---
    const getChannelName = (id: string) => {
        if (id === 'GENERAL') return '🌐 Umum / Semua Tim';
        
        const division = DIVISIONS.find(d => d.id === id);
        if (division) return `🔒 Divisi ${division.name}`;

        const group = groups.find(g => g.id === id);
        if (group) return `# ${group.name}`;
        
        if (id.includes('_') && !id.startsWith('grp_')) {
            const parts = id.split('_');
            const otherUserId = parts.find(p => p !== user.id);
            const otherUser = allUsers.find(u => u.id === otherUserId);
            return otherUser ? `👤 ${otherUser.name}` : 'Private Message';
        }

        return id;
    };

    // --- IDENTIFY DM Channels the user is part of ---
    const myDMs = useMemo(() => {
        const dmChannels = new Set<string>();
        messages.forEach(msg => {
            if (msg.channelId.includes('_') && !msg.channelId.startsWith('grp_')) {
                const parts = msg.channelId.split('_');
                if (parts.includes(user.id)) dmChannels.add(msg.channelId);
            }
        });
        return Array.from(dmChannels);
    }, [messages, user.id]);

    const handleSingleSubmit = async () => {
        if (!newTaskText.trim()) return;

        if (targetDivision === 'BROADCAST') {
            DIVISIONS.forEach(div => { onAddTask(div.id, newTaskText, targetPriority, ''); });
            setNewTaskText(''); return;
        }

        let finalDiv = targetDivision;
        let finalTitle = newTaskText;
        let finalPriority = targetPriority;

        if (targetDivision === 'AUTO') {
            setIsAIGenerating(true);
            try {
                const result = await GeminiService.parseBulkTasks(newTaskText);
                if (result && result.length > 0) {
                    const aiResult = result[0];
                    if (aiResult.divisionId === 'BROADCAST') {
                        DIVISIONS.forEach(div => onAddTask(div.id, aiResult.title || newTaskText, aiResult.priority as TaskPriority || 'medium', ''));
                        setNewTaskText(''); setIsAIGenerating(false); return;
                    }
                    finalDiv = aiResult.divisionId || user.division;
                    finalTitle = aiResult.title || newTaskText;
                    finalPriority = (aiResult.priority as TaskPriority) || 'medium';
                } else {
                    finalDiv = user.division;
                }
            } catch (e) {
                finalDiv = user.division;
            } finally {
                setIsAIGenerating(false);
            }
        }
        onAddTask(finalDiv, finalTitle, finalPriority, '');
        setNewTaskText('');
    };

    const handleBulkAnalyze = async () => {
        if (!bulkText.trim()) return;
        setIsAIGenerating(true);
        try {
            const result = await GeminiService.parseBulkTasks(bulkText);
            setBulkPreview(result || []);
            setBulkStage('preview');
        } catch (e) {
            alert("AI processing failed. Check API Key.");
        } finally {
            setIsAIGenerating(false);
        }
    };

    const handleBulkConfirm = () => {
        bulkPreview.forEach(t => {
            if (t.divisionId === 'BROADCAST') {
                DIVISIONS.forEach(div => {
                    onAddTask(div.id, t.title, t.priority || 'medium', t.dueDate || '');
                });
            } else {
                onAddTask(t.divisionId || 'Administrasi', t.title, t.priority || 'medium', t.dueDate || '');
            }
        });
        setBulkText(''); setBulkPreview([]); setBulkStage('edit'); setInputMode('single');
    };

    // --- VOICE INPUT HANDLER ---
    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Browser Anda tidak mendukung Input Suara.");
            return;
        }

        if (isListening) return; // Prevent double click

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'id-ID'; // Set to Indonesian
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setNewTaskText(prev => (prev + ' ' + transcript).trim());
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // --- DAILY REPORT HANDLER ---
    const handleDailyReport = async () => {
        setIsSendingReport(true);
        try {
            // Get all tasks visible to this user
            const result = await NotificationService.sendDailyReport(allFlatTasks, user, prefs);
            if (result.success) {
                alert(result.detail);
            } else {
                alert("Gagal mengirim laporan: " + result.detail);
            }
        } catch (e) {
            alert("Terjadi kesalahan.");
        } finally {
            setIsSendingReport(false);
        }
    };

    const toggleDivision = (id: string) => { const newSet = new Set(expandedDivisions); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setExpandedDivisions(newSet); };
    const handleDiscussTask = (taskText: string, divisionId: string) => { setActiveMainTab('discussion'); setActiveChatTab('chat'); if (divisionId !== 'GENERAL' && DIVISIONS.some(d => d.id === divisionId)) onChangeChannel(divisionId); setChatContext(taskText); setMsgInput(""); if(isExpanded) setIsExpanded(false); };
    const handleSendChat = (e: React.FormEvent) => { e.preventDefault(); if (!msgInput.trim()) return; const finalMessage = chatContext ? `[Membahas: ${chatContext}]\n${msgInput}` : msgInput; onSendMessage(finalMessage, activeChannel); setMsgInput(''); setChatContext(null); };
    const handleMultiChatSend = (e: React.FormEvent, channelId: string) => { e.preventDefault(); const content = columnInputs[channelId]; if (!content?.trim()) return; onSendMessage(content, channelId); setColumnInputs(prev => ({ ...prev, [channelId]: '' })); onChangeChannel(channelId); };
    const handleWhatsApp = (task: Task) => NotificationService.sendToWhatsApp(task, prefs);
    const handleSetReminder = (divId: string, task: Task) => { const choice = prompt("Set Reminder (menit)?", "15"); if (choice && onUpdateTask) { const delay = parseInt(choice) * 60 * 1000; if (delay > 0) { onUpdateTask(divId, task.id, { reminderAt: Date.now() + delay, isReminded: false }); alert(`Pengingat diset.`); NotificationService.requestPermission(); }}};
    const handleSelectTask = (taskId: string) => { const found = allFlatTasks.find(t => t.id === taskId); if (found) setSelectedTask(found); };

    const renderAnalytics = () => {
        const total = allFlatTasks.length;
        const completed = allFlatTasks.filter(t => t.isCompleted).length;
        return (
            <div className="p-8 space-y-8 animate-[fadeIn_0.5s]">
                 <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-6 rounded-2xl flex items-start gap-4 relative overflow-hidden"><div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300 shadow-inner shrink-0"><Icon name="Sparkles" size={24} /></div><div><h4 className="text-indigo-200 font-bold mb-1">AI Insight</h4><p className="text-indigo-100/70 text-sm">Team has {total} tasks, {completed} completed.</p></div></div>
                <div className="grid grid-cols-2 gap-4"><div className="glass-card p-5 rounded-2xl border-l-4 border-l-blue-500"><p className="text-xs text-gray-400 font-bold uppercase">Total</p><p className="text-3xl font-bold text-white">{total}</p></div><div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500"><p className="text-xs text-gray-400 font-bold uppercase">Done</p><p className="text-3xl font-bold text-emerald-400">{completed}</p></div></div>
            </div>
        )
    };
    
    const renderKanbanChat = () => {
        // Build columns for: General, Visible Divisions, My Groups
        const columns = [ 
            { id: 'GENERAL', name: '📢 GENERAL', icon: 'Megaphone', color: 'bg-indigo-500' }, 
            ...visibleDivisions.map(d => ({ id: d.id, name: d.name, icon: d.icon, color: 'bg-gray-700' })), 
            ...myGroups.map(g => ({ id: g.id, name: g.name, icon: 'Users', color: 'bg-emerald-600' })) 
        ];
        
        return (
            <div className="flex gap-4 h-full p-6 overflow-x-auto items-start">
                {columns.map(col => (<ChatColumn key={col.id} col={col} messages={messages.filter(m => m.channelId === col.id)} user={user} inputValue={columnInputs[col.id] || ''} onInputChange={(val) => setColumnInputs(prev => ({ ...prev, [col.id]: val }))} onSend={(e) => handleMultiChatSend(e, col.id)} onFocus={() => onChangeChannel(col.id)} />))}
            </div>
        );
    };

    const renderDivisionBoard = () => {
        return (
             <div className="flex gap-4 h-full p-6 overflow-x-auto items-start">
                {visibleDivisions.map(div => (<DivisionColumn key={div.id} division={div} tasks={div.tasks.filter(t => !t.isCompleted)} onToggle={(tid) => onToggleTask(div.id, tid)} onSelect={(tid) => handleSelectTask(tid)} onDelete={(tid) => onDeleteTask(div.id, tid)} onDiscuss={(title) => handleDiscussTask(title, div.id)} onWhatsApp={handleWhatsApp} onReminder={(t) => handleSetReminder(div.id, t)} onQuickAdd={(text) => onAddTask(div.id, text, 'medium', '')} />))}
             </div>
        )
    };

    return (
        <div className={`fixed transition-all duration-500 ease-in-out bg-[#0f172a]/95 backdrop-blur-xl shadow-2xl z-[90] flex flex-col ${isExpanded ? 'inset-0 w-full' : `inset-y-0 right-0 w-[420px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} ${!isOpen && !isExpanded ? 'translate-x-full' : ''}`}>
            {/* HEADER TABS */}
            <div className="flex h-16 border-b border-white/10 shrink-0 bg-black/20 relative items-center px-2">
                <div className="flex-1 flex gap-1">
                    <button onClick={() => setActiveMainTab('tasks')} className={`flex-1 py-2 flex items-center justify-center gap-2 font-bold text-xs md:text-sm tracking-wide transition-all rounded-lg ${activeMainTab === 'tasks' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Icon name="Layout" size={16} /> TASKS</button>
                    <button onClick={() => setActiveMainTab('analytics')} className={`flex-1 py-2 flex items-center justify-center gap-2 font-bold text-xs md:text-sm tracking-wide transition-all rounded-lg ${activeMainTab === 'analytics' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Icon name="BarChart2" size={16} /> ANALYTICS</button>
                    <button onClick={() => setActiveMainTab('discussion')} className={`flex-1 py-2 flex items-center justify-center gap-2 font-bold text-xs md:text-sm tracking-wide transition-all rounded-lg ${activeMainTab === 'discussion' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Icon name="MessageSquare" size={16} /> DISCUSS</button>
                </div>
                <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                    {activeMainTab !== 'analytics' && (<button onClick={() => setIsExpanded(!isExpanded)} className={`p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-brand-400 transition-colors ${isExpanded ? 'bg-white/10 text-white' : ''}`}><Icon name={isExpanded ? "Minimize2" : "Maximize2"} size={18} /></button>)}
                    <button onClick={onClose} className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-colors ml-1"><Icon name="X" size={18} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col relative bg-gradient-to-br from-gray-900 to-[#0b1120]">
                {activeMainTab === 'analytics' && (<div className="flex-1 overflow-y-auto custom-scrollbar">{renderAnalytics()}</div>)}
                {activeMainTab === 'tasks' && (
                    <div className="flex-1 flex flex-col animate-[fadeIn_0.2s] overflow-hidden relative">
                        {/* INPUT HEADER */}
                        <div className="p-5 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md shadow-xl z-30 shrink-0">
                            <div className="flex bg-black/40 p-1 rounded-xl mb-4 border border-white/5">
                                <button onClick={() => setInputMode('single')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${inputMode === 'single' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}><Icon name="PenTool" size={14} /> 🖊️ Manual Input</button>
                                <button onClick={() => { setInputMode('bulk'); setBulkStage('edit'); }} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${inputMode === 'bulk' ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-pink-200 shadow-sm border border-pink-500/30' : 'text-gray-500 hover:text-white'}`}><Icon name="Sparkles" size={14} /> ✨ AI Magic Import</button>
                            </div>
                            
                            {/* QUICK ACTION BAR */}
                            <div className="flex items-center justify-between mb-3 px-1">
                                <button 
                                    onClick={handleDailyReport} 
                                    disabled={isSendingReport}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${isSendingReport ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-green-600 hover:bg-green-500 text-white border-transparent'}`}
                                >
                                    {isSendingReport ? <Icon name="Loader2" size={12} className="animate-spin"/> : <Icon name="Megaphone" size={12}/>}
                                    {isSendingReport ? 'Mengirim...' : '📢 Lapor Harian'}
                                </button>
                            </div>

                            {inputMode === 'single' && (
                                <div className="space-y-3 animate-[fadeIn_0.2s]">
                                    <div className="relative group">
                                        <input 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder-gray-500" 
                                            placeholder="Ketik tugas atau klik mic..." 
                                            value={newTaskText} 
                                            onChange={e => setNewTaskText(e.target.value)} 
                                            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSingleSubmit(); }}} 
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            {isAIGenerating && <Icon name="Loader2" size={16} className="text-purple-400 animate-spin mr-2" />}
                                            <button 
                                                onClick={handleVoiceInput}
                                                className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                                title="Input Suara (Bahasa Indonesia)"
                                            >
                                                <Icon name={isListening ? "MicOff" : "Mic"} size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1"><select value={targetDivision} onChange={e => setTargetDivision(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-xs text-white outline-none cursor-pointer hover:bg-white/5"><option value="AUTO">✨ Auto (AI)</option><option value="BROADCAST">📢 Broadcast All</option>{DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><Icon name="ChevronDown" size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/></div>
                                        <div className="relative w-28"><select value={targetPriority} onChange={e => setTargetPriority(e.target.value as TaskPriority)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-xs text-white outline-none cursor-pointer hover:bg-white/5"><option value="low">Low</option><option value="medium">Normal</option><option value="high">Urgent</option></select><Icon name="ChevronDown" size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/></div>
                                        <button onClick={handleSingleSubmit} disabled={isAIGenerating || !newTaskText.trim()} className="bg-brand-600 hover:bg-brand-500 text-white px-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs font-bold"><Icon name="Plus" size={16}/> ADD</button>
                                    </div>
                                </div>
                            )}
                            {inputMode === 'bulk' && (
                                <div className="space-y-3 animate-[fadeIn_0.2s]">
                                    {bulkStage === 'edit' ? (
                                        <>
                                            <textarea className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white resize-none focus:ring-1 focus:ring-purple-500 outline-none custom-scrollbar" placeholder="Paste chat notulen atau list tugas di sini... AI akan mendeteksi divisi & prioritas otomatis. Ketik 'untuk semua tim' untuk Broadcast." value={bulkText} onChange={e => setBulkText(e.target.value)} />
                                            <button onClick={handleBulkAnalyze} disabled={isAIGenerating || !bulkText.trim()} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95"><Icon name={isAIGenerating ? "Loader2" : "Sparkles"} size={16} className={isAIGenerating ? "animate-spin" : ""}/> {isAIGenerating ? 'Sedang Menganalisis...' : '✨ Analisis & Buat Tugas'}</button>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs text-gray-400 px-1"><span>Preview: {bulkPreview.length} tugas ditemukan</span><button onClick={() => setBulkStage('edit')} className="text-white hover:underline">Edit Teks</button></div>
                                            <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl bg-black/20 p-2 custom-scrollbar space-y-2">{bulkPreview.map((item, idx) => (<div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col gap-2"><div className="flex items-start gap-2"><Icon name="CheckSquare" size={14} className="text-purple-400 mt-0.5 shrink-0"/><input value={item.title} onChange={(e) => { const n = [...bulkPreview]; n[idx].title = e.target.value; setBulkPreview(n); }} className="bg-transparent text-sm font-bold text-white w-full outline-none border-b border-transparent focus:border-white/20" /></div><div className="flex gap-2 pl-6"><select value={item.divisionId} onChange={(e) => { const n = [...bulkPreview]; n[idx].divisionId = e.target.value; setBulkPreview(n); }} className="bg-black/40 text-[10px] text-gray-300 rounded px-2 py-1 outline-none border border-white/10"><option value="BROADCAST">📢 Broadcast All</option>{DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><select value={item.priority} onChange={(e) => { const n = [...bulkPreview]; n[idx].priority = e.target.value; setBulkPreview(n); }} className={`bg-black/40 text-[10px] rounded px-2 py-1 outline-none border border-white/10 uppercase font-bold ${item.priority === 'high' ? 'text-red-400' : 'text-blue-400'}`}><option value="low">Low</option><option value="medium">Normal</option><option value="high">Urgent</option></select><button onClick={() => { const n = bulkPreview.filter((_, i) => i !== idx); setBulkPreview(n); }} className="ml-auto text-gray-500 hover:text-red-400"><Icon name="X" size={14}/></button></div></div>))}</div>
                                            <div className="flex gap-2"><button onClick={() => { setBulkText(''); setBulkStage('edit'); }} className="flex-1 py-2.5 border border-white/10 text-xs font-bold text-gray-400 rounded-xl hover:bg-white/5 transition-colors">Batal</button><button onClick={handleBulkConfirm} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors">Simpan Semua</button></div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {!isExpanded && (<div className="mt-4 flex bg-black/40 p-1 rounded-xl border border-white/5"><button onClick={() => setTasksDisplayMode('folder')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${tasksDisplayMode === 'folder' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}><Icon name="Folder" size={12}/> Folders</button><button onClick={() => setTasksDisplayMode('list')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${tasksDisplayMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}><Icon name="List" size={12}/> All Tasks</button></div>)}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 bg-black/10">
                            {isExpanded && taskViewMode === 'board' ? renderDivisionBoard() : (
                                <>
                                    {tasksDisplayMode === 'folder' && visibleDivisions.map(div => (<div key={div.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"><button onClick={() => toggleDivision(div.id)} className="w-full flex justify-between items-center p-4 hover:bg-white/5 transition-colors"><div className="flex items-center gap-3"><div className="p-1.5 bg-gray-800 rounded-lg text-gray-300"><Icon name={div.icon} size={16}/></div><span className="text-sm font-bold text-gray-200">{div.name}</span></div><div className="flex items-center gap-3">{div.tasks.filter(t => !t.isCompleted).length > 0 && <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{div.tasks.filter(t => !t.isCompleted).length}</span>}<Icon name="ChevronDown" size={16} className={`text-gray-500 transition-transform duration-300 ${expandedDivisions.has(div.id) ? 'rotate-180' : ''}`} /></div></button>{expandedDivisions.has(div.id) && (<div className="p-4 pt-0 space-y-3 bg-black/10 border-t border-white/5 animate-[fadeIn_0.2s]"><div className="h-2"></div>{div.tasks.length === 0 && <p className="text-center text-xs text-gray-500 italic py-2">No tasks yet.</p>}{div.tasks.map(task => (<div key={task.id}><TaskItem task={task} onToggle={() => onToggleTask(div.id, task.id)} onSelect={() => handleSelectTask(task.id)} onDelete={() => onDeleteTask(div.id, task.id)} onDiscuss={() => handleDiscussTask(task.title, div.id)} onWhatsApp={() => handleWhatsApp(task)} onReminder={() => handleSetReminder(div.id, task)} /></div>))}</div>)}</div>))}
                                    {tasksDisplayMode === 'list' && (<div className="space-y-4">{allFlatTasks.length === 0 && (<div className="text-center py-10 text-gray-500 opacity-50"><Icon name="CheckSquare" size={48} className="mx-auto mb-2"/><p>No tasks found.</p></div>)}{allFlatTasks.map(task => (<div key={task.id}><TaskItem task={task} showDivisionBadge={true} divisionName={task.divName} divisionIcon={task.divIcon} onToggle={() => onToggleTask(task.divId, task.id)} onSelect={() => handleSelectTask(task.id)} onDelete={() => onDeleteTask(task.divId, task.id)} onDiscuss={() => handleDiscussTask(task.title, task.divId)} onWhatsApp={() => handleWhatsApp(task)} onReminder={() => handleSetReminder(task.divId, task)} /></div>))}</div>)}
                                </>
                            )}
                        </div>
                        {selectedTask && (<TaskDetailView task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} onToggle={() => onToggleTask(selectedTask.divId || selectedTask.originDivisionId, selectedTask.id)} onDelete={() => { onDeleteTask(selectedTask.divId || selectedTask.originDivisionId, selectedTask.id); setSelectedTask(null); }} onUpdate={(updates) => onUpdateTask && onUpdateTask(selectedTask.divId || selectedTask.originDivisionId, selectedTask.id, updates)} />)}
                    </div>
                )}
                {activeMainTab === 'discussion' && (
                     <div className="flex flex-col h-full animate-[fadeIn_0.2s] overflow-hidden">
                        <div className="flex p-3 gap-2 shrink-0 bg-black/20 border-b border-white/5"><button onClick={() => setActiveChatTab('announcements')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeChatTab === 'announcements' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>Announcements</button><button onClick={() => setActiveChatTab('chat')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeChatTab === 'chat' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>Chat</button></div>
                         {activeChatTab === 'chat' && (<div className="flex-1 flex flex-col min-h-0 overflow-hidden">{isExpanded ? (<div className="flex-1 overflow-hidden relative">{renderKanbanChat()}</div>) : (<><div className="p-3 border-b border-white/5 bg-white/5"><select className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none" value={activeChannelId} onChange={(e) => onChangeChannel(e.target.value)}><option value="GENERAL">🌐 Umum / Semua Tim</option><optgroup label="Divisions">{visibleDivisions.map((d) => (<option key={d.id} value={d.id}>🔒 {d.name}</option>))}</optgroup>{myGroups.length > 0 && <optgroup label="Grup Saya">{myGroups.map(g => (<option key={g.id} value={g.id}># {g.name}</option>))}</optgroup>}{myDMs.length > 0 && <optgroup label="Pesan Pribadi">{myDMs.map(id => (<option key={id} value={id}>{getChannelName(id)}</option>))}</optgroup>}</select></div><div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">{filteredMessages.map((msg) => (<div key={msg.id} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}><div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${msg.senderId === user.id ? 'bg-brand-600 text-white' : 'bg-[#1e293b] text-gray-200 border border-white/10'}`}>{msg.senderId !== user.id && <p className="text-[9px] font-bold text-brand-400 mb-0.5">{msg.senderName}</p>}<p>{msg.content}</p></div></div>))}<div ref={chatEndRef} /></div><div className="p-3 border-t border-white/5 bg-black/20"><form onSubmit={handleSendChat} className="flex gap-2"><input value={msgInput} onChange={(e) => setMsgInput(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="Type message..." /><button type="submit" disabled={!msgInput.trim()} className="bg-brand-600 text-white p-2 rounded-lg"><Icon name="Send" size={16}/></button></form></div></>)}</div>)}
                         {activeChatTab === 'announcements' && (<div className="flex-1 overflow-y-auto p-4 space-y-4">{announcements.map(ann => (<div key={ann.id} className="bg-white/5 border border-white/5 p-4 rounded-xl border-l-4 border-l-brand-500"><h5 className="text-white text-sm font-bold">{ann.title}</h5><p className="text-xs text-gray-400 mt-1">{ann.content}</p></div>))}</div>)}
                     </div>
                )}
            </div>
        </div>
    );
};
