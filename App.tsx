
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import { Tool, User, Announcement, ChatMessage, AttendanceConfig, Holiday, UserPreferences, AttendanceRecord, Task, DivisionType, DivisionData, TaskPriority, ChatGroup } from './types';
import { StorageService } from './services/storageService';
import { UnifiedDataService } from './services/UnifiedDataService'; 
import { isSupabaseConfigured } from './services/supabaseClient';
import { AddToolModal } from './components/AddToolModal';
import { SmartAddModal } from './components/SmartAddModal';
import { ContextMenu } from './components/ContextMenu';
import { ToolActionModal } from './components/ToolActionModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsView } from './components/SettingsView';
import { AttendanceModal } from './components/AttendanceModal';
import { LoginView } from './components/LoginView';
import { Dashboard } from './components/Dashboard';
import { DivisionView } from './components/DivisionView';
import { Messages } from './components/Messages';
import { AppLayout, Toast } from './components/Layout';
import { QuickCommand } from './components/QuickCommand';
import { LanguageCode } from './translations';
import { DIVISIONS } from './constants';
import { NotificationService } from './services/notificationService';

// Helper for channel updates in URL
const ChannelUpdater: React.FC<{ onUpdate: (id: string) => void }> = ({ onUpdate }) => {
    const { id } = useParams<{ id: string }>();
    useEffect(() => {
        if (id) onUpdate(id);
        else onUpdate('GENERAL');
    }, [id, onUpdate]);
    return null;
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(StorageService.getUser());
    const [tools, setTools] = useState<Tool[]>(StorageService.getTools());
    
    // LOAD TASKS & MESSAGES & GROUPS VIA UNIFIED SERVICE (Initial Empty)
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
    
    const [notification, setNotification] = useState<string | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>(StorageService.getAnnouncements());
    const [attendanceConfig, setAttendanceConfig] = useState<AttendanceConfig>(StorageService.getAttendanceConfig());
    const [holidays, setHolidays] = useState<Holiday[]>(StorageService.getHolidays());
    const [preferences] = useState<UserPreferences>(StorageService.getPreferences());
    
    const lang = (preferences.language as LanguageCode) || 'en';

    // UI States
    const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number; toolId: string | null }>({ isOpen: false, x: 0, y: 0, toolId: null });
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [actionModal, setActionModal] = useState<{ isOpen: boolean; mode: 'move' | 'mirror'; toolId: string | null }>({ isOpen: false, mode: 'move', toolId: null });
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(new Set());
    const [smartAddContext, setSmartAddContext] = useState<string | null>(null);
    const [activeChatChannel, setActiveChatChannel] = useState<string>('GENERAL');
    const [isAttendanceOpen, setAttendanceOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isQuickCommandOpen, setQuickCommandOpen] = useState(false);

    // --- INITIAL DATA LOAD ---
    useEffect(() => {
        const loadData = async () => {
            // Parallel Fetch
            const [t, m, g] = await Promise.all([
                UnifiedDataService.getTasks(),
                UnifiedDataService.getMessages(),
                UnifiedDataService.getChatGroups()
            ]);
            setAllTasks(t);
            setMessages(m);
            setChatGroups(g);
        };
        loadData();
    }, []);

    // --- REAL-TIME SYNC LOGIC ---
    useEffect(() => {
        if (!user) return;

        // Mode 1: Database Realtime Subscription
        if (isSupabaseConfigured()) {
            const subscription = UnifiedDataService.subscribeToUpdates(
                () => {
                    // Task Change: Refresh all tasks
                    UnifiedDataService.getTasks().then(setAllTasks);
                },
                (newMsg) => {
                    // Message Insert: Append to state
                    setMessages(prev => [...prev, newMsg]);
                    
                    // Notification Logic
                    if (newMsg.senderId !== user.id) {
                        NotificationService.playSound();
                        if (newMsg.channelId.includes(user.id) && !newMsg.channelId.startsWith('grp_')) {
                            setNotification(`Pesan baru dari ${newMsg.senderName}`);
                        }
                    }
                },
                () => {
                    // Group Change: Refresh groups
                    UnifiedDataService.getChatGroups().then(setChatGroups);
                }
            );
            return () => { subscription?.unsubscribe(); };
        } 
        else {
            // Mode 2: LocalStorage Polling (Fallback)
            const syncInterval = setInterval(() => {
                const storedMessages = StorageService.getMessages();
                if (storedMessages.length !== messages.length) {
                    const lastMsg = storedMessages[storedMessages.length - 1];
                    setMessages(storedMessages);
                    if (lastMsg && lastMsg.senderId !== user.id) {
                        NotificationService.playSound();
                    }
                }
                const storedGroups = StorageService.getChatGroups();
                if (storedGroups.length !== chatGroups.length) setChatGroups(storedGroups);
                
                const storedTasks = StorageService.getTasks();
                if (storedTasks.length !== allTasks.length) setAllTasks(storedTasks);

            }, 2000); 
            return () => clearInterval(syncInterval);
        }
    }, [user, messages.length, chatGroups.length, allTasks.length]);

    // Derived Dashboard Divisions
    const dashboardDivisions = DIVISIONS.map(div => ({
        ...div,
        tasks: allTasks.filter(t => t.targetDivisionId === div.id || t.originDivisionId === div.id).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    }));

    // KEYBOARD SHORTCUTS
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setQuickCommandOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // BACKGROUND REMINDER CHECKER
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            NotificationService.checkReminders(allTasks, (taskId) => {
                const updatedTasks = allTasks.map(t => t.id === taskId ? { ...t, isReminded: true } : t);
                setAllTasks(updatedTasks);
                // Update remote state to prevent cross-device spam
                UnifiedDataService.updateTask(taskId, { isReminded: true });
            });
        }, 60000);
        return () => clearInterval(interval);
    }, [user, allTasks]);

    useEffect(() => { 
        const root = window.document.documentElement; 
        if (preferences.theme === 'dark') root.classList.add('dark'); 
        else root.classList.remove('dark'); 
    }, [preferences.theme]);

    const handleLogin = (loggedInUser: User) => { StorageService.saveUser(loggedInUser); setUser(loggedInUser); };
    const handleLogout = () => { StorageService.logout(); setUser(null); };
    const handleUpdateUser = (updated: User) => { setUser(updated); StorageService.saveUser(updated); setNotification("Profile updated"); };
    const handleUpdateAnnouncements = (updated: Announcement[]) => { setAnnouncements(updated); StorageService.saveAnnouncements(updated); setNotification("Announcements updated"); };
    const handleUpdateTools = (updated: Tool[]) => { setTools(updated); StorageService.saveTools(updated); setNotification("Tools updated"); };
    const handleUpdateAttendanceConfig = (updated: AttendanceConfig) => { setAttendanceConfig(updated); StorageService.saveAttendanceConfig(updated); };
    const handleUpdateHolidays = (updated: Holiday[]) => { setHolidays(updated); StorageService.saveHolidays(updated); };
    
    // --- CENTRALIZED TASK LOGIC (USING UNIFIED SERVICE) ---
    const handleAddTask = async (divId: DivisionType, title: string, priority: TaskPriority) => {
        const newTask: Task = { 
            // Generate UUID on client for optimistic updates and compatibility with Supabase UUID field
            id: crypto.randomUUID(), 
            title, 
            isCompleted: false, 
            priority,
            creatorId: user?.id || 'unknown',
            assigneeId: 'unassigned', // Default
            originDivisionId: divId,
            targetDivisionId: divId,
            timestamp: Date.now()
        };
        
        // Optimistic Update
        setAllTasks(prev => [newTask, ...prev]);
        await UnifiedDataService.addTask(newTask);
        setNotification("Tugas ditambahkan");

        // TRIGGER AUTOMATION IF HIGH PRIORITY
        const currentPrefs = StorageService.getPreferences();
        if (priority === 'high') {
            if (currentPrefs.webhookUrl) {
                NotificationService.triggerWebhook(newTask, 'created', currentPrefs.webhookUrl);
            }
            if (currentPrefs.fonnteToken && currentPrefs.whatsappNumber) {
                NotificationService.sendViaFonnte(newTask, currentPrefs.fonnteToken, currentPrefs.whatsappNumber);
            }
        }
    };

    const handleToggleTask = async (divId: DivisionType, taskId: string) => {
        const task = allTasks.find(t => t.id === taskId);
        if (task) {
            const newVal = !task.isCompleted;
            setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: newVal } : t));
            await UnifiedDataService.updateTask(taskId, { isCompleted: newVal });

            // TRIGGER AUTOMATION IF COMPLETED
            const currentPrefs = StorageService.getPreferences();
            if (newVal) {
                if (currentPrefs.webhookUrl) {
                    NotificationService.triggerWebhook({ ...task, isCompleted: true }, 'completed', currentPrefs.webhookUrl);
                }
                if (currentPrefs.fonnteToken && currentPrefs.whatsappNumber) {
                    NotificationService.sendViaFonnte({ ...task, isCompleted: true }, currentPrefs.fonnteToken, currentPrefs.whatsappNumber);
                }
            }
        }
    };

    const handleDeleteTask = async (divId: DivisionType, taskId: string) => {
        if(confirm("Hapus tugas?")) {
             setAllTasks(prev => prev.filter(t => t.id !== taskId));
             await UnifiedDataService.deleteTask(taskId);
        }
    };
    
    const handleUpdateTask = async (divId: DivisionType, taskId: string, updates: Partial<Task>) => {
        setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
        await UnifiedDataService.updateTask(taskId, updates);
    };

    // --- CENTRALIZED CHAT LOGIC ---
    const handleSendMessage = async (content: string, channelId: string = activeChatChannel) => { 
        if (!user) return; 
        const newMessage: ChatMessage = { 
            id: crypto.randomUUID(), 
            senderId: user.id, 
            senderName: user.name, 
            channelId: channelId, 
            content, 
            timestamp: Date.now() 
        }; 
        
        // Optimistic Update
        setMessages(prev => [...prev, newMessage]);
        await UnifiedDataService.sendMessage(newMessage);
    };

    const handleCreateGroup = async (name: string, members: string[]) => {
        if (!user) return;
        const newGroup: ChatGroup = {
            id: `grp_${Date.now()}`,
            name,
            memberIds: members,
            createdAt: Date.now(),
            createdBy: user.id
        };
        // Optimistic Update
        setChatGroups(prev => [...prev, newGroup]);
        await UnifiedDataService.createChatGroup(newGroup);
        
        setNotification(`Grup "${name}" berhasil dibuat!`);
        setActiveChatChannel(newGroup.id);
    };

    const handleAddTool = (newToolData: any) => { const newTool = { ...newToolData, id: `t_${Date.now()}`, lastAccessed: 0 }; const updated = [...tools, newTool]; handleUpdateTools(updated); StorageService.logActivity('Created Tool', newTool.name); };
    const handleUpdateToolSingle = (updatedData: Partial<Tool>) => { if (!updatedData.id) return; const updatedTools = tools.map(t => t.id === updatedData.id ? { ...t, ...updatedData } : t); handleUpdateTools(updatedTools); setNotification('Tool updated'); StorageService.logActivity('Updated Tool', updatedData.name || 'Unknown Tool'); };
    const handleToolClick = (tool: Tool) => { StorageService.recordAccess(tool.id); setTools(StorageService.getTools()); if (tool.url && tool.url !== '#') window.open(tool.url, '_blank'); };
    
    const handleToggleSelection = (tool: Tool) => { 
        const toolId = tool.id;
        const newSet = new Set(selectedToolIds); 
        if (newSet.has(toolId)) newSet.delete(toolId); 
        else newSet.add(toolId); 
        setSelectedToolIds(newSet); 
        setIsSelectionMode(newSet.size > 0); 
    };
    
    const handleBulkAction = (action: string) => {
        if (selectedToolIds.size === 0) return;
        if (action === 'DELETE' && confirm(`Move ${selectedToolIds.size} items to trash?`)) { 
            const updated = tools.map(t => selectedToolIds.has(t.id) ? { ...t, deletedAt: Date.now() } : t); 
            handleUpdateTools(updated); 
            setNotification("Moved to trash"); 
            setSelectedToolIds(new Set()); 
            setIsSelectionMode(false); 
            StorageService.logActivity('Bulk Delete', `Deleted ${selectedToolIds.size} items`); 
        } else if (action === 'ARCHIVE') {
            const updatedArch = tools.map(t => selectedToolIds.has(t.id) ? { ...t, isArchived: true } : t); 
            handleUpdateTools(updatedArch); 
            setNotification("Archived"); 
            setSelectedToolIds(new Set()); 
            setIsSelectionMode(false); 
        }
    };

    const handleContextMenu = (e: any, tool: Tool) => { e.preventDefault(); let x = e.touches ? e.touches[0].clientX : e.clientX; let y = e.touches ? e.touches[0].clientY : e.clientY; setContextMenu({ isOpen: true, x, y, toolId: tool.id }); };
    const executeAction = (action: string) => {
        const toolId = contextMenu.toolId; const tool = tools.find(t => t.id === toolId); setContextMenu({ ...contextMenu, isOpen: false }); if (!tool) return;
        if (tool.isLocked && ['EDIT', 'MOVE', 'MIRROR', 'ARCHIVE', 'DELETE'].includes(action)) { setNotification("Tool is locked"); return; }
        switch (action) { case 'OPEN': handleToolClick(tool); break; case 'EDIT': setEditModalOpen(true); break; case 'DELETE': if(confirm("Move to trash?")) { const updated = tools.map(t => t.id === toolId ? { ...t, deletedAt: Date.now() } : t); handleUpdateTools(updated); setNotification("Moved to trash"); } break; case 'MOVE': setActionModal({ isOpen: true, mode: 'move', toolId }); break; case 'MIRROR': setActionModal({ isOpen: true, mode: 'mirror', toolId }); break; case 'TOGGLE_LOCK': const updatedLock = tools.map(t => t.id === toolId ? { ...t, isLocked: !t.isLocked } : t); handleUpdateTools(updatedLock); break; }
    };

    if (!user) return <LoginView onLogin={handleLogin} />;

    return (
        <HashRouter>
            <AppLayout user={user} selectedCount={selectedToolIds.size} onBulkAction={handleBulkAction} onCancelSelection={() => { setSelectedToolIds(new Set()); setIsSelectionMode(false); }} lang={lang} onLogout={handleLogout}>
                {notification && <Toast message={notification} onClose={() => setNotification(null)} />}
                
                <Routes>
                    <Route path="/" element={
                        <>
                            <ChannelUpdater onUpdate={setActiveChatChannel} />
                            <Dashboard 
                                tools={tools} user={user} handleToolClick={handleToolClick} onContextMenu={handleContextMenu} onSelect={handleToggleSelection} 
                                onAddTool={handleAddTool} setNotification={setNotification} isSelectionMode={isSelectionMode} selectedIds={selectedToolIds} 
                                setSmartAddContext={setSmartAddContext}
                                onOpenAttendance={() => setAttendanceOpen(true)} onOpenProfile={() => setProfileOpen(true)} 
                                lang={lang} todayAttendance={StorageService.getTodayAttendance(user.id)} unreadAnnouncements={announcements.length} 
                                tasks={allTasks} 
                                announcements={announcements} messages={messages} onSendMessage={(msg) => handleSendMessage(msg)}
                                dashboardDivisions={dashboardDivisions}
                                onAddTask={handleAddTask} 
                                onToggleTask={handleToggleTask} 
                                onDeleteTask={handleDeleteTask}
                                onUpdateTask={handleUpdateTask}
                                activeChannel={activeChatChannel} onChangeChannel={setActiveChatChannel}
                                groups={chatGroups} 
                            />
                        </>
                    } />
                    <Route path="/division/:id" element={
                        <>
                            <ChannelUpdater onUpdate={setActiveChatChannel} />
                            <DivisionView 
                                tools={tools} user={user} handleToolClick={handleToolClick} onContextMenu={handleContextMenu} onSelect={handleToggleSelection} 
                                onAddTool={(divId) => setSmartAddContext(divId)} 
                                isSelectionMode={isSelectionMode} selectedIds={selectedToolIds} 
                                onOpenChat={(divId) => { setActiveChatChannel(divId); }} 
                                onOpenDivisionTasks={(divId) => {}}
                                lang={lang} 
                                tasks={allTasks}
                                onAddTask={handleAddTask} 
                                onToggleTask={handleToggleTask} 
                                onDeleteTask={handleDeleteTask}
                                messages={messages} 
                                onSendMessage={handleSendMessage} 
                            />
                        </>
                    } />
                    <Route path="/messages" element={
                        <Messages 
                            user={user}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            groups={chatGroups}
                            onCreateGroup={handleCreateGroup}
                        />
                    } />
                    <Route path="/settings" element={<SettingsView user={user} onUpdateUser={handleUpdateUser} tools={tools} onUpdateTools={handleUpdateTools} announcements={announcements} onUpdateAnnouncements={handleUpdateAnnouncements} attendanceConfig={attendanceConfig} onUpdateAttendanceConfig={handleUpdateAttendanceConfig} holidays={holidays} onUpdateHolidays={handleUpdateHolidays} />} />
                </Routes>

                <QuickCommand 
                    isOpen={isQuickCommandOpen} 
                    onClose={() => setQuickCommandOpen(false)} 
                    tools={tools} 
                    users={StorageService.getUsers()} 
                    divisions={DIVISIONS}
                />

                {contextMenu.isOpen && (<ContextMenu x={contextMenu.x} y={contextMenu.y} isLocked={!!tools.find(t => t.id === contextMenu.toolId)?.isLocked} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} onOpen={() => executeAction('OPEN')} onEdit={() => executeAction('EDIT')} onMove={() => executeAction('MOVE')} onMirror={() => executeAction('MIRROR')} onArchive={() => executeAction('ARCHIVE')} onDelete={() => executeAction('DELETE')} onToggleLock={() => executeAction('TOGGLE_LOCK')} />)}
                <AddToolModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSave={handleUpdateToolSingle} initialData={tools.find(t => t.id === contextMenu.toolId)} />
                <SmartAddModal isOpen={!!smartAddContext} onClose={() => setSmartAddContext(null)} onAdd={(tool) => handleAddTool(tool)} divisionName={smartAddContext || ''} />
                <ToolActionModal isOpen={actionModal.isOpen} mode={actionModal.mode} onClose={() => setActionModal({ ...actionModal, isOpen: false })} onConfirm={(div, cat) => { const updated = tools.map(t => t.id === actionModal.toolId ? { ...t, divisionId: div, category: cat } : t); if (actionModal.mode === 'mirror') { const original = tools.find(t => t.id === actionModal.toolId); if(original) updated.push({ ...original, id: `t_${Date.now()}`, divisionId: div, category: cat }); } handleUpdateTools(updated); setActionModal({ ...actionModal, isOpen: false }); setNotification("Action successful"); StorageService.logActivity(actionModal.mode === 'mirror' ? 'Mirror Tool' : 'Move Tool', tools.find(t => t.id === actionModal.toolId)?.name || 'Unknown'); }} />
                <AttendanceModal isOpen={isAttendanceOpen} onClose={() => setAttendanceOpen(false)} user={user} />
                <ProfileModal isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} user={user} onUpdateUser={handleUpdateUser} announcements={announcements} onLogout={handleLogout} />
            </AppLayout>
        </HashRouter>
    );
};

export default App;