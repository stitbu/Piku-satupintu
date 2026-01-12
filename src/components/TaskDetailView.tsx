
import React, { useState, useEffect } from 'react';
import { Task, Subtask } from '../types';
import { Icon } from './Icon';
import { UnifiedDataService } from '../services/UnifiedDataService';
import { GeminiService } from '../services/geminiService';

interface TaskDetailViewProps {
    task: Task & { divName?: string, divIcon?: string, description?: string, divId?: string };
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
    onDelete: () => void;
    onUpdate: (updates: Partial<Task>) => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, isOpen, onClose, onToggle, onDelete, onUpdate }) => {
    const [desc, setDesc] = useState(task.description || '');
    const [title, setTitle] = useState(task.title || '');
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
    
    useEffect(() => { 
        setDesc(task.description || ''); 
        setTitle(task.title || ''); 
        setSubtasks(task.subtasks || []);
    }, [task.id]);
    
    // Auto-save wrapper
    const saveChanges = (updates: Partial<Task>) => {
        onUpdate(updates);
    };

    const handleBlur = () => {
        saveChanges({ title, description: desc, subtasks });
    };

    // Subtask Logic
    const addSubtask = (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!newSubtaskTitle.trim()) return;
        const newSub: Subtask = {
            id: `sub_${Date.now()}`,
            title: newSubtaskTitle,
            isCompleted: false
        };
        const updated = [...subtasks, newSub];
        setSubtasks(updated);
        saveChanges({ subtasks: updated });
        setNewSubtaskTitle('');
    };

    const toggleSubtask = (subId: string) => {
        const updated = subtasks.map(s => s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s);
        setSubtasks(updated);
        saveChanges({ subtasks: updated });
    };

    const deleteSubtask = (subId: string) => {
        const updated = subtasks.filter(s => s.id !== subId);
        setSubtasks(updated);
        saveChanges({ subtasks: updated });
    };

    const handleAIBreakdown = async () => {
        setIsGeneratingSubtasks(true);
        try {
            const steps = await GeminiService.generateSubtasks(title, desc);
            const newSubs = steps.map((s, idx) => ({
                id: `ai_sub_${Date.now()}_${idx}`,
                title: s.title,
                isCompleted: false
            }));
            const updated = [...subtasks, ...newSubs];
            setSubtasks(updated);
            saveChanges({ subtasks: updated });
        } catch (e) {
            alert("Gagal membuat sub-tugas.");
        } finally {
            setIsGeneratingSubtasks(false);
        }
    };

    // Attachment Logic
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await UnifiedDataService.uploadAttachment(file);
            if (url) {
                saveChanges({ attachmentUrl: url });
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Upload gagal.");
        } finally {
            setIsUploading(false);
        }
    };

    const progress = subtasks.length > 0 
        ? Math.round((subtasks.filter(s => s.isCompleted).length / subtasks.length) * 100) 
        : 0;

    return (
        <>
            {/* Backdrop for mobile & desktop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={onClose}
            ></div>

            {/* Main Panel - Responsive: Bottom Sheet (Mobile) vs Side Panel (Desktop) */}
            <div className={`
                fixed z-[100] bg-[#0f172a]/95 backdrop-blur-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
                
                /* Mobile: Bottom Sheet */
                bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-3xl border-t border-white/10
                ${isOpen ? 'translate-y-0' : 'translate-y-full'}

                /* Desktop: Side Panel */
                md:top-0 md:bottom-0 md:left-auto md:right-0 md:h-full md:w-[600px] md:rounded-none md:border-l md:border-t-0
                md:${isOpen ? 'translate-x-0' : 'translate-x-full'}
                md:translate-y-0
            `}>
                
                {/* Mobile Handle Bar */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="h-16 border-b border-white/5 bg-white/5 flex items-center justify-between px-6 shrink-0 rounded-t-3xl md:rounded-none">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="hidden md:flex p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Icon name="X" size={24} /></button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-full border border-white/5">
                            <Icon name={task.divIcon || "CheckSquare"} size={14} className="text-brand-400" />
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{task.divName || "Task"}</span>
                        </div>
                    </div>
                    {/* Mobile Close Button (Top Right) */}
                    <button onClick={onClose} className="md:hidden p-2 bg-white/10 rounded-full text-white"><Icon name="X" size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">
                    {/* Title & Meta */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <button onClick={onToggle} className={`mt-1.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-brand-400'}`}>{task.isCompleted && <Icon name="Check" size={14} className="text-white" />}</button>
                            <input className="w-full bg-transparent text-xl md:text-2xl font-bold text-white outline-none border-none p-0 focus:ring-0" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleBlur} />
                        </div>
                        <div className="flex flex-wrap gap-3 pl-9">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${task.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-blue-500/10 border-blue-500/20 text-blue-300'}`}><Icon name="Flag" size={14} /><span className="text-xs font-bold uppercase">{task.priority} Priority</span></div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-300"><Icon name="Calendar" size={14} /><span className="text-xs font-medium">{task.dueDate || 'No Due Date'}</span></div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-300"><Icon name="User" size={14} /><span className="text-xs font-medium">{task.assigneeId ? 'Assigned' : 'Unassigned'}</span></div>
                        </div>
                    </div>

                    {/* CHECKLIST (SUBTASKS) */}
                    <div className="h-px bg-white/5 w-full"></div>
                    <div className="pl-0 md:pl-9 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Icon name="ListChecks" size={14} /> Langkah Pengerjaan ({progress}%)</h4>
                            <button 
                                onClick={handleAIBreakdown}
                                disabled={isGeneratingSubtasks} 
                                className="text-[10px] flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isGeneratingSubtasks ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="Sparkles" size={12} />}
                                AI Breakdown
                            </button>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>

                        <div className="space-y-2">
                            {subtasks.map(sub => (
                                <div key={sub.id} className="flex items-center gap-3 group">
                                    <button onClick={() => toggleSubtask(sub.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${sub.isCompleted ? 'bg-brand-500 border-brand-500' : 'border-gray-600 hover:border-brand-400'}`}>
                                        {sub.isCompleted && <Icon name="Check" size={12} className="text-white" />}
                                    </button>
                                    <span className={`flex-1 text-sm ${sub.isCompleted ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{sub.title}</span>
                                    <button onClick={() => deleteSubtask(sub.id)} className="text-gray-500 hover:text-red-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="X" size={14}/></button>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={addSubtask} className="flex items-center gap-3">
                            <Icon name="Plus" size={16} className="text-gray-500 ml-0.5" />
                            <input 
                                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                                placeholder="Tambah langkah baru..."
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            />
                        </form>
                    </div>
                    
                    {/* ATTACHMENT SECTION */}
                    <div className="h-px bg-white/5 w-full"></div>
                    <div className="pl-0 md:pl-9 space-y-3">
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
                                <button onClick={() => saveChanges({ attachmentUrl: undefined })} className="p-2 text-gray-500 hover:text-red-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="Trash2" size={16}/></button>
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
                    <div className="pl-0 md:pl-9 space-y-2"><h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Icon name="AlignLeft" size={14} /> Deskripsi</h4><textarea className="w-full min-h-[150px] bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-gray-300 focus:bg-black/40 focus:border-brand-500/50 outline-none transition-all resize-none leading-relaxed" placeholder="Tambahkan detail tugas..." value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={handleBlur} /></div>
                </div>
                
                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between safe-area-pb">
                    <button onClick={onDelete} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"><Icon name="Trash2" size={16} /> <span className="hidden md:inline">Hapus</span></button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2 text-gray-400 hover:text-white font-bold text-sm transition-colors">Tutup</button>
                        <button onClick={() => { onToggle(); onClose(); }} className={`px-5 py-2 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2 ${task.isCompleted ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'}`}><Icon name={task.isCompleted ? "RotateCcw" : "Check"} size={16} />{task.isCompleted ? 'Pending' : 'Selesai'}</button>
                    </div>
                </div>
            </div>
        </>
    );
};
