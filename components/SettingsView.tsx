
import React, { useState, useEffect, useRef } from 'react';
import { User, Tool, Announcement, UserRole, AttendanceConfig, Holiday, UserPreferences, SystemBackup, DivisionType } from '../types';
import { Icon } from './Icon';
import { StorageService } from '../services/storageService';
import { translations, LanguageCode } from '../translations';
import { NotificationService } from '../services/notificationService';
import { EMPLOYEE_DATA } from '../constants';
import { UnifiedDataService } from '../services/UnifiedDataService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  tools: Tool[];
  onUpdateTools: (tools: Tool[]) => void;
  announcements: Announcement[];
  onUpdateAnnouncements: (announcements: Announcement[]) => void;
  attendanceConfig: AttendanceConfig;
  onUpdateAttendanceConfig: (config: AttendanceConfig) => void;
  holidays: Holiday[];
  onUpdateHolidays: (holidays: Holiday[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  user, onUpdateUser, tools, onUpdateTools, announcements, onUpdateAnnouncements,
  attendanceConfig, onUpdateAttendanceConfig, holidays, onUpdateHolidays
}) => {
  // Permission Logic: Only Admin or IT Support can view restricted settings
  const isSystemAdmin = user.role === UserRole.ADMIN || user.division === DivisionType.IT_SUPPORT;

  // Default to 'team' only if allowed, otherwise start at 'profile'
  const [activeTab, setActiveTab] = useState<'team' | 'profile' | 'system' | 'notifications'>(
      isSystemAdmin ? 'team' : 'profile'
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingFonnte, setIsTestingFonnte] = useState(false);
  
  // Status check states
  const [isCheckingFonnteStatus, setIsCheckingFonnteStatus] = useState(false);
  const [fonnteDeviceStatus, setFonnteDeviceStatus] = useState<any>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(StorageService.getPreferences());
  const t = translations[preferences.language as LanguageCode] || translations.en;

  // Profile State
  const [editName, setEditName] = useState(user.name);
  const [editNote, setEditNote] = useState(user.stickyNote);
  const [editRole, setEditRole] = useState(user.role);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // System Sub-tabs State
  const [systemSubTab, setSystemSubTab] = useState<'announcements' | 'attendance' | 'backup'>('announcements');

  // Announcement State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Attendance Config State
  const [editWorkStart, setEditWorkStart] = useState(attendanceConfig.workStartTime);
  const [editWorkEnd, setEditWorkEnd] = useState(attendanceConfig.workEndTime);
  const [editGrace, setEditGrace] = useState(attendanceConfig.gracePeriodMinutes);
  const [editQuota, setEditQuota] = useState(attendanceConfig.annualLeaveQuota);

  // Notification State - AUTO-FILL IMPLEMENTATION
  const [waNumber, setWaNumber] = useState(preferences.whatsappNumber || '');
  // Auto-fill Webhook if empty
  const [webhookUrl, setWebhookUrl] = useState(preferences.webhookUrl || 'https://hooks.zapier.com/hooks/catch/123456/sample');
  // Auto-fill Fonnte Token if empty
  const [fonnteToken, setFonnteToken] = useState(preferences.fonnteToken || '');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check connection on mount
  useEffect(() => {
      setConnectionStatus(isSupabaseConfigured() ? 'connected' : 'disconnected');
  }, []);

  // --- HANDLERS ---

  const handleSaveProfile = () => {
    onUpdateUser({ ...user, name: editName, stickyNote: editNote, role: editRole });
    alert(t.common.save);
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPassword || newPassword !== confirmPassword) {
          alert(t.settings.passwordMismatch);
          return;
      }
      onUpdateUser({ ...user, password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      alert(t.settings.passwordUpdated);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title: newAnnTitle,
      content: newAnnContent,
      priority: newAnnPriority,
      date: new Date().toISOString().split('T')[0]
    };
    onUpdateAnnouncements([newAnn, ...announcements]);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  const handleDeleteAnnouncement = (id: string) => {
    onUpdateAnnouncements(announcements.filter(a => a.id !== id));
  };

  const handleSaveAttendanceConfig = () => {
      onUpdateAttendanceConfig({
          ...attendanceConfig,
          workStartTime: editWorkStart,
          workEndTime: editWorkEnd,
          gracePeriodMinutes: editGrace,
          annualLeaveQuota: editQuota
      });
      alert("Attendance Policy Saved");
  };

  const handleExportConfig = () => {
      const data = StorageService.createBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stis-du-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              StorageService.restoreBackup(data);
          } catch (err) {
              alert("Invalid config file");
          }
      };
      reader.readAsText(file);
  };

  const handleCloudSync = async () => {
      if (!window.confirm("Upload data lokal (Task & Chat) ke Cloud Database? \n\nPeringatan: ID yang sama di database akan ditimpa.")) return;

      setIsSyncing(true);
      
      try {
          const tasks = StorageService.getTasks();
          const msgs = StorageService.getMessages();
          const groups = StorageService.getChatGroups();

          const result = await UnifiedDataService.syncLocalToCloud(tasks, msgs, groups);
          
          if (result.success) {
              alert("✅ Sync Berhasil!\n\nData lokal telah tersimpan di cloud database. Pengguna lain kini bisa melihat update secara realtime.");
          } else {
              alert("❌ Sync Gagal:\n" + result.message);
          }
      } catch (e) {
          console.error(e);
          alert("❌ Error Tidak Terduga saat Sync");
      } finally {
          setIsSyncing(false);
      }
  };

  const handleSaveNotifications = () => {
    const updated = {
        ...preferences,
        whatsappNumber: waNumber,
        webhookUrl: webhookUrl,
        fonnteToken: fonnteToken
    };
    setPreferences(updated);
    StorageService.savePreferences(updated);
    alert("Pengaturan Notifikasi Disimpan");
  };

  const handleTestWebhook = () => {
      if (!webhookUrl) {
          alert("Masukkan URL Webhook terlebih dahulu.");
          return;
      }
      const dummyTask = { id: 'test', title: 'Test Webhook Notification', priority: 'high', isCompleted: false, creatorId: 'me' } as any;
      NotificationService.triggerWebhook(dummyTask, 'created', webhookUrl);
      alert("Test data dikirim ke Webhook. Cek logs di Zapier/Make Anda.");
  };

  // NEW: Check Device Status Handler
  const handleCheckFonnteStatus = async () => {
      if (!fonnteToken) {
          alert("Masukkan Token Fonnte terlebih dahulu.");
          return;
      }
      setIsCheckingFonnteStatus(true);
      setFonnteDeviceStatus(null);
      try {
          const result = await NotificationService.validateFonnteToken(fonnteToken);
          setFonnteDeviceStatus(result);
      } finally {
          setIsCheckingFonnteStatus(false);
      }
  };

  const handleTestFonnte = async () => {
      if (!fonnteToken || !waNumber) {
          alert("Mohon isi Token Fonnte dan Nomor WhatsApp (628...) terlebih dahulu.");
          return;
      }
      
      setIsTestingFonnte(true);
      
      const dummyTask = { 
          id: 'test_fonnte', 
          title: 'Tes Koneksi WhatsApp (Fonnte)', 
          priority: 'high', 
          isCompleted: false, 
          creatorId: 'System',
          targetDivisionId: 'IT Support' 
      } as any;
      
      try {
          const result = await NotificationService.sendViaFonnte(dummyTask, fonnteToken, waNumber);
          if (result.success) {
              alert(`✅ SUKSES!\nPesan terkirim ke ${waNumber}.\nInfo: ${result.detail}`);
          } else {
              alert(`❌ GAGAL!\nDetail: ${result.detail}\n\nPastikan perangkat terkoneksi di Fonnte.`);
          }
      } catch (e) {
          alert("Error saat request.");
      } finally {
          setIsTestingFonnte(false);
      }
  };

  // --- HELPER FOR UI ---
  const getBadgeColor = (division: string) => {
      switch(division) {
          case 'Direksi': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
          case 'Marketing': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
          case 'Administrasi': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
          case 'Keuangan': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          case 'IT Support': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
          default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      }
  };

  const filteredEmployees = EMPLOYEE_DATA.filter(emp => 
      emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.divisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#020617] via-[#0f172a] to-[#172554] overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 bg-black/20 border-r border-white/5 p-6 flex flex-col gap-2 shrink-0 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Icon name="Settings" className="text-brand-400" />
            Pengaturan
        </h2>
        
        {/* ACCESS CONTROL: Team, Notifications, System */}
        {isSystemAdmin && (
            <button 
              onClick={() => setActiveTab('team')}
              className={`text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'team' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name="Users" size={18} /> Data Tim
            </button>
        )}
        
        <button 
          onClick={() => setActiveTab('profile')}
          className={`text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <Icon name="User" size={18} /> Profil & Akun
        </button>

        {isSystemAdmin && (
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'notifications' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name="Bell" size={18} /> Notifikasi
            </button>
        )}
        
        {isSystemAdmin && (
            <button 
              onClick={() => setActiveTab('system')}
              className={`text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'system' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon name="Server" size={18} /> Sistem
            </button>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        
        {/* === TEAM MANAGEMENT (RESTRICTED) === */}
        {activeTab === 'team' && isSystemAdmin && (
            <div className="max-w-5xl mx-auto space-y-6 animate-[fadeIn_0.3s]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Data Karyawan</h2>
                        <p className="text-gray-400 text-sm">Total {EMPLOYEE_DATA.length} personel terdaftar.</p>
                    </div>
                    <div className="relative">
                        <input 
                            className="bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-brand-500 outline-none w-64"
                            placeholder="Cari nama atau divisi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4 w-16 text-center">No</th>
                                <th className="p-4">Nama Lengkap</th>
                                <th className="p-4">Divisi & Jabatan</th>
                                <th className="p-4">Kontak (Email/WA)</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.no} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 text-center text-gray-500">{emp.no}</td>
                                    <td className="p-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                                            {emp.nama.charAt(0)}
                                        </div>
                                        {emp.nama}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getBadgeColor(emp.divisi)}`}>
                                                {emp.divisi}
                                            </span>
                                            <span className="text-gray-400 text-xs">{emp.role}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400 font-mono text-xs">
                                        <div>{emp.email}</div>
                                        <div className="text-gray-500">{emp.wa}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500 italic">Data tidak ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* === PROFILE SETTINGS (PUBLIC) === */}
        {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-[fadeIn_0.3s]">
                
                {/* ID Card */}
                <div className="bg-gradient-to-r from-brand-900/50 to-indigo-900/50 border border-brand-500/30 rounded-2xl p-6 flex items-center gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 blur-[50px] rounded-full"></div>
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white/10 relative z-10">
                        {user.name.charAt(0)}
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300 border border-white/10">{user.role}</span>
                            <span className="px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded text-xs border border-brand-500/30">{user.division}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-3 flex items-center gap-1"><Icon name="Key" size={12}/> ID: {user.id}</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">Edit Profil</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</label>
                            <input className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-500" value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Sticky Note Dashboard</label>
                            <input className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-500" value={editNote} onChange={e => setEditNote(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleSaveProfile} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors">Simpan Perubahan</button>
                    </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-6">
                    <h3 className="text-lg font-bold text-red-400 border-b border-red-500/20 pb-4 flex items-center gap-2"><Icon name="Lock" size={18}/> Keamanan</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Password Baru</label>
                                <input type="password" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Konfirmasi Password</label>
                                <input type="password" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={!newPassword} className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-900/20">Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* === NOTIFICATIONS (RESTRICTED) === */}
        {activeTab === 'notifications' && isSystemAdmin && (
            <div className="max-w-2xl mx-auto space-y-8 animate-[fadeIn_0.3s]">
                
                {/* 1. WhatsApp Number */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Nomor Admin (WhatsApp)</h3>
                            <p className="text-xs text-gray-400">Nomor ini akan menerima notifikasi Urgent/Laporan.</p>
                        </div>
                        <Icon name="Phone" size={20} className="text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Nomor WhatsApp (628...)</label>
                        <input 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green-500" 
                            value={waNumber} 
                            onChange={e => setWaNumber(e.target.value)}
                            placeholder="628123456789"
                        />
                    </div>
                </div>

                {/* 2. Fonnte Integration (With Status Check) */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Integrasi Fonnte (WA Gateway)</h3>
                            <p className="text-xs text-gray-400">Kirim notifikasi WhatsApp otomatis tanpa pihak ketiga.</p>
                        </div>
                        <Icon name="MessageCircle" size={20} className="text-green-500" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Fonnte API Token</label>
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-green-500 font-mono" 
                                    value={fonnteToken} 
                                    onChange={e => setFonnteToken(e.target.value)}
                                    placeholder="Masukkan Token Fonnte..."
                                    type="password"
                                />
                                <button 
                                    onClick={handleCheckFonnteStatus}
                                    disabled={isCheckingFonnteStatus}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {isCheckingFonnteStatus ? <Icon name="Loader2" className="animate-spin" size={14}/> : <Icon name="Activity" size={14}/>}
                                    Cek Status
                                </button>
                            </div>
                        </div>

                        {/* Status Result Panel */}
                        {fonnteDeviceStatus && (
                            <div className={`p-4 rounded-xl border ${fonnteDeviceStatus.status ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} animate-[fadeIn_0.2s]`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name={fonnteDeviceStatus.status ? "Wifi" : "WifiOff"} size={18} className={fonnteDeviceStatus.status ? "text-green-400" : "text-red-400"} />
                                    <span className={`font-bold ${fonnteDeviceStatus.status ? "text-green-400" : "text-red-400"}`}>
                                        {fonnteDeviceStatus.status ? "Device Connected" : "Disconnected / Invalid Token"}
                                    </span>
                                </div>
                                
                                {fonnteDeviceStatus.status ? (
                                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-300 mt-3 border-t border-white/5 pt-2">
                                        <div>
                                            <span className="block text-gray-500 mb-0.5">Device Name</span>
                                            <span className="font-mono font-bold text-white">{fonnteDeviceStatus.name || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 mb-0.5">Device ID</span>
                                            <span className="font-mono text-white">{fonnteDeviceStatus.device || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 mb-0.5">Expired</span>
                                            <span className="font-mono text-white">{fonnteDeviceStatus.expired || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 mb-0.5">Quota</span>
                                            <span className="font-mono text-white">{fonnteDeviceStatus.quota || '-'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-red-300 mt-1">{fonnteDeviceStatus.reason || "Tidak dapat menghubungi server Fonnte. Periksa token dan koneksi internet."}</p>
                                )}
                            </div>
                        )}

                        <div className="pt-2">
                            <button 
                                onClick={handleTestFonnte}
                                disabled={isTestingFonnte || !fonnteToken}
                                className="w-full py-2 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isTestingFonnte ? <Icon name="Loader2" className="animate-spin" size={14}/> : <Icon name="Send" size={14}/>}
                                Kirim Pesan Tes ke Admin
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">
                            *Pastikan device WhatsApp sudah di-scan QR Code di dashboard Fonnte.
                        </p>
                    </div>
                </div>

                {/* 3. Automation Webhook */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Automation Webhook</h3>
                            <p className="text-xs text-gray-400">Integrasi ke Zapier/Make untuk workflow lanjutan.</p>
                        </div>
                        <Icon name="Zap" size={20} className="text-yellow-500" />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Webhook URL (POST)</label>
                            <input 
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-500 font-mono" 
                                value={webhookUrl} 
                                onChange={e => setWebhookUrl(e.target.value)}
                                placeholder="https://hooks.zapier.com/..."
                            />
                        </div>
                        <button 
                            onClick={handleTestWebhook}
                            className="w-full py-2 border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2"
                        >
                            <Icon name="Activity" size={14}/> Trigger Test Event
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleSaveNotifications} className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2">
                        <Icon name="Save" size={18} /> Simpan Konfigurasi
                    </button>
                </div>
            </div>
        )}

        {/* === SYSTEM ADMIN (RESTRICTED) === */}
        {activeTab === 'system' && isSystemAdmin && (
            <div className="max-w-4xl mx-auto animate-[fadeIn_0.3s]">
                
                {/* Sub-Navigation */}
                <div className="flex gap-2 mb-8 bg-black/30 p-1 rounded-xl w-fit">
                    <button onClick={() => setSystemSubTab('announcements')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${systemSubTab === 'announcements' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Pengumuman</button>
                    <button onClick={() => setSystemSubTab('attendance')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${systemSubTab === 'attendance' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Absensi</button>
                    <button onClick={() => setSystemSubTab('backup')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${systemSubTab === 'backup' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Backup & Restore</button>
                </div>

                {systemSubTab === 'announcements' && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Buat Pengumuman Baru</h3>
                        <form onSubmit={handleAddAnnouncement} className="space-y-4 mb-8">
                            <input className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-brand-500" placeholder="Judul Pengumuman" value={newAnnTitle} onChange={e => setNewAnnTitle(e.target.value)} required />
                            <textarea className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-brand-500 h-24" placeholder="Isi pesan..." value={newAnnContent} onChange={e => setNewAnnContent(e.target.value)} required />
                            <div className="flex justify-between items-center">
                                <select className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none" value={newAnnPriority} onChange={e => setNewAnnPriority(e.target.value as any)}>
                                    <option value="low">Info Biasa (Low)</option>
                                    <option value="medium">Penting (Medium)</option>
                                    <option value="high">Urgent (High)</option>
                                </select>
                                <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-colors">Posting</button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Riwayat Pengumuman</h4>
                            {announcements.map(ann => (
                                <div key={ann.id} className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-sm font-bold text-white">{ann.title}</p>
                                        <p className="text-xs text-gray-500">{ann.date} • {ann.priority}</p>
                                    </div>
                                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-gray-500 hover:text-red-500"><Icon name="Trash2" size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {systemSubTab === 'attendance' && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Jam Masuk (WIB)</label>
                                <input type="time" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" value={editWorkStart} onChange={e => setEditWorkStart(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Jam Pulang (WIB)</label>
                                <input type="time" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" value={editWorkEnd} onChange={e => setEditWorkEnd(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Toleransi Keterlambatan (Menit)</label>
                                <input type="number" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" value={editGrace} onChange={e => setEditGrace(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Jatah Cuti Tahunan</label>
                                <input type="number" className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" value={editQuota} onChange={e => setEditQuota(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleSaveAttendanceConfig} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors">Simpan Aturan</button>
                        </div>
                    </div>
                )}

                {systemSubTab === 'backup' && (
                    <div className="space-y-6">
                        {/* Cloud Sync Section */}
                        <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><Icon name="Cloud" size={24} /></div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">Cloud Database Sync</h3>
                                    <p className="text-sm text-gray-400 mt-1 mb-4">
                                        Unggah data lokal saat ini (Task & Chat) ke Supabase Cloud untuk inisialisasi awal.
                                        Gunakan ini jika database masih kosong.
                                    </p>
                                    
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                        <span className="text-xs font-mono text-gray-300">
                                            Status: {connectionStatus === 'connected' ? 'Connected to Supabase' : 'Disconnected / Invalid Keys'}
                                        </span>
                                    </div>

                                    <button 
                                        onClick={handleCloudSync} 
                                        disabled={isSyncing || connectionStatus !== 'connected'}
                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                    >
                                        {isSyncing ? <Icon name="Loader2" className="animate-spin" size={18}/> : <Icon name="UploadCloud" size={18}/>}
                                        {isSyncing ? 'Syncing...' : 'Sync Local Data to Cloud'}
                                    </button>
                                    {connectionStatus !== 'connected' && (
                                        <p className="text-xs text-red-400 mt-2">
                                            * Periksa konfigurasi di <code>services/supabaseClient.ts</code>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Local Backup Section */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Local Backup & Restore</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleExportConfig} className="p-4 bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl text-left transition-colors group">
                                    <Icon name="Download" size={24} className="text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-bold text-white text-sm">Export Config</h4>
                                    <p className="text-xs text-gray-500 mt-1">Download JSON file</p>
                                </button>
                                <div className="relative p-4 bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl text-left transition-colors group cursor-pointer">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImportConfig} accept=".json" ref={fileInputRef} />
                                    <Icon name="Upload" size={24} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-bold text-white text-sm">Import Config</h4>
                                    <p className="text-xs text-gray-500 mt-1">Restore from JSON</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};
