
import React, { useState } from 'react';
import { DocItem, User, DivisionType, UserRole } from '../types';
import { Icon } from './Icon';

interface DocumentsViewProps {
    user: User;
}

const MOCK_DOCS: DocItem[] = [
    { id: 'f1', name: 'SOP Perusahaan', type: 'folder', parentId: null, updatedAt: '2023-10-01', accessLevel: 'public', ownerDivision: DivisionType.ADMIN },
    { id: 'f2', name: 'Marketing Assets', type: 'folder', parentId: null, updatedAt: '2023-10-05', accessLevel: 'public', ownerDivision: DivisionType.MARKETING },
    { id: 'f3', name: 'Laporan Keuangan', type: 'folder', parentId: null, updatedAt: '2023-10-10', accessLevel: 'restricted', ownerDivision: DivisionType.FINANCE },
    { id: 'd1', name: 'SOP Absensi.pdf', type: 'file', parentId: 'f1', size: '2.4 MB', updatedAt: '2023-10-02', accessLevel: 'public', ownerDivision: DivisionType.HR },
    { id: 'd2', name: 'Logo Pack.zip', type: 'file', parentId: 'f2', size: '15 MB', updatedAt: '2023-10-06', accessLevel: 'public', ownerDivision: DivisionType.MARKETING },
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({ user }) => {
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const getBreadcrumbs = () => {
        const crumbs = [{ id: null, name: 'Home' }];
        if (currentFolder) {
            const folder = MOCK_DOCS.find(d => d.id === currentFolder);
            if (folder) crumbs.push({ id: folder.id, name: folder.name });
        }
        return crumbs;
    };

    const currentItems = MOCK_DOCS.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFolder = item.parentId === currentFolder;
        
        // Filter out restricted folders for non-admin/non-owners
        const hasAccess = item.accessLevel === 'public' || 
                          user.role === UserRole.ADMIN || 
                          item.ownerDivision === user.division;

        if (searchTerm) return matchesSearch && hasAccess;
        return matchesFolder && hasAccess;
    });

    const handleItemClick = (item: DocItem) => {
        if (item.type === 'folder') {
            setCurrentFolder(item.id);
        } else {
            alert(`Opening file: ${item.name}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#020617] via-[#0f172a] to-[#172554] p-6 md:p-8 overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><Icon name="FolderOpen" size={24}/></span>
                        E-Arsip & Dokumen
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Penyimpanan Digital Terpusat & SOP</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                        <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-amber-500"
                            placeholder="Cari file..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300">
                        <Icon name={viewMode === 'grid' ? "List" : "Grid"} size={20} />
                    </button>
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
                        <Icon name="UploadCloud" size={16} /> Upload
                    </button>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-400 overflow-x-auto shrink-0">
                {getBreadcrumbs().map((crumb, idx) => (
                    <React.Fragment key={idx}>
                        {idx > 0 && <Icon name="ChevronRight" size={14} />}
                        <button 
                            onClick={() => setCurrentFolder(crumb.id as string)}
                            className={`hover:text-white transition-colors whitespace-nowrap ${idx === getBreadcrumbs().length - 1 ? 'font-bold text-white' : ''}`}
                        >
                            {crumb.name}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-2xl border border-white/5 p-4">
                {currentItems.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                        <Icon name="FolderOpen" size={48} className="mb-2 opacity-30"/>
                        <p>Folder ini kosong.</p>
                    </div>
                )}

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {currentItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="flex flex-col items-center p-4 rounded-xl hover:bg-white/10 transition-colors group text-center"
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg ${item.type === 'folder' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    <Icon name={item.type === 'folder' ? "Folder" : "FileText"} size={32} />
                                </div>
                                <span className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-2">{item.name}</span>
                                <span className="text-[10px] text-gray-500 mt-1">{item.updatedAt}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col space-y-2">
                        {currentItems.map(item => (
                            <div key={item.id} onClick={() => handleItemClick(item)} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${item.type === 'folder' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        <Icon name={item.type === 'folder' ? "Folder" : "FileText"} size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">{item.name}</p>
                                        <p className="text-[10px] text-gray-500">{item.ownerDivision} • {item.updatedAt}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">{item.size || '-'}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
