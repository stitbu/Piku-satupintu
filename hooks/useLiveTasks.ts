import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, DivisionType, TaskPriority } from '../types';
import { StorageService } from '../services/storageService';
import { DIVISIONS } from '../constants';

export const useLiveTasks = () => {
  // 1. LOAD: Baca dari storage hanya SEKALI saat awal load
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());

  // 2. SYNC: Setiap kali state 'tasks' berubah, simpan ke Storage
  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);

  // 3. MAP: Gabungkan data DIVISIONS (statis) dengan Tasks (dinamis)
  const divisionsWithTasks = useMemo(() => {
    return DIVISIONS.map(div => ({
      ...div,
      // Filter tugas milik divisi ini
      tasks: tasks.filter(t => {
          // Cek target division, fallback ke origin division
          const taskDiv = t.targetDivisionId || t.originDivisionId;
          return taskDiv === div.id;
      }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) // Urutkan task baru di atas
    }));
  }, [tasks]);

  // 4. ACTIONS (Optimistic Updates)
  
  const addNewTask = useCallback((divId: DivisionType, text: string, priority: TaskPriority, dueDate: string) => {
    const newTask: Task = {
      id: `t_${Date.now()}`,
      title: text,
      isCompleted: false,
      priority: priority,
      dueDate: dueDate,
      originDivisionId: divId,
      targetDivisionId: divId, 
      creatorId: 'current_user',
      assigneeId: 'unassigned',
      timestamp: Date.now()
    };

    // UPDATE STATE LANGSUNG -> UI Berubah Detik Ini Juga
    setTasks(prev => [newTask, ...prev]); 
  }, []);

  const toggleTask = useCallback((divId: DivisionType, taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  }, []);

  const deleteTask = useCallback((divId: DivisionType, taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  return {
    allTasks: tasks,          // Raw list untuk Ticker
    divisionsWithTasks,       // Structured list untuk Accordion
    addNewTask,
    toggleTask,
    deleteTask
  };
};