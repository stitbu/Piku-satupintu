
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { User, ChatMessage, Task, ChatGroup } from './types';
import { StorageService } from './services/storageService';
import { UnifiedDataService } from './services/UnifiedDataService'; 
import { GeminiService } from './services/geminiService';
import { LoginView } from './components/LoginView';
import { Dashboard } from './components/Dashboard';
import { MarketingDashboard } from './modules/marketing/MarketingDashboard';
import { AdminDashboard } from './modules/admin/AdminDashboard';
import { FinanceDashboard } from './modules/finance/FinanceDashboard';
import { AuditLogsView } from './components/AuditLogsView';
import { Messages } from './components/Messages';
import { AppLayout, Toast } from './components/Layout';
import { AIAssistant } from './components/AIAssistant';
import { MorningBrief } from './components/MorningBrief';
import { SettingsView } from './components/SettingsView';
import { DivisionView } from './components/DivisionView';
import { DIVISIONS } from './constants';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(StorageService.getUser());
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const [tools, setTools] = useState(StorageService.getTools());
    
    // UI States
    const [isBriefOpen, setIsBriefOpen] = useState(false);
    const [briefContent, setBriefContent] = useState('');

    // --- INITIAL DATA LOAD ---
    useEffect(() => {
        if (!user) return;
        
        const loadData = async () => {
            // Load core data from Unified Service (Supabase + Local Fallback)
            const [t, m, g] = await Promise.all([
                UnifiedDataService.getTasks(),
                UnifiedDataService.getMessages(),
                UnifiedDataService.getChatGroups()
            ]);
            
            setAllTasks(t);
            setMessages(m);
            setChatGroups(g);

            // Morning Briefing Logic (Session Based)
            const hasBriefed = sessionStorage.getItem('og_brief_done');
            if (!hasBriefed) {
                // Generate Briefing asynchronously to not block UI
                GeminiService.getStrategicBriefing(t, []).then(summary => {
                    setBriefContent(summary);
                    setIsBriefOpen(true);
                    sessionStorage.setItem('og_brief_done', 'true');
                });
            }
        };
        
        loadData();
    }, [user]);

    // --- REALTIME SUBSCRIPTIONS ---
    useEffect(() => {
        if (!user) return;
        
        // Subscribe to changes in tasks, messages, and groups
        const sub = UnifiedDataService.subscribeToUpdates(
            () => UnifiedDataService.getTasks().then(setAllTasks),
            (msg) => setMessages(prev => [...prev, msg]),
            () => UnifiedDataService.getChatGroups().then(setChatGroups)
        );
        
        return () => sub?.unsubscribe();
    }, [user]);

    // --- HANDLERS ---
    const handleLogout = () => {
        StorageService.logout();
        setUser(null);
    };

    const handleUpdateUser = (updated: User) => {
        setUser(updated);
        StorageService.saveUser(updated);
    };

    // Task Handlers Wrapper
    const handleAddTask = async (divId: any, title: string, priority: any) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            priority,
            isCompleted: false,
            creatorId: user?.id || 'sys',
            originDivisionId: divId,
            targetDivisionId: divId,
            timestamp: Date.now()
        };
        // Optimistic update
        setAllTasks(prev => [newTask, ...prev]);
        await UnifiedDataService.addTask(newTask, user?.id);
    };

    const handleToggleTask = async (divId: any, taskId: string) => {
        const t = allTasks.find(x => x.id === taskId);
        if (t) {
            const newVal = !t.isCompleted;
            setAllTasks(prev => prev.map(x => x.id === taskId ? { ...x, isCompleted: newVal } : x));
            await UnifiedDataService.updateTask(taskId, { isCompleted: newVal });
        }
    };

    const handleDeleteTask = async (divId: any, taskId: string) => {
        setAllTasks(prev => prev.filter(x => x.id !== taskId));
        await UnifiedDataService.deleteTask(taskId);
    };

    const handleUpdateTask = async (divId: any, taskId: string, updates: Partial<Task>) => {
        setAllTasks(prev => prev.map(x => x.id === taskId ? { ...x, ...updates } : x));
        await UnifiedDataService.updateTask(taskId, updates);
    };

    if (!user) return <LoginView onLogin={(u) => { StorageService.saveUser(u); setUser(u); }} />;

    // Derived Data for Dashboard
    const dashboardDivisions = DIVISIONS.map(div => ({
        ...div,
        tasks: allTasks.filter(t => t.targetDivisionId === div.id || t.originDivisionId === div.id)
    }));

    return (
        <HashRouter>
            <AppLayout user={user} theme="dark" onToggleTheme={() => {}} onLogout={handleLogout}>
                {notification && <Toast message={notification} onClose={() => setNotification(null)} />}
                
                <Routes>
                    {/* Core Dashboard */}
                    <Route path="/" element={
                        <Dashboard 
                            tools={tools} 
                            user={user} 
                            tasks={allTasks}
                            handleToolClick={() => {}} 
                            onOpenAttendance={() => {}}
                            onOpenProfile={() => {}}
                            dashboardDivisions={dashboardDivisions}
                        />
                    } />
                    
                    {/* Specialized Modules */}
                    <Route path="/marketing" element={<MarketingDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/finance" element={<FinanceDashboard />} />
                    <Route path="/audit" element={<AuditLogsView />} />
                    
                    {/* Division View (Dynamic) */}
                    <Route path="/division/:id" element={
                        <DivisionView 
                            tools={tools} 
                            user={user} 
                            handleToolClick={() => {}} 
                            onContextMenu={() => {}} 
                            onSelect={() => {}} 
                            onAddTool={() => {}} 
                            isSelectionMode={false} 
                            selectedIds={new Set()} 
                            onOpenChat={() => {}} 
                            onOpenDivisionTasks={() => {}} 
                            lang="id" 
                            tasks={allTasks} 
                            onAddTask={handleAddTask} 
                            onToggleTask={handleToggleTask} 
                            onDeleteTask={handleDeleteTask} 
                            onUpdateTask={handleUpdateTask}
                            messages={messages} 
                            onSendMessage={(c, ch) => UnifiedDataService.sendMessage({id: crypto.randomUUID(), content: c, senderId: user.id, senderName: user.name, channelId: ch, timestamp: Date.now()}, user.id)} 
                        />
                    } />

                    {/* Messages System */}
                    <Route path="/messages" element={
                        <Messages 
                            user={user} 
                            messages={messages} 
                            onSendMessage={(c, ch) => UnifiedDataService.sendMessage({id: crypto.randomUUID(), content: c, senderId: user.id, senderName: user.name, channelId: ch, timestamp: Date.now()}, user.id)} 
                            groups={chatGroups} 
                            onCreateGroup={(n, m) => UnifiedDataService.createChatGroup({id: `grp_${Date.now()}`, name: n, memberIds: m, createdBy: user.id, createdAt: Date.now()}, user.id)} 
                        />
                    } />

                    {/* Settings */}
                    <Route path="/settings" element={<SettingsView user={user} onUpdateUser={handleUpdateUser} />} />
                </Routes>

                {/* Overlays */}
                <MorningBrief isOpen={isBriefOpen} content={briefContent} onClose={() => setIsBriefOpen(false)} />
                <AIAssistant tasks={allTasks} user={user} />
            </AppLayout>
        </HashRouter>
    );
};

export default App;
