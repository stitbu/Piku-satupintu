
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { ResponsiveSidebar } from './Sidebar';
import { Icon } from './Icon';

export const MobileBottomNav: React.FC = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-6 left-5 right-5 z-50">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-3xl shadow-2xl px-4 py-2 flex items-center justify-between">
                
                <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/') ? 'text-brand-500' : 'text-slate-400'}`}>
                    <Icon name="LayoutGrid" size={20} className={isActive('/') ? 'fill-brand-500/10' : ''} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Beranda</span>
                </Link>

                <Link to="/messages" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/messages') ? 'text-brand-500' : 'text-slate-400'} relative`}>
                    <Icon name="MessageSquare" size={20} />
                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold flex items-center justify-center rounded-full border border-white dark:border-slate-900">3</div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Pesan</span>
                </Link>

                {/* Center QR Scan Button */}
                <div className="-mt-12">
                    <button className="w-14 h-14 bg-brand-500 rounded-2xl shadow-xl shadow-brand-500/40 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all ring-4 ring-slate-50 dark:ring-slate-950">
                        <Icon name="QrCode" size={28} />
                    </button>
                </div>

                <Link to="#" className={`flex flex-col items-center gap-1 p-2 transition-all text-slate-400`}>
                    <Icon name="Bell" size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Notifikasi</span>
                </Link>

                <Link to="/settings" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/settings') ? 'text-brand-500' : 'text-slate-400'}`}>
                    <Icon name="Settings" size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Sistem</span>
                </Link>
            </div>
            
            {/* Theme Toggle Float */}
            <button className="fixed bottom-28 right-5 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all border border-white/10">
                <Icon name="Moon" size={18} />
            </button>
        </div>
    );
};

export const AppLayout: React.FC<{ 
    children: React.ReactNode; 
    user: User; 
    onLogout: () => void;
}> = ({ children, user, onLogout }) => {
    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="hidden md:block">
                <ResponsiveSidebar user={user} lang="id" onLogout={onLogout} />
            </div>
            
            <main className="flex-1 min-w-0 relative h-full overflow-y-auto custom-scrollbar">
                {children}
                <MobileBottomNav />
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
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-brand-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
            <Icon name="CheckCircle" size={18} />
            <span className="font-bold text-xs uppercase tracking-wider">{message}</span>
        </div>
    );
};
