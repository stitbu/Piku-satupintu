
import React from 'react';
import { Task } from '../types';
import { Icon } from './Icon';

interface TaskTickerProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export const TaskTicker: React.FC<TaskTickerProps> = ({ tasks, onTaskClick }) => {
  // Filter only incomplete High Priority tasks
  const urgentTasks = tasks.filter(t => !t.isCompleted && t.priority === 'high');

  if (urgentTasks.length === 0) return null;

  return (
    <div className="w-full bg-red-500/10 border-y border-red-500/20 backdrop-blur-sm h-8 overflow-hidden flex items-center relative z-10">
      <div className="bg-red-600 text-white px-3 h-full flex items-center text-[10px] font-bold uppercase tracking-wider shrink-0 z-20 shadow-lg">
        <Icon name="AlertTriangle" size={12} className="mr-1" /> Urgent
      </div>
      
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        {/* CSS Animation for infinite scroll */}
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 px-4">
          {urgentTasks.map((task, index) => (
            <button 
              key={task.id}
              onClick={() => onTaskClick && onTaskClick(task.id)}
              className="inline-flex items-center gap-2 text-xs text-red-200 hover:text-white transition-colors cursor-pointer group"
            >
              <span className="font-bold text-white group-hover:underline">{task.title}</span>
              <span className="text-[10px] opacity-70">
                 (to {task.assigneeId ? 'Assignee' : 'Team'})
              </span>
              {index !== urgentTasks.length - 1 && <span className="text-red-500/30 mx-2">•</span>}
            </button>
          ))}
          {/* Duplicate for seamless loop if needed, essentially handled by CSS usually or just duplicate array */}
          {urgentTasks.map((task, index) => (
            <button 
              key={`${task.id}-dup`}
              onClick={() => onTaskClick && onTaskClick(task.id)}
              className="inline-flex items-center gap-2 text-xs text-red-200 hover:text-white transition-colors cursor-pointer group"
            >
              <span className="font-bold text-white group-hover:underline">{task.title}</span>
              <span className="text-[10px] opacity-70">
                 (to {task.assigneeId ? 'Assignee' : 'Team'})
              </span>
              {index !== urgentTasks.length - 1 && <span className="text-red-500/30 mx-2">•</span>}
            </button>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
