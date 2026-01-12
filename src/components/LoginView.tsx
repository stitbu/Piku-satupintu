
import React, { useState, useEffect } from 'react';
import { DIVISIONS } from '../constants';
import { DivisionType, User, UserRole } from '../types';
import { Icon } from './Icon';
import { StorageService } from '../services/storageService';
import { translations, LanguageCode } from '../translations';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loginMode, setLoginMode] = useState<'INTERNAL' | 'PARTNER' | 'ADMIN' | null>(null);
  
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [userSearch, setUserSearch] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const prefs = StorageService.getPreferences();
  const t = translations[prefs.language as LanguageCode] || translations.en;

  useEffect(() => {
    setUsers(StorageService.getUsers());
  }, []);

  const handleAdminAccess = () => {
      setLoginMode('ADMIN');
      setStep(3);
      setUsernameInput('');
      setPassword('');
      setError('');
  };

  const handleDivisionClick = (divId: DivisionType) => {
    setLoginMode('INTERNAL');
    setSelectedDivision(divId);
    setStep(3);
    setUserSearch(''); 
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    const loggedIn = StorageService.login(user.username);
    if (loggedIn) onLogin(loggedIn);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMode === 'ADMIN') {
        const loggedIn = StorageService.login(usernameInput, password);
        if (loggedIn) {
            onLogin(loggedIn);
        } else {
            setError('Identitas Admin tidak valid.');
        }
    }
  };

  const filteredUsers = selectedDivision 
    ? users.filter(u => u && u.division === selectedDivision && u.name.toLowerCase().includes(userSearch.toLowerCase())) 
    : [];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-5xl z-10">
        
        {/* VIEW UTAMA: DEPARTEMENT SELECTION */}
        {step === 1 && (
            <div className="flex flex-col items-center animate-fade-in">
                {/* Logo Area */}
                <div className="mb-4 text-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-pk-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.4)] mb-8 ring-2 ring-white/20">
                        <span className="text-4xl font-black italic">PK</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-tight italic">ONE-GATE SYSTEM</h1>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.6em] mt-4 opacity-70">Pintu Kuliah & Kunci Sarjana</p>
                </div>

                {/* Akses Pusat Komando Button */}
                <button 
                    onClick={handleAdminAccess}
                    className="mt-12 mb-16 w-full max-w-md bg-slate-900 border border-white/10 hover:bg-slate-800 hover:border-red-500/50 p-6 rounded-[2.5rem] flex items-center justify-between group transition-all shadow-2xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-red-400 group-hover:bg-red-500/10 transition-all border border-white/5">
                            <Icon name="ShieldAlert" size={28} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-gray-200 group-hover:text-white uppercase tracking-tight">Akses Pusat Komando</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Super Admin & IT Support</p>
                        </div>
                    </div>
                    <Icon name="ChevronRight" size={24} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>

                {/* Title */}
                <div className="text-center mb-10">
                    <h2 className="text-sm font-black text-pk-400 tracking-[0.5em] uppercase bg-pk-500/10 px-6 py-2 rounded-full border border-pk-500/20">Pilih Departemen Anda</h2>
                </div>

                {/* DEPARTMENT GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                    {DIVISIONS.map(div => (
                        <button 
                            key={div.id}
                            onClick={() => handleDivisionClick(div.id)}
                            className="bg-[#0f172a] border border-white/10 p-10 rounded-[3rem] flex flex-col items-center gap-8 hover:bg-[#1e293b] hover:border-pk-400 hover:-translate-y-2 transition-all shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] active:scale-95 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-pk-500/0 to-pk-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-white/5 group-hover:bg-pk-500 group-hover:text-slate-950 group-hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all duration-500">
                                <Icon name={div.icon} size={40} />
                            </div>
                            
                            <span className="text-xs font-black text-slate-400 group-hover:text-white uppercase tracking-[0.2em] text-center leading-relaxed transition-colors z-10">
                                {div.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* STEP 3: USER SELECTION / LOGIN FORM */}
        {step === 3 && (
            <div className="max-w-md mx-auto animate-fade-in">
                 {loginMode === 'INTERNAL' && selectedDivision ? (
                    <>
                        <button onClick={() => setStep(1)} className="mb-10 flex items-center gap-3 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.4em]">
                            <Icon name="ArrowLeft" size={14} /> Kembali ke Menu Utama
                        </button>
                        <div className="text-center mb-12">
                             <div className="w-24 h-24 mx-auto bg-slate-900 border border-white/10 rounded-[2rem] flex items-center justify-center text-pk-400 shadow-2xl mb-6 ring-1 ring-white/10">
                                <Icon name={DIVISIONS.find(d => d.id === selectedDivision)?.icon || 'Grid'} size={48} />
                             </div>
                             <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{DIVISIONS.find(d => d.id === selectedDivision)?.name}</h2>
                             <p className="text-[10px] text-slate-500 mt-3 font-black tracking-[0.3em] uppercase">Digital Operations Identity</p>
                        </div>
                        <div className="relative mb-8">
                            <Icon name="Search" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                            <input type="text" placeholder="Cari nama Anda..." className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/10 rounded-[1.5rem] text-white outline-none focus:border-pk-500 transition-all font-bold text-lg" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}/>
                        </div>
                        <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-3">
                            {filteredUsers.map(user => (
                                <button key={user.id} onClick={() => handleUserClick(user)} className="w-full bg-[#0f172a] p-6 rounded-[2rem] flex items-center gap-5 hover:bg-pk-600 hover:scale-[1.02] transition-all border border-white/5 group shadow-xl">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-white font-black group-hover:bg-white group-hover:text-pk-600 transition-all shadow-lg text-xl italic">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-black text-gray-100 group-hover:text-white text-xl tracking-tight leading-tight">{user.name}</div>
                                        <div className="text-[10px] text-slate-500 group-hover:text-white/80 uppercase font-black tracking-widest mt-1.5 opacity-60">{user.role}</div>
                                    </div>
                                    <Icon name="ChevronRight" className="ml-auto text-slate-700 group-hover:text-white" size={24} />
                                </button>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-10 text-slate-600 font-bold italic uppercase text-xs tracking-widest">Data tidak ditemukan</div>
                            )}
                        </div>
                    </>
                 ) : (
                    <div className="text-center">
                        <button onClick={() => setStep(1)} className="mb-10 flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-colors mx-auto text-[10px] font-black uppercase tracking-[0.4em]">
                            <Icon name="ArrowLeft" size={14} /> Kembali
                        </button>
                        <div className="w-24 h-24 rounded-[2rem] bg-[#0f172a] border border-white/10 flex items-center justify-center shadow-2xl mx-auto mb-8">
                            <Icon name="ShieldAlert" size={48} className="text-red-500" />
                        </div>
                        <h2 className="text-4xl font-black mb-12 text-white uppercase tracking-tighter italic">Command Center</h2>
                        <form onSubmit={handleLoginSubmit} className="space-y-6 text-left bg-slate-900/60 p-10 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-xl">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Access Identity</label>
                                <input type="text" autoFocus className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-red-500 transition-all font-mono font-bold text-lg" placeholder="ID / Username..." value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Secret Key / Code</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-red-500 transition-all pr-14 font-mono font-bold text-lg" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"><Icon name={showPassword ? "EyeOff" : "Eye"} size={24} /></button>
                                </div>
                            </div>
                            {error && <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-black text-center uppercase tracking-widest animate-pulse">{error}</div>}
                            <button type="submit" className="w-full py-6 font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl bg-red-600 hover:bg-red-500 shadow-red-900/40 transition-all mt-8 active:scale-95 text-lg">Authenticate & Connect</button>
                        </form>
                    </div>
                 )}
            </div>
        )}
      </div>

      <div className="fixed bottom-10 text-[10px] font-black text-slate-700 flex gap-8 uppercase tracking-[0.6em] z-10 opacity-50">
        <span>PK SYSTEM &copy; 2023</span>
        <span className="text-slate-800">•</span>
        <span>SECURITY GATEWAY V1.8.5</span>
      </div>
    </div>
  );
};
