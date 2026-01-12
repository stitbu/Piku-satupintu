
import React, { useState, useEffect } from 'react';
import { User, Task, TaskPriority, DivisionType, UserRole } from '../types';
import { Icon } from './Icon';
import { StorageService } from '../services/storageService';
import { translations, LanguageCode } from '../translations';
import { DIVISIONS } from '../constants';

interface TaskBoardProps {
  user: User;
  tasks: Task[];
  onAdd: (task: Task) => void;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  divisionContext: DivisionType | null; 
  isEmbedded?: boolean; // New prop to style differently if embedded in page vs modal
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ 
    user, tasks, onAdd, onToggle, onDelete, divisionContext, isEmbedded = false
}) => {
    const [activeTab, setActiveTab] = useState<'my_tasks' | 'delegated' | 'incoming'>('my_tasks');
    
    // Add Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTargetDivision, setNewTaskTargetDivision] = useState<DivisionType>(user.division);
    const [newTaskAssignee, setNewTaskAssignee] = useState(user.id);
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
    
    // Team Data
    const [teamUsers, setTeamUsers] = useState<User[]>([]);

    const prefs = StorageService.getPreferences();
    const t = translations[prefs.language as LanguageCode] || translations.en;

    useEffect(() => {
        setTeamUsers(StorageService.getUsers());
        if (!divisionContext) {
            setNewTaskAssignee(user.id);
            setNewTaskTargetDivision(user.division);
        }
    }, [user.id, user.division, divisionContext]);

    // Update Assignee List when Target Division Changes
    useEffect(() => {
        const potentialAssignees = teamUsers.filter(u => u.division === newTaskTargetDivision);
        if (potentialAssignees.length > 0) {
            const manager = potentialAssignees.find(u => u.role === UserRole.MANAGER);
            setNewTaskAssignee(manager ? manager.id : potentialAssignees[0].id);
        } else if (newTaskTargetDivision === user.division) {
            setNewTaskAssignee(user.id);
        } else {
            setNewTaskAssignee('');
        }
    }, [newTaskTargetDivision, teamUsers, user.id, user.division]);

    // --- LOGIC ---
    const isDivisionView = !!divisionContext;
    const divisionUsers = isDivisionView 
        ? teamUsers.filter(u => u.division === divisionContext) 
        : [];

    const myTasks = tasks.filter(t => t.assigneeId === user.id);
    const delegatedTasks = tasks.filter(t => t.creatorId === user.id && t.assigneeId !== user.id);
    const incomingRequests = tasks.filter(t => t.targetDivisionId === user.division && t.originDivisionId !== user.division);

    const displayTasksStandard = activeTab === 'my_tasks' ? myTasks : (activeTab === 'delegated' ? delegatedTasks : incomingRequests);
    const canSeeIncoming = user.role === UserRole.MANAGER || user.role === UserRole.ADMIN;

    const handleAddTask = (e: React.FormEvent, specificAssignee?: string) => {
        e.preventDefault();
        if(!newTaskTitle.trim()) return;

        const assigneeId = specificAssignee || newTaskAssignee;

        const newTask: Task = {
            id: `tsk_${Date.now()}`,
            title: newTaskTitle,
            creatorId: user.id,
            assigneeId: assigneeId,
            priority: newTaskPriority,
            isCompleted: false,
            originDivisionId: user.division,
            targetDivisionId: isDivisionView ? divisionContext : newTaskTargetDivision
        };

        onAdd(newTask);
        setNewTaskTitle('');
    };

    const getPriorityColor = (p: TaskPriority) => {
        switch(p) {
            case 'high': return 'bg-red-500 text-white';
            case 'medium': return 'bg-amber-500 text-white';
            case 'low': return 'bg-blue-500 text-white';
        }
    };

    const getAssigneeName = (id: string) => {
        const u = teamUsers.find(u => u.id === id);
        return u ? u.name : 'Unknown';
    };

    const getDivisionName = (id?: string) => {
        return DIVISIONS.find(d => d.id === id)?.name || id;
    };

    // --- RENDER LIST ITEM ---
    const renderTaskList = (taskList: Task[], showAssigneeName: boolean = false, showOrigin: boolean = false) => (
        <div className="space-y-2">
            {taskList.length === 0 && <p className="text-xs text-gray-400 italic pl-2">No tasks</p>}
            {taskList.sort((a,b) => Number(a.isCompleted) - Number(b.isCompleted)).map(task => (
                <div key={task.id} className={`group flex items-start gap-2 p-3 rounded-lg border transition-all duration-300 ${task.isCompleted ? 'bg-gray-100 dark:bg-white/5 border-transparent opacity-60' : 'bg-white dark:bg-dark-card border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md'}`}>
                    <button 
                        onClick={() => onToggle(task.id)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-500 hover:border-brand-500'}`}
                    >
                        {task.isCompleted && <Icon name="Check" size={10} className="text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <p className={`text-xs font-medium transition-all ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-white'}`}>
                                {task.title}
                            </p>
                            {showOrigin && task.originDivisionId && (
                                <span className="text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded font-bold border border-purple-500/20 whitespace-nowrap ml-2">
                                    {t.tasks.from} {getDivisionName(task.originDivisionId)}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] px-1 rounded font-bold uppercase ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                            {showAssigneeName && (
                                <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                                    <Icon name="ArrowRight" size={8} /> {getAssigneeName(task.assigneeId)}
                                </span>
                            )}
                        </div>
                    </div>

                    <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="Trash2" size={14} />
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className={`flex flex-col h-full ${isEmbedded ? '' : 'overflow-hidden'}`}>
            
            {/* Header / Tabs (Only show tabs in global mode or if embedded switcher is handled by parent) */}
            {!isDivisionView && (
                <div className="flex gap-2 p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 shrink-0">
                    <button onClick={() => setActiveTab('my_tasks')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'my_tasks' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                        <Icon name="User" size={16} /> {t.tasks.myTasks}
                        <span className="bg-white/20 px-1.5 rounded-full text-[10px]">{myTasks.filter(t => !t.isCompleted).length}</span>
                    </button>
                    <button onClick={() => setActiveTab('delegated')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'delegated' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                        <Icon name="Users" size={16} /> {t.tasks.delegated}
                        <span className="bg-white/20 px-1.5 rounded-full text-[10px]">{delegatedTasks.filter(t => !t.isCompleted).length}</span>
                    </button>
                    {canSeeIncoming && (
                        <button onClick={() => setActiveTab('incoming')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'incoming' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                            <Icon name="Inbox" size={16} /> <span className="hidden md:inline">{t.tasks.incoming}</span>
                            <span className="bg-white/20 px-1.5 rounded-full text-[10px]">{incomingRequests.filter(t => !t.isCompleted).length}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${isEmbedded ? '' : 'bg-gray-50/50 dark:bg-transparent'}`}>
                
                {/* --- DIVISION VIEW (GRID) --- */}
                {isDivisionView ? (
                    <div className={`${isEmbedded ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}`}>
                        {divisionUsers.map(member => (
                            <div key={member.id} className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden h-fit shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800 dark:text-white">{member.name}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">{member.role}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setNewTaskAssignee(member.id)} 
                                        className={`p-1.5 rounded-lg transition-colors ${newTaskAssignee === member.id ? 'bg-brand-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400'}`}
                                        title="Assign task"
                                    >
                                        <Icon name="Plus" size={14} />
                                    </button>
                                </div>
                                <div className="p-3">
                                    {newTaskAssignee === member.id && (
                                        <form onSubmit={(e) => handleAddTask(e, member.id)} className="mb-3 flex gap-2 animate-[fadeIn_0.2s]">
                                            <input 
                                                autoFocus
                                                className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                                                placeholder="Task name..."
                                                value={newTaskTitle}
                                                onChange={e => setNewTaskTitle(e.target.value)}
                                            />
                                            <button type="submit" className="p-1.5 bg-brand-600 text-white rounded-lg"><Icon name="ArrowRight" size={12}/></button>
                                        </form>
                                    )}
                                    {renderTaskList(tasks.filter(t => t.assigneeId === member.id))}
                                </div>
                            </div>
                        ))}
                        {divisionUsers.length === 0 && <p className="text-center text-gray-500 col-span-full">No members found in this division.</p>}
                    </div>
                ) : (
                /* --- STANDARD VIEW (LIST) --- */
                    <div>
                        {displayTasksStandard.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <Icon name="ClipboardList" size={48} className="mx-auto mb-2 opacity-20" />
                                <p>{t.tasks.noTasks}</p>
                            </div>
                        )}
                        {renderTaskList(displayTasksStandard, activeTab === 'delegated', activeTab === 'incoming')}
                    </div>
                )}
            </div>

            {/* Footer Input (Global Mode) */}
            {!isDivisionView && (
                <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-white/5 shrink-0 z-10">
                    <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <input 
                                type="text"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                placeholder={t.tasks.placeholder}
                                className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                            <button type="submit" disabled={!newTaskTitle} className="p-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg transition-all">
                                <Icon name="Plus" size={20} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                            <div className="flex items-center bg-gray-50 dark:bg-black/20 rounded-lg p-1 border border-gray-200 dark:border-white/10">
                                {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                                    <button key={p} type="button" onClick={() => setNewTaskPriority(p)} className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${newTaskPriority === p ? getPriorityColor(p) : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`} title={p}>
                                        <div className={`w-2 h-2 rounded-full ${newTaskPriority === p ? 'bg-white' : 'bg-current'}`}></div>
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex-1 min-w-[120px]">
                                <select value={newTaskTargetDivision} onChange={e => setNewTaskTargetDivision(e.target.value as DivisionType)} className="w-full appearance-none bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-brand-500">
                                    {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <Icon name="ChevronDown" size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                            <div className="relative flex-1 min-w-[120px]">
                                <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} className="w-full appearance-none bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-brand-500">
                                    {teamUsers.filter(u => u.division === newTaskTargetDivision).map(u => (<option key={u.id} value={u.id}>{u.name} ({u.role})</option>))}
                                    {teamUsers.filter(u => u.division === newTaskTargetDivision).length === 0 && <option value="">No users</option>}
                                </select>
                                <Icon name="ChevronDown" size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
