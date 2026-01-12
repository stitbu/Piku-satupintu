
import React, { useState } from 'react';
import { DivisionData, DivisionType } from '../types';
import { Icon } from './Icon';

interface TaskSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  divisions: DivisionData[];
  onToggleTask: (divisionId: DivisionType, taskId: string) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ isOpen, onClose, divisions, onToggleTask }) => {
    const [expandedDivisions, setExpandedDivisions] = useState<Set<DivisionType>>(new Set());

    const toggleDivision = (id: DivisionType) => {
        const newSet = new Set(expandedDivisions);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedDivisions(newSet);
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-80 bg-[#0f172a]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-[80] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                        <Icon name="CheckSquare" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">Task Center</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <Icon name="X" size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {divisions.map(div => {
                    const isExpanded = expandedDivisions.has(div.id);
                    const pendingCount = div.tasks.filter(t => !t.isCompleted).length;

                    return (
                        <div key={div.id} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden transition-all">
                            <button 
                                onClick={() => toggleDivision(div.id)}
                                className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-md bg-gray-800 border border-white/10 text-gray-300`}>
                                        <Icon name={div.icon} size={14} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-200">{div.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {pendingCount > 0 && (
                                        <span className="text-[10px] font-bold bg-brand-500 text-white px-1.5 py-0.5 rounded-full">
                                            {pendingCount}
                                        </span>
                                    )}
                                    <Icon name="ChevronDown" size={16} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="p-4 pt-0 space-y-2 border-t border-white/5 animate-[fadeIn_0.2s]">
                                    <div className="h-2"></div>
                                    {div.tasks.length === 0 && <p className="text-xs text-gray-500 text-center italic">No active tasks.</p>}
                                    {div.tasks.map(task => (
                                        <div 
                                            key={task.id} 
                                            className={`flex items-start gap-3 p-2 rounded-lg transition-all group ${task.isCompleted ? 'opacity-50' : 'hover:bg-white/5'}`}
                                        >
                                            <button 
                                                onClick={() => onToggleTask(div.id, task.id)}
                                                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-brand-400'}`}
                                            >
                                                {task.isCompleted && <Icon name="Check" size={10} className="text-white" />}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium leading-snug ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                    {task.title}
                                                </p>
                                                {task.priority === 'high' && !task.isCompleted && (
                                                    <span className="inline-block mt-1 text-[9px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                        High Priority
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0f172a]/50 shrink-0 text-center">
                <p className="text-[10px] text-gray-500">Updates reflect on team dashboards instantly.</p>
            </div>
        </div>
    );
};