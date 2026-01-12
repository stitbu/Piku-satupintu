
import React, { useState } from 'react';
import { AssetItem, User, UserRole, DivisionType } from '../types';
import { Icon } from './Icon';

interface InventoryViewProps {
    user: User;
}

const MOCK_ASSETS: AssetItem[] = [
    { id: 'a1', code: 'IT-LP-001', name: 'MacBook Pro M1', category: 'Elektronik', condition: 'Good', location: 'R. Direksi', purchaseDate: '2023-01-15' },
    { id: 'a2', code: 'GA-AC-005', name: 'AC Daikin 2PK', category: 'Fasilitas', condition: 'Repair', location: 'R. Meeting Utama', purchaseDate: '2022-05-20' },
    { id: 'a3', code: 'IT-PR-002', name: 'Printer Epson L3110', category: 'Elektronik', condition: 'Good', location: 'R. Admin', purchaseDate: '2023-03-10' },
    { id: 'a4', code: 'GA-CR-012', name: 'Kursi Kerja Ergonomis', category: 'Furniture', condition: 'Broken', location: 'Gudang', purchaseDate: '2021-11-05' },
];

export const InventoryView: React.FC<InventoryViewProps> = ({ user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCondition, setFilterCondition] = useState('All');

    const canEdit = user.role === UserRole.ADMIN || user.division === DivisionType.GA_SECURITY || user.division === DivisionType.IT_SUPPORT;

    const filteredAssets = MOCK_ASSETS.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCondition = filterCondition === 'All' || a.condition === filterCondition;
        return matchesSearch && matchesCondition;
    });

    const getConditionBadge = (cond: string) => {
        switch(cond) {
            case 'Good': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Repair': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Broken': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#020617] via-[#0f172a] to-[#172554] p-6 md:p-8 overflow-hidden">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl"><Icon name="Package" size={24}/></span>
                        Aset & Inventaris
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Monitoring Aset Kantor & Fasilitas</p>
                </div>
                
                {canEdit && (
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-colors">
                        <Icon name="Plus" size={16} /> Input Aset
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 shrink-0">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                    <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-indigo-500"
                        placeholder="Cari nama atau kode aset..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {['All', 'Good', 'Repair', 'Broken', 'Lost'].map(c => (
                    <button 
                        key={c}
                        onClick={() => setFilterCondition(c)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${filterCondition === c ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 overflow-hidden shadow-xl flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-semibold sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4">Kode & Nama</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Lokasi</th>
                                <th className="p-4">Kondisi</th>
                                <th className="p-4">Tgl Beli</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredAssets.map(asset => (
                                <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{asset.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{asset.code}</div>
                                    </td>
                                    <td className="p-4 text-gray-300">{asset.category}</td>
                                    <td className="p-4 text-gray-300 flex items-center gap-1"><Icon name="MapPin" size={12} className="text-gray-500"/> {asset.location}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getConditionBadge(asset.condition)}`}>
                                            {asset.condition}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs">{asset.purchaseDate}</td>
                                    <td className="p-4 text-center">
                                        {canEdit && (
                                            <div className="flex justify-center gap-2">
                                                <button className="p-1.5 hover:bg-white/10 rounded text-blue-400"><Icon name="Edit" size={16}/></button>
                                                <button className="p-1.5 hover:bg-white/10 rounded text-red-400"><Icon name="Trash2" size={16}/></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredAssets.length === 0 && <p className="text-center py-10 text-gray-500 italic">Data tidak ditemukan.</p>}
                </div>
            </div>
        </div>
    );
};
