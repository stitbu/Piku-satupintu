
import React, { useState } from 'react';
import { User, UserPreferences } from '../types';
import { Icon } from './Icon';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import { resetSupabaseClient, clearCustomSupabase } from '../services/supabaseClient';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>('profile');
  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getPreferences());
  
  // Local state for integration inputs
  const [fonnteToken, setFonnteToken] = useState(preferences.fonnteToken || '');
  const [waNumber, setWaNumber] = useState(preferences.whatsappNumber || '');
  const [webhookUrl, setWebhookUrl] = useState(preferences.webhookUrl || '');
  
  // Supabase dynamic connection
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('ogws_custom_supabase_url') || '');
  const [sbKey, setSbKey] = useState(localStorage.getItem('ogws_custom_supabase_key') || '');
  
  const [isChecking, setIsChecking] = useState(false);
  const [fonnteStatus, setFonnteStatus] = useState<any>(null);

  const handleSaveIntegrations = () => {
    const updated = {
        ...preferences,
        fonnteToken,
        whatsappNumber: waNumber,
        webhookUrl
    };
    setPreferences(updated);
    StorageService.savePreferences(updated);
    alert("Konfigurasi API Tersimpan!");
  };

  const handleConnectSupabase = () => {
      if (!sbUrl || !sbKey) return alert("Harap isi URL dan Anon Key");
      if (confirm("Aplikasi akan dimuat ulang untuk menyambungkan ke Database baru. Lanjutkan?")) {
          resetSupabaseClient(sbUrl, sbKey);
      }
  };

  const handleResetSupabase = () => {
      if (confirm("Kembali ke Database Default?")) {
          clearCustomSupabase();
      }
  };

  const checkFonnte = async () => {
      setIsChecking(true);
      const res = await NotificationService.validateFonnteToken(fonnteToken);
      setFonnteStatus(res);
      setIsChecking(false);
  };

  return (
    <div className="flex h-full bg-[#020617] overflow-hidden">
      {/* Sidebar Pengaturan */}
      <div className="w-64 border-r border-white/5 bg-black/20 p-6 flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
        <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}>
            <Icon name="User" size={18} /> Profil
        </button>
        <button onClick={() => setActiveTab('integrations')} className={`p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'integrations' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}>
            <Icon name="Zap" size={18} /> Integrasi & Database
        </button>
      </div>

      {/* Konten Utama */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {activeTab === 'integrations' && (
            <div className="max-w-2xl space-y-8 animate-[fadeIn_0.3s]">
                
                {/* 1. Supabase Connection Switcher */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white">Cloud Database Gateway</h3>
                            <p className="text-xs text-slate-500 mt-1">Sambungkan ke project Supabase lain secara dinamis</p>
                        </div>
                        <Icon name="Database" size={32} className="text-brand-400" />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supabase URL</label>
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 font-mono"
                                value={sbUrl}
                                onChange={e => setSbUrl(e.target.value)}
                                placeholder="https://xyz.supabase.co"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Anon / Public Key</label>
                            <input 
                                type="password"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 font-mono"
                                value={sbKey}
                                onChange={e => setSbKey(e.target.value)}
                                placeholder="eyJhbG..."
                            />
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleConnectSupabase} className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg">
                                Update & Reconnect
                            </button>
                            <button onClick={handleResetSupabase} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-bold transition-all border border-white/5">
                                Reset to Default
                            </button>
                        </div>
                        
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                             <p className="text-[10px] text-amber-400 leading-relaxed">
                                <strong>PERINGATAN:</strong> Pastikan Project Supabase baru memiliki tabel yang sesuai (<code>tasks</code>, <code>chat_messages</code>, <code>chat_groups</code>) agar aplikasi tidak error.
                             </p>
                        </div>
                    </div>
                </div>

                {/* 2. WhatsApp Fonnte Section */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white">WhatsApp Gateway (Fonnte)</h3>
                            <p className="text-xs text-slate-500 mt-1">Kirim notifikasi otomatis ke WA</p>
                        </div>
                        <Icon name="MessageCircle" size={32} className="text-green-500" />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">API Token Fonnte</label>
                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
                                    value={fonnteToken}
                                    onChange={e => setFonnteToken(e.target.value)}
                                />
                                <button onClick={checkFonnte} disabled={isChecking} className="px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                                    {isChecking ? '...' : 'Cek Device'}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Admin (Default)</label>
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
                                value={waNumber}
                                onChange={e => setWaNumber(e.target.value)}
                                placeholder="62812345678"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleSaveIntegrations} className="px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-sm font-bold shadow-2xl transition-all">
                        Simpan Semua Konfigurasi API
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
