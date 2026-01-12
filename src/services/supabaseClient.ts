
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Keys (Fallback)
const DEFAULT_URL = 'https://utxlthrfsdjgulzvmrpd.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0eGx0aHJmc2RqZ3VsenZtcnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzYxOTMsImV4cCI6MjA4MDQ1MjE5M30.z5-t3jdMNkH5_J4qnO6CT_8OEPvL9JMOyhHgdzreH0s';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (supabaseInstance) return supabaseInstance;

    // Coba ambil dari localStorage (Pengaturan User)
    const customUrl = localStorage.getItem('ogws_custom_supabase_url');
    const customKey = localStorage.getItem('ogws_custom_supabase_key');

    const url = customUrl || DEFAULT_URL;
    const key = customKey || DEFAULT_KEY;

    if (url && key && key.length > 20) {
        supabaseInstance = createClient(url, key);
    }

    return supabaseInstance;
};

export const resetSupabaseClient = (url: string, key: string) => {
    localStorage.setItem('ogws_custom_supabase_url', url);
    localStorage.setItem('ogws_custom_supabase_key', key);
    supabaseInstance = createClient(url, key);
    // Refresh halaman untuk mereset semua subscription di UnifiedDataService
    window.location.reload();
};

export const clearCustomSupabase = () => {
    localStorage.removeItem('ogws_custom_supabase_url');
    localStorage.removeItem('ogws_custom_supabase_key');
    window.location.reload();
};

export const isSupabaseConfigured = () => {
    return !!getSupabase();
};

// Export instance awal
export const supabase = getSupabase();
