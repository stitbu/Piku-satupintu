
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { DIVISIONS } from '../constants';
import { Icon } from './Icon';
import { translations, LanguageCode } from '../translations';

interface SidebarProps {
  user: User;
  lang: LanguageCode;
  onLogout: () => void;
}

const SidebarItem: React.FC<{ to: string; icon: string; label: string; active?: boolean; isSubItem?: boolean }> = ({ to, icon, label, active, isSubItem }) => (
    <Link to={to} className={`
        group flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl transition-all duration-200 relative overflow-hidden mb-1
        ${active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1 font-bold' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
        } 
        ${isSubItem ? 'pl-10 text-sm' : ''}
    `}>
        {/* Active Indicator Bar on Left */}
        {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/30 rounded-r-full"></div>}
        
        <div className={`relative z-10 flex items-center justify-center transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            <Icon name={icon} size={isSubItem ? 18 : 22} className={active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200"} />
        </div>
        
        <span className={`relative z-10 text-xs tracking-wide uppercase ${active ? 'text-white' : ''}`}>
            {label}
        </span>
        
        {/* Subtle glow for active item */}
        {active && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>}
    </Link>
);

export const ResponsiveSidebar: React.FC<SidebarProps> = ({ user, lang, onLogout }) => {
  const location = useLocation(); 
  const isActive = (path: string) => location.pathname === path;
  const [isDivisionsExpanded, setIsDivisionsExpanded] = useState(false);
  const t = translations[lang] || translations.en;
  
  useEffect(() => { 
      if (location.pathname.includes('/division/')) setIsDivisionsExpanded(true); 
  }, [location.pathname]);
  
  const visibleDivisions = useMemo(() => { 
      if (user.role === UserRole.ADMIN) return DIVISIONS; 
      return DIVISIONS.filter(d => d.id === user.division); 
  }, [user]);

  return (
    <aside className="hidden md:flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 transition-all duration-300 md:w-24 xl:w-72 z-50">
      
      {/* HEADER LOGO */}
      <div className="h-24 flex items-center justify-center xl:justify-start xl:px-6 shrink-0 border-b border-slate-100 dark:border-white/5">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl text-white font-black italic text-2xl border border-slate-700">
            PK
          </div>
          <div className="hidden xl:block ml-3 min-w-0">
            <span className="block font-black text-lg text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Gateway</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">One-Gate System</span>
          </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 custom-scrollbar">
          <div className="px-6 mb-2 hidden xl:block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu Utama</span>
          </div>
          
          <SidebarItem to="/" icon="LayoutGrid" label={t.sidebar.dashboard} active={isActive('/')} />
          <SidebarItem to="/messages" icon="MessageSquare" label="Secure Chat" active={isActive('/messages')} />

          <div className="my-4 border-t border-slate-100 dark:border-white/5 mx-4"></div>
          
          <div className="px-6 mb-2 hidden xl:block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modul Kerja</span>
          </div>

          <div>
              <button 
                onClick={() => setIsDivisionsExpanded(!isDivisionsExpanded)} 
                className={`w-[calc(100%-1rem)] mx-2 group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isDivisionsExpanded ? 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                  <div className="flex items-center gap-3">
                      <Icon name="Layers" size={22} className={isDivisionsExpanded ? "text-blue-600" : "text-slate-400"} />
                      <span className="hidden xl:block text-xs font-bold uppercase tracking-wide">{t.sidebar.divisions}</span>
                  </div>
                  <Icon name="ChevronDown" size={16} className={`hidden xl:block transition-transform duration-300 ${isDivisionsExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDivisionsExpanded ? 'max-h-[600px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1">
                      {visibleDivisions.map(div => (<SidebarItem key={div.id} to={`/division/${div.id}`} icon={div.icon} label={div.name} active={isActive(`/division/${div.id}`)} isSubItem={true}/>))}
                  </div>
              </div>
          </div>

          <div className="hidden xl:block px-6 mt-6 mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise</span>
          </div>
          
          <SidebarItem to="/marketing" icon="Megaphone" label="Marketing" active={isActive('/marketing')} />
          <SidebarItem to="/admin" icon="FileText" label="Administration" active={isActive('/admin')} />
          <SidebarItem to="/finance" icon="Wallet" label="Finance" active={isActive('/finance')} />
          
          <div className="my-4 border-t border-slate-100 dark:border-white/5 mx-4"></div>
          
          <SidebarItem to="/settings" icon="Settings" label={t.sidebar.settings} active={isActive('/settings')} />
      </nav>

      {/* USER PROFILE FOOTER */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-black/20 transition-all cursor-pointer group shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/5">
              <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{user.role}</p>
                  </div>
              </div>
              <button onClick={onLogout} className="hidden xl:flex p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Logout">
                <Icon name="Power" size={16} />
              </button>
          </div>
      </div>
    </aside>
  );
};
