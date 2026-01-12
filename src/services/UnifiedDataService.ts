
import { StorageService } from './storageService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Task, ChatMessage, ChatGroup } from '../types';

export const UnifiedDataService = {
    
    // --- TASKS ---
    
    getTasks: async (): Promise<Task[]> => {
        // Fallback langsung jika Supabase belum dikonfigurasi
        if (!isSupabaseConfigured()) {
            return StorageService.getTasks();
        }

        try {
            const { data, error } = await supabase!
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });
            
            // Jika ada error dari Supabase (misal tabel tidak ada), fallback ke local
            if (error) {
                // console.warn("Supabase Fetch Error (Tasks), falling back to local:", error.message);
                return StorageService.getTasks();
            }
            
            // Map DB columns (snake_case) to Frontend Types (camelCase)
            return (data || []).map((d: any) => ({
                id: d.id,
                title: d.title,
                isCompleted: d.is_completed,
                priority: d.priority,
                creatorId: d.creator_id,
                assigneeId: d.assignee_id,
                originDivisionId: d.origin_division_id,
                targetDivisionId: d.target_division_id,
                dueDate: d.due_date,
                reminderAt: d.reminder_at,
                isReminded: d.is_reminded,
                attachmentUrl: d.attachment_url,
                subtasks: d.subtasks || [],
                timestamp: d.created_at ? new Date(d.created_at).getTime() : Date.now()
            }));
        } catch (err) {
            // CATCH ALL: Network errors (Failed to fetch), DNS errors, etc.
            // Ini mencegah app crash/putih saat offline atau koneksi buruk
            // console.warn("Network Error / Offline Mode active for Tasks");
            return StorageService.getTasks();
        }
    },

    addTask: async (task: Task, userId?: string) => {
        // ALWAYS update local storage immediately for UI responsiveness
        const current = StorageService.getTasks();
        StorageService.saveTasks([task, ...current]);

        if (isSupabaseConfigured()) {
            try {
                await supabase!.from('tasks').insert([{
                    id: task.id,
                    title: task.title,
                    is_completed: task.isCompleted,
                    priority: task.priority,
                    creator_id: task.creatorId,
                    assignee_id: task.assigneeId,
                    origin_division_id: task.originDivisionId,
                    target_division_id: task.targetDivisionId,
                    due_date: task.dueDate,
                    reminder_at: task.reminderAt,
                    is_reminded: task.isReminded,
                    attachment_url: task.attachmentUrl,
                    subtasks: task.subtasks || [],
                    created_at: new Date(task.timestamp || Date.now()).toISOString()
                }]);
            } catch (err) {
                // Ignore network errors for background sync logic
            }
        }
    },

    updateTask: async (taskId: string, updates: Partial<Task>, userId?: string) => {
        // Local Update
        const current = StorageService.getTasks();
        const updated = current.map(t => t.id === taskId ? { ...t, ...updates } : t);
        StorageService.saveTasks(updated);

        if (isSupabaseConfigured()) {
            try {
                const dbUpdates: any = {};
                if (updates.title !== undefined) dbUpdates.title = updates.title;
                if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
                if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
                if (updates.assigneeId !== undefined) dbUpdates.assignee_id = updates.assigneeId;
                if (updates.isReminded !== undefined) dbUpdates.is_reminded = updates.isReminded;
                if (updates.reminderAt !== undefined) dbUpdates.reminder_at = updates.reminderAt;
                if (updates.attachmentUrl !== undefined) dbUpdates.attachment_url = updates.attachmentUrl;
                if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
                
                await supabase!.from('tasks').update(dbUpdates).eq('id', taskId);
            } catch (err) {
                // Ignore
            }
        }
    },

    deleteTask: async (taskId: string, userId?: string) => {
        // Local Delete
        const current = StorageService.getTasks();
        StorageService.saveTasks(current.filter(t => t.id !== taskId));

        if (isSupabaseConfigured()) {
            try {
                await supabase!.from('tasks').delete().eq('id', taskId);
            } catch (err) {
                // Ignore
            }
        }
    },

    // --- FILE UPLOAD ---
    uploadAttachment: async (file: File): Promise<string | null> => {
        if (!isSupabaseConfigured()) {
            alert("Mode Offline: Upload file hanya tersedia jika terhubung ke Database Cloud.");
            return null;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase!.storage
                .from('task-attachments')
                .upload(filePath, file);

            if (uploadError) return null;

            const { data } = supabase!.storage
                .from('task-attachments')
                .getPublicUrl(filePath);

            return data.publicUrl;

        } catch (e) {
            return null;
        }
    },

    // --- CHAT MESSAGES ---

    getMessages: async (): Promise<ChatMessage[]> => {
        if (!isSupabaseConfigured()) return StorageService.getMessages();

        try {
            const { data, error } = await supabase!
                .from('chat_messages')
                .select('*')
                .order('timestamp', { ascending: true })
                .limit(500); 
            
            if (error) return StorageService.getMessages();

            if (data) {
                return data.map((d: any) => ({
                    id: d.id,
                    content: d.content,
                    senderId: d.sender_id,
                    senderName: d.sender_name,
                    channelId: d.channel_id,
                    timestamp: d.timestamp
                }));
            }
            return StorageService.getMessages();
        } catch (err) {
            return StorageService.getMessages();
        }
    },

    sendMessage: async (msg: ChatMessage, userId?: string) => {
        const current = StorageService.getMessages();
        StorageService.saveMessages([...current, msg]);

        if (isSupabaseConfigured()) {
            try {
                await supabase!.from('chat_messages').insert([{
                    id: msg.id,
                    content: msg.content,
                    sender_id: msg.senderId,
                    sender_name: msg.senderName,
                    channel_id: msg.channelId,
                    timestamp: msg.timestamp
                }]);
            } catch (err) {
                // Ignore
            }
        }
    },

    // --- CHAT GROUPS ---

    getChatGroups: async (): Promise<ChatGroup[]> => {
        if (!isSupabaseConfigured()) return StorageService.getChatGroups();

        try {
            const { data, error } = await supabase!
                .from('chat_groups')
                .select('*');
            
            if (error) return StorageService.getChatGroups();

            if (data) {
                return data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    memberIds: d.member_ids,
                    createdBy: d.created_by,
                    createdAt: d.created_at
                }));
            }
            return StorageService.getChatGroups();
        } catch (err) {
            return StorageService.getChatGroups();
        }
    },

    createChatGroup: async (group: ChatGroup, userId?: string) => {
        StorageService.createChatGroup(group);

        if (isSupabaseConfigured()) {
            try {
                await supabase!.from('chat_groups').insert([{
                    id: group.id,
                    name: group.name,
                    member_ids: group.memberIds,
                    created_by: group.createdBy,
                    created_at: group.createdAt
                }]);
            } catch (err) {
                // Ignore
            }
        }
    },

    // --- REALTIME SUBSCRIPTIONS ---
    
    subscribeToUpdates: (
        onTaskChange: () => void, 
        onMessageInsert: (newMsg: ChatMessage) => void,
        onGroupChange: () => void
    ) => {
        if (!isSupabaseConfigured()) return null;

        try {
            const channel = supabase!.channel('db-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => onTaskChange())
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
                    const d = payload.new;
                    onMessageInsert({
                        id: d.id, content: d.content, senderId: d.sender_id,
                        senderName: d.sender_name, channelId: d.channel_id, timestamp: d.timestamp
                    });
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_groups' }, () => onGroupChange())
                .subscribe();

            return channel;
        } catch (err) {
            return null;
        }
    },

    // Audit Log Mock
    logSystemActivity: async (userId: string, action: string, metadata: any) => {
        StorageService.logActivity(action, JSON.stringify(metadata));
    },
    
    getSystemActivity: async () => {
        return StorageService.getActivityLogs();
    },

    syncLocalToCloud: async (tasks: any, msgs: any, groups: any) => {
        return { success: false, message: "Sync manual disabled in safe mode." };
    }
};
