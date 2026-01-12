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
    
    // Helper to get initials or avatar mock
    const getAssigneeVisual = (id?: string) => {
        if (!id || id === 'unassigned') return null;
        return (
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] text-white font-bold border border-white/10 shadow-sm" title="Assignee">
                {id.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div 
            onClick={onSelect}
            className={`group flex flex-col p-3.5 rounded-2xl transition-all border border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 duration-200 cursor-pointer relative overflow-hidden
                ${task.isCompleted ? 'bg-white/5 opacity-60 grayscale' : 'bg-[#1e293b]/80 hover:bg-[#1e293b]'} 
                ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
            `}
        >
            <div className="flex items-start gap-3 relative z-10">
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggle(); }} 
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 shadow-inner
                        ${task.isCompleted 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'bg-black/20 border-gray-600 hover:border-brand-400 group-hover:bg-black/40'
                        }`}
                >
                    {task.isCompleted && <Icon name="Check" size={12} className="text-white stroke-[3]" />}
                </button>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <p className={`text-xs font-medium leading-relaxed mb-1.5 line-clamp-2 ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white'}`} title={task.title}>
                            {task.title}
                        </p>
                        {getAssigneeVisual(task.assigneeId)}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        {task.priority !== 'medium' && !task.isCompleted && (
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${task.priority === 'high' ? 'text-red-300 bg-red-500/10 border-red-500/20' : 'text-blue-300 bg-blue-500/10 border-blue-500/20'}`}>
                                {task.priority}
                            </span>
                        )}

                        {(showDivisionBadge || divisionName) && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                {divisionIcon && <Icon name={divisionIcon} size={8} />}
                                {divisionName || task.divName}
                            </span>
                        )}

                         {task.dueDate && (
                             <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded ${isOverdue ? 'text-red-400 bg-red-900/20' : 'text-gray-500 bg-black/20'}`}>
                                 <Icon name="Calendar" size={8} /> {task.dueDate}
                             </span>
                         )}
                         
                         {task.isReminded && (
                             <Icon name="Bell" size={10} className="text-amber-500" />
                         )}
                    </div>
                </div>
                
                <div className="absolute right-2 top-2 bottom-2 w-10 flex flex-col gap-1 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
                    <button onClick={onWhatsApp} className="w-7 h-7 bg-black/60 hover:bg-green-600 text-green-400 hover:text-white rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors shadow-lg" title="WA"><Icon name="MessageCircle" size={14} /></button>
                    <button onClick={onDiscuss} className="w-7 h-7 bg-black/60 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors shadow-lg" title="Chat"><Icon name="MessageSquare" size={14} /></button>
                    <button onClick={onDelete} className="w-7 h-7 bg-black/60 hover:bg-red-600 text-red-400 hover:text-white rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors shadow-lg" title="Delete"><Icon name="Trash2" size={14} /></button>
                </div>
            </div>
        </div>
    );
};