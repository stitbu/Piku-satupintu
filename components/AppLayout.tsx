
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { CompanyCode, User } from '../types/schema';

interface AppLayoutProps {
    children: React.ReactNode;
    user: User; // Using new Schema User
    onLogout: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, user, onLogout }) => {
    // State for Company Context (PK = Pintu Kuliah, KS = Kunci Sarjana)
    const [companyContext, setCompanyContext] = useState<CompanyCode>('PK');
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Theme Variables based on Context
    const theme = {
        PK: {
            primary: 'text-pk-400',
            bg: 'bg-pk-500',
            border: 'border-pk-500/30',
            gradient: 'from-pk-600 to-blue-600',
            glow: 'shadow-pk-500/20'
        },
        KS: {
            primary: 'text-ks-400',
            bg: 'bg-ks-500',
            border: 'border-ks-500/30',
            gradient: 'from-ks-600 to-orange-600',
            glow: 'shadow-ks-500/20'
        }
    }[companyContext];

    // Navigation Items
    const navItems = [
        { id: 'dashboard', label: 'Command Center', icon: 'LayoutGrid', path: '/' },
        { id: 'marketing', label: 'Marketing & Leads', icon: 'Megaphone', path: '/marketing' },
        { id: 'admin', label: 'Administration', icon: 'FileText', path: '/admin' },
        { id: 'finance', label: 'Finance & Billing', icon: 'Wallet', path: '/finance' },
        { id: 'settings', label: 'System Config', icon: 'Settings', path: '/settings' },
    ];

    const toggleContext = () => {
        setCompanyContext(prev => prev === 'PK' ? 'KS' : 'PK');
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans transition-colors duration-500">
            
            {/* SIDEBAR */}
            <aside 
                className={`
                    relative z-20 h-full glass-panel flex flex-col transition-all duration-300
                    ${isSidebarCollapsed ? 'w-20' : 'w-72'}
                `}
            >
                {/* Logo & Switcher Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
                    {!isSidebarCollapsed && (
                        <div className="flex items-center gap-3 animate-[fadeIn_0.3s]">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-950 ${theme.bg} transition-colors duration-300`}>
                                {companyContext}
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white">
                                {companyContext === 'PK' ? 'Pintu Kuliah' : 'Kunci Sarjana'}
                            </span>
                        </div>
                    )}
                    {isSidebarCollapsed && (
                        <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center font-bold text-slate-950 ${theme.bg} cursor-pointer`} onClick={toggleContext}>
                            {companyContext}
                        </div>
                    )}
                </div>

                {/* Company Context Toggle (Visible when expanded) */}
                {!isSidebarCollapsed && (
                    <div className="px-6 py-6">
                        <button 
                            onClick={toggleContext}
                            className={`
                                w-full py-2 px-3 rounded-lg border border-white/10 glass
                                flex items-center justify-between group hover:border-white/20 transition-all
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Icon name="RefreshCw" size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                                <span className="text-xs font-medium text-slate-400 group-hover:text-white">Switch Context</span>
                            </div>
                            <div className="flex gap-1">
                                <div className={`w-2 h-2 rounded-full ${companyContext === 'PK' ? 'bg-pk-400' : 'bg-slate-700'}`}></div>
                                <div className={`w-2 h-2 rounded-full ${companyContext === 'KS' ? 'bg-ks-400' : 'bg-slate-700'}`}></div>
                            </div>
                        </button>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive 
                                        ? `bg-white/5 border border-white/5 ${theme.primary} shadow-lg` 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon name={item.icon} size={20} className={isActive ? theme.primary : ''} />
                                {!isSidebarCollapsed && (
                                    <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                                        {item.label}
                                    </span>
                                )}
                                {isActive && !isSidebarCollapsed && (
                                    <div className={`ml-auto w-1.5 h-1.5 rounded-full ${theme.bg}`}></div>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors" onClick={onLogout}>
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${theme.gradient} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                            {user?.username?.substring(0,2).toUpperCase() || 'US'}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{user?.full_name || 'User'}</p>
                                <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Guest'}</p>
                            </div>
                        )}
                        {!isSidebarCollapsed && <Icon name="LogOut" size={14} className="text-slate-500 hover:text-red-400" />}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <Icon name={isSidebarCollapsed ? "Menu" : "ChevronLeft"} size={20} />
                        </button>
                        
                        {/* Breadcrumbs / Page Title */}
                        <div className="hidden md:flex items-center gap-2 text-sm">
                            <span className="text-slate-500">ERP</span>
                            <span className="text-slate-600">/</span>
                            <span className={`font-medium ${theme.primary}`}>
                                {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Command Palette Trigger */}
                        <button className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-400 hover:border-white/20 hover:text-white transition-all group">
                            <Icon name="Search" size={14} />
                            <span className="text-xs">Quick Command</span>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded border border-white/5 text-slate-500 group-hover:text-slate-300">Ctrl+K</span>
                        </button>

                        <div className="h-6 w-px bg-white/10"></div>

                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                            <Icon name="Bell" size={18} />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </button>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 scroll-smooth relative">
                    {/* Background Glow Effect */}
                    <div className={`fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b ${theme.gradient} opacity-[0.03] pointer-events-none`}></div>
                    
                    <div className="relative z-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>

            </main>
        </div>
    );
};
