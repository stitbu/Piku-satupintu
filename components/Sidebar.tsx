
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
    <Link to={to} className={`group flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 ${active ? 'bg-brand-600 text-white shadow-[0_10px_25px_-5px_rgba(14,165,233,0.5)] border border-brand-400/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'} ${isSubItem ? 'xl:py-2.5 xl:px-4' : ''}`}>
        <div className="relative">
            <Icon name={icon} size={isSubItem ? 18 : 22} className={active ? "text-white" : "group-hover:scale-110 transition-transform text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"} />
        </div>
        <span className={`hidden xl:block text-xs font-black uppercase tracking-widest ${active ? 'text-white' : ''}`}>{label}</span>
        <div className="xl:hidden absolute left-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-2xl shadow-black/50">{label}</div>
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
      <div className="h-24 flex items-center justify-center xl:justify-start xl:px-8 shrink-0">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-500/30 text-white font-black italic text-2xl border-2 border-white/20">
            PK
          </div>
          <div className="hidden xl:block ml-4 min-w-0">
            <span className="block font-black text-xl text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Gateway</span>
            <span className="text-[9px] text-brand-600 dark:text-brand-400 font-black uppercase tracking-[0.4em] mt-1">One-Gate System</span>
          </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 flex flex-col gap-1.5 px-4 custom-scrollbar">
          <SidebarItem to="/" icon="LayoutGrid" label={t.sidebar.dashboard} active={isActive('/')} />
          
          <div className="h-px bg-slate-100 dark:bg-white/5 my-4 mx-2"></div>
          
          <SidebarItem to="/messages" icon="MessageSquare" label="Secure Chat" active={isActive('/messages')} />

          <div className="h-px bg-slate-100 dark:bg-white/5 my-4 mx-2"></div>
          
          <div>
              <button 
                onClick={() => setIsDivisionsExpanded(!isDivisionsExpanded)} 
                className={`w-full group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 select-none ${isDivisionsExpanded ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                  <div className="flex items-center gap-3">
                      <Icon name="Layers" size={22} className={isDivisionsExpanded ? "text-brand-600 dark:text-brand-400" : "text-slate-500"} />
                      <span className="hidden xl:block text-xs font-black uppercase tracking-widest">{t.sidebar.divisions}</span>
                  </div>
                  <Icon name="ChevronDown" size={18} className={`hidden xl:block transition-transform duration-500 ${isDivisionsExpanded ? 'rotate-180 text-brand-600' : 'text-slate-300'}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isDivisionsExpanded ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1 xl:pl-4">
                      {visibleDivisions.map(div => (<SidebarItem key={div.id} to={`/division/${div.id}`} icon={div.icon} label={div.name} active={isActive(`/division/${div.id}`)} isSubItem={true}/>))}
                  </div>
              </div>
          </div>
          
          <div className="h-px bg-slate-100 dark:bg-white/5 my-4 mx-2"></div>
          
          <SidebarItem to="/settings" icon="Settings" label={t.sidebar.settings} active={isActive('/settings')} />
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-white/5 shrink-0 bg-slate-50 dark:bg-black/20">
          <div className="flex items-center justify-between gap-3 xl:bg-white dark:xl:bg-white/5 xl:p-4 xl:rounded-[1.5rem] xl:shadow-sm xl:border xl:border-slate-100 dark:xl:border-white/5 group transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-black shadow-lg shrink-0 border-2 border-white dark:border-slate-800">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{user.role}</p>
                  </div>
              </div>
              <button onClick={onLogout} className="hidden xl:flex p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                <Icon name="Power" size={18} />
              </button>
          </div>
      </div>
    </aside>
  );
};
