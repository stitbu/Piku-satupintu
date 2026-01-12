
import React, { useState } from 'react';
import { FinanceTransaction, User, UserRole, DivisionType } from '../types';
import { Icon } from './Icon';

interface FinanceViewProps {
    user: User;
}

const MOCK_TRANSACTIONS: FinanceTransaction[] = [
    { id: 't1', date: '2023-10-25', description: 'Pembelian Kertas A4 (5 Rim)', amount: 250000, type: 'expense', category: 'Operasional', status: 'approved', requesterId: 'u_adm', divisionId: DivisionType.ADMIN },
    { id: 't2', date: '2023-10-24', description: 'Project Down Payment Client X', amount: 5000000, type: 'income', category: 'Sales', status: 'approved', requesterId: 'u_mkt', divisionId: DivisionType.MARKETING },
    { id: 't3', date: '2023-10-23', description: 'Reimburse Transport Meeting', amount: 150000, type: 'expense', category: 'Transport', status: 'pending', requesterId: 'u_mkt', divisionId: DivisionType.MARKETING },
];

export const FinanceView: React.FC<FinanceViewProps> = ({ user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Only Finance & Directors can approve
    const canApprove = user.role === UserRole.ADMIN || user.division === DivisionType.FINANCE || user.division === DivisionType.DIRECTORS;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const filtered = MOCK_TRANSACTIONS.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#020617] via-[#0f172a] to-[#172554] p-6 md:p-8 overflow-y-auto custom-scrollbar">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl"><Icon name="Wallet" size={24}/></span>
                        Keuangan & Kas
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Petty Cash & Reimbursement Dashboard</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-colors">
                    <Icon name="PlusCircle" size={16} /> Ajukan Dana
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-16 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Saldo Kas Kecil</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">{formatCurrency(15400000)}</h3>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border border-emerald-500/30 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Pemasukan (Bulan Ini)</p>
                            <h3 className="text-2xl font-bold text-white">{formatCurrency(25000000)}</h3>
                        </div>
                        <Icon name="TrendingUp" className="text-emerald-400" size={24}/>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 border border-red-500/30 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-red-300 text-xs font-bold uppercase tracking-wider mb-1">Pengeluaran (Bulan Ini)</p>
                            <h3 className="text-2xl font-bold text-white">{formatCurrency(4200000)}</h3>
                        </div>
                        <Icon name="TrendingDown" className="text-red-400" size={24}/>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-black/20 rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-white">Riwayat Transaksi</h3>
                    <div className="relative w-64">
                        <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14}/>
                        <input 
                            className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                            placeholder="Cari transaksi..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/40 text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Keterangan</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Nominal</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filtered.map(t => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-gray-400 text-xs font-mono">{t.date}</td>
                                    <td className="p-4 font-medium text-white">
                                        {t.description}
                                        <div className="text-[10px] text-gray-500 mt-0.5">{t.divisionId}</div>
                                    </td>
                                    <td className="p-4 text-gray-300">{t.category}</td>
                                    <td className={`p-4 font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            t.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                                            t.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {canApprove && t.status === 'pending' && (
                                            <div className="flex justify-center gap-2">
                                                <button className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded" title="Approve"><Icon name="Check" size={14}/></button>
                                                <button className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded" title="Reject"><Icon name="X" size={14}/></button>
                                            </div>
                                        )}
                                        {(!canApprove || t.status !== 'pending') && <button className="text-gray-500 hover:text-white"><Icon name="Eye" size={16}/></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
