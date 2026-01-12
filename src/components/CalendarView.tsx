
import React, { useState, useMemo } from 'react';
import { Task, TaskPriority } from '../types';
import { Icon } from './Icon';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday

  // Adjust so Monday is first day if desired, but standard is Sunday 0
  const startOffset = firstDay; 

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const getPriorityColor = (p: TaskPriority) => {
      switch(p) {
          case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
          case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
          default: return 'bg-gray-600/20 text-gray-300';
      }
  };

  const tasksByDate = useMemo(() => {
      const map: Record<number, Task[]> = {};
      tasks.forEach(t => {
          if (!t.dueDate) return;
          const d = new Date(t.dueDate);
          if (d.getFullYear() === year && d.getMonth() === month) {
              const day = d.getDate();
              if (!map[day]) map[day] = [];
              map[day].push(t);
          }
      });
      return map;
  }, [tasks, year, month]);

  const renderDays = () => {
      const slots = [];
      // Empty slots for previous month
      for (let i = 0; i < startOffset; i++) {
          slots.push(<div key={`empty-${i}`} className="bg-white/5 border border-white/5 opacity-50 min-h-[100px]"></div>);
      }

      // Days
      for (let day = 1; day <= daysInMonth; day++) {
          const dayTasks = tasksByDate[day] || [];
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

          slots.push(
              <div key={day} className={`bg-white/5 border border-white/5 min-h-[100px] p-2 flex flex-col gap-1 transition-colors hover:bg-white/10 ${isToday ? 'bg-brand-500/10 border-brand-500/30' : ''}`}>
                  <div className="flex justify-between items-start">
                      <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-500 text-white' : 'text-gray-400'}`}>{day}</span>
                      {dayTasks.length > 0 && <span className="text-[10px] text-gray-500">{dayTasks.length}</span>}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                      {dayTasks.map(t => (
                          <button 
                            key={t.id} 
                            onClick={(e) => { e.stopPropagation(); onTaskClick(t); }}
                            className={`text-[9px] text-left px-1.5 py-1 rounded border truncate w-full ${t.isCompleted ? 'opacity-50 line-through grayscale' : ''} ${getPriorityColor(t.priority)}`}
                            title={t.title}
                          >
                              {t.title}
                          </button>
                      ))}
                  </div>
              </div>
          );
      }
      return slots;
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1120]/60 rounded-3xl border border-white/5 overflow-hidden animate-[fadeIn_0.3s]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">{monthNames[month]} {year}</h2>
              <div className="flex gap-1 bg-black/30 p-1 rounded-lg">
                  <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Icon name="ChevronLeft" size={20} /></button>
                  <button onClick={goToday} className="px-3 py-1 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded">Today</button>
                  <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Icon name="ChevronRight" size={20} /></button>
              </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> High</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Med</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Low</span>
          </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-black/20">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
          ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto custom-scrollbar bg-black/10">
          {renderDays()}
      </div>
    </div>
  );
};
