
import React, { useMemo } from 'react';
import { User, DivisionType, UserRole } from '../types';
import { Icon } from './Icon';

interface OrgChartProps {
    users: User[];
}

interface UserCardProps {
    user: User;
    isBoss?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, isBoss = false }) => (
    <div className={`flex flex-col items-center p-3 rounded-xl border ${isBoss ? 'bg-gradient-to-b from-indigo-900/50 to-indigo-950/50 border-indigo-500/50 shadow-lg shadow-indigo-500/20' : 'bg-gray-800/50 border-gray-700'} w-32 md:w-40 relative group transition-transform hover:scale-105`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2 shadow-inner ${isBoss ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-600'}`}>
            {user.name.charAt(0)}
        </div>
        <p className="text-xs font-bold text-white text-center leading-tight truncate w-full">{user.name}</p>
        <p className={`text-[10px] text-center mt-0.5 truncate w-full ${isBoss ? 'text-indigo-200' : 'text-gray-400'}`}>{user.role}</p>
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 bg-black/90 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 left-1/2 -translate-x-1/2">
            {user.email || 'No Email'}
        </div>
    </div>
);

export const OrgChart: React.FC<OrgChartProps> = ({ users }) => {
    
    // Group users by Division
    const orgStructure = useMemo(() => {
        const divisions: Record<string, { managers: User[], staff: User[] }> = {};
        
        // Initialize divisions
        Object.values(DivisionType).forEach(div => {
            divisions[div] = { managers: [], staff: [] };
        });

        // Distribute users
        users.forEach(u => {
            const divKey = u.division; 
            if (!divisions[divKey]) divisions[divKey] = { managers: [], staff: [] };

            if (u.role === UserRole.ADMIN) {
                // Admin usually separate
            } else if (u.role === UserRole.MANAGER || u.role.toLowerCase().includes('direktur') || u.role.toLowerCase().includes('gm') || u.role.toLowerCase().includes('spv')) {
                divisions[divKey].managers.push(u);
            } else {
                divisions[divKey].staff.push(u);
            }
        });

        return divisions;
    }, [users]);

    // Director Node (Top Level)
    const directors = users.filter(u => u.division === DivisionType.DIRECTORS);
    const otherDivisions = Object.keys(orgStructure).filter(d => d !== DivisionType.DIRECTORS);

    return (
        <div className="overflow-x-auto p-10 min-h-[600px] flex justify-center custom-scrollbar">
            <div className="flex flex-col items-center space-y-12 min-w-max">
                
                {/* Level 1: Directors */}
                {directors.length > 0 && (
                    <div className="flex gap-8 justify-center relative">
                        {directors.map(d => <UserCard key={d.id} user={d} isBoss={true} />)}
                        {/* Line down */}
                        <div className="absolute top-full left-1/2 w-px h-12 bg-gray-500/50 -translate-x-1/2"></div>
                    </div>
                )}

                {/* Connector Horizontal Line */}
                <div className="w-[90%] h-px bg-gray-500/50 relative"></div>

                {/* Level 2: Divisions */}
                <div className="flex gap-12 items-start justify-center">
                    {otherDivisions.map((divName) => {
                        const data = orgStructure[divName];
                        if (data.managers.length === 0 && data.staff.length === 0) return null;

                        return (
                            <div key={divName} className="flex flex-col items-center relative">
                                {/* Connector up */}
                                <div className="absolute bottom-full h-12 w-px bg-gray-500/50"></div>
                                
                                {/* Division Label */}
                                <div className="mb-4 bg-gray-900 border border-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-300 z-10 whitespace-nowrap">
                                    {divName}
                                </div>

                                {/* Managers */}
                                <div className="flex flex-col gap-4 mb-4 relative">
                                    {data.managers.map(m => (
                                        <div key={m.id} className="relative">
                                            <UserCard user={m} isBoss={true} />
                                            {data.staff.length > 0 && <div className="absolute top-full left-1/2 w-px h-4 bg-gray-600 -translate-x-1/2"></div>}
                                        </div>
                                    ))}
                                </div>

                                {/* Staff Grid */}
                                {data.staff.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-700/50 relative">
                                        {/* Connector up to manager */}
                                        <div className="absolute bottom-full left-1/2 w-px h-2 bg-gray-600 -translate-x-1/2"></div>
                                        
                                        {data.staff.map(s => (
                                            <div key={s.id} className="bg-white/5 border border-white/5 p-2 rounded flex items-center gap-2 w-32 md:w-40 hover:bg-white/10 transition-colors">
                                                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[8px] text-white shrink-0">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] text-white truncate">{s.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
