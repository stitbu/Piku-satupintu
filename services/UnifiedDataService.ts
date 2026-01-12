
import { StorageService } from './storageService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Task, ChatMessage, ChatGroup } from '../types';

// Helper to safely stringify errors
const getErrorMessage = (error: any): string => {
    if (!error) return 'Unknown Error';
    
    // Handle Supabase PostgrestError specifically
    if (typeof error === 'object' && error !== null) {
        // If it has a 'message' property
        if (error.message) {
            // Append details or hint if available
            let msg = error.message;
            if (error.details) msg += ` (${error.details})`;
            if (error.hint) msg += ` Hint: ${error.hint}`;
            return msg;
        }
        // If it has error_description (Auth errors)
        if (error.error_description) return error.error_description;
    }

    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;

    try {
        return JSON.stringify(error);
    } catch (e) {
        return 'Non-serializable error object';
    }
};

export const UnifiedDataService = {
    
    // --- TASKS ---
    
    getTasks: async (): Promise<Task[]> => {
        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase!
                    .from('tasks')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.warn("Supabase Error (getTasks):", error);
                    // Fallback to local storage on error
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
                    attachmentUrl: d.attachment_url, // New Field
                    timestamp: d.created_at ? new Date(d.created_at).getTime() : Date.now()
                }));
            } catch (err) {
                console.warn("Supabase Exception (getTasks):", err);
                return StorageService.getTasks();
            }
        }
        return StorageService.getTasks();
    },

    addTask: async (task: Task) => {
        // Always save to local storage first for immediate UI update & backup
        const current = StorageService.getTasks();
        StorageService.saveTasks([task, ...current]);

        if (isSupabaseConfigured()) {
            try {
                const { error } = await supabase!.from('tasks').insert([{
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
                    attachment_url: task.attachmentUrl, // New Field
                    created_at: new Date(task.timestamp || Date.now()).toISOString()
                }]);
                if (error) console.warn("DB Insert Error:", getErrorMessage(error));
            } catch (err) {
                console.warn("DB Insert Exception:", getErrorMessage(err));
            }
        }
    },

    updateTask: async (taskId: string, updates: Partial<Task>) => {
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
                
                const { error } = await supabase!.from('tasks').update(dbUpdates).eq('id', taskId);
                if (error) console.warn("DB Update Error:", getErrorMessage(error));
            } catch (err) {
                console.warn("DB Update Exception:", getErrorMessage(err));
            }
        }
    },

    deleteTask: async (taskId: string) => {
        // Local Delete
        const current = StorageService.getTasks();
        StorageService.saveTasks(current.filter(t => t.id !== taskId));

        if (isSupabaseConfigured()) {
            try {
                const { error } = await supabase!.from('tasks').delete().eq('id', taskId);
                if (error) console.warn("DB Delete Error:", getErrorMessage(error));
            } catch (err) {
                console.warn("DB Delete Exception:", getErrorMessage(err));
            }
        }
    },

    // --- FILE UPLOAD ---
    uploadAttachment: async (file: File): Promise<string | null> => {
        if (!isSupabaseConfigured()) {
            alert("Error: Database Cloud belum terhubung. Tidak bisa upload.");
            return null;
        }

        try {
            // 1. Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            // 2. Upload
            const { error: uploadError } = await supabase!.storage
                .from('task-attachments')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload Error:", uploadError);
                if (uploadError.message.includes("Bucket not found")) {
                    alert("Error: Bucket 'task-attachments' belum dibuat di Supabase.");
                }
                return null;
            }

            // 3. Get Public URL
            const { data } = supabase!.storage
                .from('task-attachments')
                .getPublicUrl(filePath);

            return data.publicUrl;

        } catch (e) {
            console.error("Upload Exception:", e);
            return null;
        }
    },

    // --- CHAT MESSAGES ---

    getMessages: async (): Promise<ChatMessage[]> => {
        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase!
                    .from('chat_messages')
                    .select('*')
                    .order('timestamp', { ascending: true })
                    .limit(500); 
                
                if (error) {
                    console.warn("Supabase Error (getMessages):", getErrorMessage(error));
                    return StorageService.getMessages();
                }

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
            } catch (err) {
                console.warn("Supabase Exception (getMessages):", err);
                return StorageService.getMessages();
            }
        }
        return StorageService.getMessages();
    },

    sendMessage: async (msg: ChatMessage) => {
        // Local Save
        const current = StorageService.getMessages();
        StorageService.saveMessages([...current, msg]);

        if (isSupabaseConfigured()) {
            try {
                const { error } = await supabase!.from('chat_messages').insert([{
                    id: msg.id,
                    content: msg.content,
                    sender_id: msg.senderId,
                    sender_name: msg.senderName,
                    channel_id: msg.channelId,
                    timestamp: msg.timestamp
                }]);
                if (error) console.warn("DB Message Error:", getErrorMessage(error));
            } catch (err) {
                console.warn("DB Message Exception:", getErrorMessage(err));
            }
        }
    },

    // --- CHAT GROUPS ---

    getChatGroups: async (): Promise<ChatGroup[]> => {
        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase!
                    .from('chat_groups')
                    .select('*');
                
                if (error) {
                    console.warn("Supabase Error (getChatGroups):", getErrorMessage(error));
                    return StorageService.getChatGroups();
                }

                if (data) {
                    return data.map((d: any) => ({
                        id: d.id,
                        name: d.name,
                        memberIds: d.member_ids,
                        createdBy: d.created_by,
                        createdAt: d.created_at
                    }));
                }
            } catch (err) {
                console.warn("Supabase Exception (getChatGroups):", err);
                return StorageService.getChatGroups();
            }
        }
        return StorageService.getChatGroups();
    },

    createChatGroup: async (group: ChatGroup) => {
        // Local Save
        StorageService.createChatGroup(group);

        if (isSupabaseConfigured()) {
            try {
                const { error } = await supabase!.from('chat_groups').insert([{
                    id: group.id,
                    name: group.name,
                    member_ids: group.memberIds,
                    created_by: group.createdBy,
                    created_at: group.createdAt
                }]);
                if (error) console.warn("DB Group Error:", getErrorMessage(error));
            } catch (err) {
                console.warn("DB Group Exception:", getErrorMessage(err));
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
                // Listen for Tasks
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'tasks' },
                    () => onTaskChange()
                )
                // Listen for Chat Messages
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                    (payload) => {
                        const d = payload.new;
                        onMessageInsert({
                            id: d.id,
                            content: d.content,
                            senderId: d.sender_id,
                            senderName: d.sender_name,
                            channelId: d.channel_id,
                            timestamp: d.timestamp
                        });
                    }
                )
                // Listen for Groups
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'chat_groups' },
                    () => onGroupChange()
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        // console.log('Connected to realtime');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.warn('Supabase Realtime Error: Connection failed');
                    }
                });

            return channel;
        } catch (err) {
            console.warn("Realtime Subscription Exception:", err);
            return null;
        }
    },

    // --- DATA MIGRATION / SYNC ---
    syncLocalToCloud: async (tasks: Task[], messages: ChatMessage[], groups: ChatGroup[]) => {
        if (!isSupabaseConfigured()) return { success: false, message: 'Supabase client not initialized' };
        
        try {
            // 1. Sync Tasks
            if (tasks.length > 0) {
                const { error } = await supabase!.from('tasks').upsert(
                    tasks.map(t => ({
                        id: t.id,
                        title: t.title,
                        is_completed: t.isCompleted,
                        priority: t.priority,
                        creator_id: t.creatorId,
                        assignee_id: t.assigneeId,
                        origin_division_id: t.originDivisionId,
                        target_division_id: t.targetDivisionId,
                        due_date: t.dueDate,
                        reminder_at: t.reminderAt,
                        is_reminded: t.isReminded,
                        attachment_url: t.attachmentUrl,
                        created_at: new Date(t.timestamp || Date.now()).toISOString()
                    })), 
                    { onConflict: 'id' }
                );
                
                if (error) {
                    const msg = getErrorMessage(error);
                    console.error("Sync Tasks Error:", msg);
                    // Check specifically for missing table error (Postgres 42P01)
                    if (msg.includes('relation "public.tasks" does not exist') || msg.includes('42P01')) {
                        return { success: false, message: "Tabel 'tasks' belum ada di database. Harap jalankan script SQL di Supabase." };
                    }
                    return { success: false, message: `Tasks Sync Failed: ${msg}` };
                }
            }

            // 2. Sync Messages
            if (messages.length > 0) {
                const { error } = await supabase!.from('chat_messages').upsert(
                    messages.map(m => ({
                        id: m.id,
                        content: m.content,
                        sender_id: m.senderId,
                        sender_name: m.senderName,
                        channel_id: m.channelId,
                        timestamp: m.timestamp
                    })),
                    { onConflict: 'id' }
                );
                
                if (error) {
                    const msg = getErrorMessage(error);
                    console.error("Sync Messages Error:", msg);
                    if (msg.includes('relation "public.chat_messages" does not exist') || msg.includes('42P01')) {
                        return { success: false, message: "Tabel 'chat_messages' belum ada. Jalankan script SQL." };
                    }
                    return { success: false, message: `Messages Sync Failed: ${msg}` };
                }
            }

            // 3. Sync Groups
            if (groups.length > 0) {
                const { error } = await supabase!.from('chat_groups').upsert(
                    groups.map(g => ({
                        id: g.id,
                        name: g.name,
                        member_ids: g.memberIds,
                        created_by: g.createdBy,
                        created_at: g.createdAt
                    })),
                    { onConflict: 'id' }
                );
                
                if (error) {
                    const msg = getErrorMessage(error);
                    console.error("Sync Groups Error:", msg);
                    if (msg.includes('relation "public.chat_groups" does not exist') || msg.includes('42P01')) {
                        return { success: false, message: "Tabel 'chat_groups' belum ada. Jalankan script SQL." };
                    }
                    return { success: false, message: `Groups Sync Failed: ${msg}` };
                }
            }

            return { success: true };
        } catch (e) {
            console.error("Sync Unexpected Error:", e);
            return { success: false, message: getErrorMessage(e) };
        }
    }
};
    