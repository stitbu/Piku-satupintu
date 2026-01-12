
import React from 'react';
import { Task } from '../types';
import { Icon } from './Icon';

interface TaskItemProps { 
    task: Task & { divName?: string; divIcon?: string }; 
    onToggle: () => void; 
    onSelect: () => void; 
    onDelete: () => void; 
    onDiscuss: () => void;
    onWhatsApp: () => void;
    onReminder: () => void;
    showDivisionBadge?: boolean;
    divisionName?: string;
    divisionIcon?: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
    task, onToggle, onSelect, onDelete, onDiscuss, onWhatsApp, onReminder, 
    showDivisionBadge, divisionName, divisionIcon 
}) => {
    const isOverdue = !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
    
    // Subtask progress calculation
    const totalSub = task.subtasks?.length || 0;
    const completedSub = task.subtasks?.filter(s => s.isCompleted).length || 0;
    const progress = totalSub > 0 ? (completedSub / totalSub) * 100 : 0;

    return (
        <div 
            onClick={onSelect}
            className={`group relative flex flex-col p-5 rounded-[2rem] transition-all border shadow-2xl hover:shadow-pk-500/10 hover:-translate-y-1.5 duration-300 cursor-pointer overflow-hidden
                ${task.isCompleted ? 'bg-white/5 opacity-40 grayscale border-white/5' : 'bg-slate-900/80 hover:bg-slate-900 border-white/10'} 
                ${isOverdue ? 'border-l-4 border-l-red-600' : ''}
            `}
        >
            {/* Subtask Progress Background */}
            {!task.isCompleted && totalSub > 0 && (
                <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-500/10 w-full overflow-hidden">
                    <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
            )}

            <div className="flex items-start gap-5 relative z-10">
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggle(); }} 
                    className={`mt-1.5 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 shadow-lg
                        ${task.isCompleted 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'bg-black/50 border-slate-600 hover:border-pk-400 group-hover:bg-black/70 group-hover:scale-110'
                        }`}
                >
                    {task.isCompleted && <Icon name="Check" size={16} className="text-slate-950 stroke-[4]" />}
                </button>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                        <p className={`text-base font-bold leading-snug mb-3 line-clamp-2 tracking-tight ${task.isCompleted ? 'text-slate-500 line-through font-medium' : 'text-slate-100 group-hover:text-white'}`}>
                            {task.title}
                        </p>
                        {task.assigneeId && (
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-black text-white shrink-0 border border-white/10 shadow-xl italic">
                                {task.assigneeId.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2.5 items-center">
                        {totalSub > 0 && (
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${progress === 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'}`}>
                                <Icon name="ListChecks" size={12} /> {completedSub}/{totalSub}
                            </span>
                        )}

                        {task.priority !== 'medium' && !task.isCompleted && (
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${task.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                                {task.priority}
                            </span>
                        )}

                        {(showDivisionBadge || divisionName) && (
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 uppercase tracking-[0.2em]">
                                {divisionIcon && <Icon name={divisionIcon} size={11} />}
                                {divisionName || task.divName}
                            </span>
                        )}

                         {task.dueDate && (
                             <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg ${isOverdue ? 'text-red-400 bg-red-900/20 border-red-500/20' : 'text-slate-500 bg-black/20 border border-white/5'}`}>
                                 <Icon name="Calendar" size={11} /> {task.dueDate}
                             </span>
                         )}
                    </div>
                </div>
                
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
                    <button onClick={onWhatsApp} className="w-10 h-10 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl"><Icon name="MessageCircle" size={20} /></button>
                    <button onClick={onDiscuss} className="w-10 h-10 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl"><Icon name="MessageSquare" size={20} /></button>
                    <button onClick={onDelete} className="w-10 h-10 bg-red-600/90 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl"><Icon name="Trash2" size={20} /></button>
                </div>
            </div>
        </div>
    );
};
