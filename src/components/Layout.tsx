
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { ResponsiveSidebar } from './Sidebar';
import { Icon } from './Icon';

interface MobileBottomNavProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ theme, onToggleTheme }) => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-6 left-5 right-5 z-50">
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-100 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-4 py-2 flex items-center justify-between transition-all">
                
                <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/') ? 'text-brand-500 scale-110' : 'text-slate-400'}`}>
                    <Icon name="LayoutGrid" size={20} className={isActive('/') ? 'fill-brand-500/10' : ''} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Beranda</span>
                </Link>

                <Link to="/messages" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/messages') ? 'text-brand-500 scale-110' : 'text-slate-400'} relative`}>
                    <Icon name="MessageSquare" size={20} />
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold flex items-center justify-center rounded-full border border-white dark:border-slate-900 shadow-sm">3</div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Pesan</span>
                </Link>

                {/* Center QR Scan Button */}
                <div className="-mt-14">
                    <button className="w-16 h-16 bg-brand-500 rounded-3xl shadow-2xl shadow-brand-500/40 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all ring-8 ring-slate-50 dark:ring-slate-950 group">
                        <Icon name="QrCode" size={32} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>

                <Link to="#" className={`flex flex-col items-center gap-1 p-2 transition-all text-slate-400`}>
                    <Icon name="Bell" size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Update</span>
                </Link>

                <Link to="/settings" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/settings') ? 'text-brand-500 scale-110' : 'text-slate-400'}`}>
                    <Icon name="Settings" size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Sistem</span>
                </Link>
            </div>
            
            {/* Theme Toggle Float */}
            <button 
                onClick={onToggleTheme}
                className="fixed bottom-28 right-5 w-12 h-12 bg-white dark:bg-slate-800 text-slate-800 dark:text-yellow-400 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all border border-slate-100 dark:border-white/10 z-[60]"
            >
                <Icon name={theme === 'dark' ? "Sun" : "Moon"} size={18} />
            </button>
        </div>
    );
};

export const AppLayout: React.FC<{ 
    children: React.ReactNode; 
    user: User; 
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onLogout: () => void;
}> = ({ children, user, theme, onToggleTheme, onLogout }) => {
    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-500">
            <div className="hidden md:block">
                <ResponsiveSidebar user={user} onLogout={onLogout} />
            </div>
            
            <main className="flex-1 min-w-0 relative h-full overflow-y-auto custom-scrollbar">
                {children}
                <MobileBottomNav theme={theme} onToggleTheme={onToggleTheme} />
            </main>
        </div>
    );
};

export const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    React.useEffect(() => { 
        const timer = setTimeout(onClose, 3000); 
        return () => clearTimeout(timer); 
    }, [onClose]);

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-brand-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border border-white/20">
            <Icon name="CheckCircle" size={18} />
            <span className="font-bold text-xs uppercase tracking-wider">{message}</span>
        </div>
    );
};
