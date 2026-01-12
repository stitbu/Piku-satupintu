
import React from 'react';
import { User, Task, DivisionType } from '../types';
import { Icon } from './Icon';
import { TaskBoard } from './TaskBoard';
import { translations, LanguageCode } from '../translations';
import { StorageService } from '../services/storageService';
import { DIVISIONS } from '../constants';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  tasks: Task[];
  onAdd: (task: Task) => void;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  divisionContext: DivisionType | null; 
}

export const TasksModal: React.FC<TasksModalProps> = ({ 
    isOpen, onClose, user, tasks, onAdd, onToggle, onDelete, divisionContext 
}) => {
    const prefs = StorageService.getPreferences();
    const t = translations[prefs.language as LanguageCode] || translations.en;
    
    if (!isOpen) return null;

    const divisionName = divisionContext ? DIVISIONS.find(d => d.id === divisionContext)?.name : '';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 shrink-0 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${divisionContext ? 'bg-indigo-500 text-white' : 'bg-brand-500 text-white'}`}>
                            <Icon name={divisionContext ? "Users" : "CheckSquare"} size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {divisionContext ? `${divisionName}` : t.tasks.title}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {divisionContext ? 'Team Workload Overview' : 'Manage daily activities & requests'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><Icon name="X" size={20}/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <TaskBoard 
                        user={user} 
                        tasks={tasks} 
                        onAdd={onAdd} 
                        onToggle={onToggle} 
                        onDelete={onDelete} 
                        divisionContext={divisionContext} 
                    />
                </div>
            </div>
        </div>
    );
};
