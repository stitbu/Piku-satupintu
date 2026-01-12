
import React from 'react';
import { useFinanceLogic } from './useFinanceLogic';
import { TransactionInput } from './TransactionInput';
import { RiskMonitorWidget } from './RiskMonitorWidget';
import { Icon } from '../../components/Icon';

export const FinanceDashboard: React.FC = () => {
    const { 
        balancePK, balanceKS, transactions, riskAccounts, isScanning, 
        addTransaction, simulateScanReceipt 
    } = useFinanceLogic();

    const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    return (
        <div className="flex flex-col h-full gap-8 animate-fade-in">
            {/* 1. Header & Dual Wallets */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Icon name="Wallet" className="text-emerald-400" size={32} />
                        Liquidity Ledger
                    </h1>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mt-1">Unified Cashflow Management</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <WalletHeader label="PK - Pintu Kuliah" balance={balancePK} color="from-cyan-600 to-blue-700" />
                    <WalletHeader label="KS - Kunci Sarjana" balance={balanceKS} color="from-orange-600 to-red-700" />
                </div>
            </div>

            {/* 2. Main Workspace Grid */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: Transaction Terminal (Fixed Col) */}
                <div className="lg:col-span-4 h-full">
                    <TransactionInput 
                        onTransactionSubmit={addTransaction} 
                        riskAccounts={riskAccounts} 
                        isScanning={isScanning}
                        onScan={simulateScanReceipt}
                    />
                </div>

                {/* Right: Risk Monitor & Recent History (Fluid) */}
                <div className="lg:col-span-8 flex flex-col gap-8 min-h-0">
                    <div className="flex-1 min-h-0">
                        <RiskMonitorWidget accounts={riskAccounts} />
                    </div>

                    <div className="h-[280px] bg-[#0b1120] border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl text-slate-400 shadow-inner"><Icon name="History" size={18}/></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Transaction Stream</h3>
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Auto-Synced with Master Sheet</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-inner ${tx.company === 'PK' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                            {tx.company}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-pk-400 transition-colors">{tx.title}</p>
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">{tx.transaction_date} • {tx.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-mono font-black text-lg tracking-tighter ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'} {formatIDR(tx.amount)}
                                        </span>
                                        <p className="text-[8px] text-slate-700 font-black uppercase tracking-tighter">Approved</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WalletHeader = ({ label, balance, color }: any) => (
    <div className={`flex-1 min-w-[220px] p-5 rounded-2xl bg-gradient-to-br ${color} shadow-2xl relative overflow-hidden border border-white/10 group`}>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.4em] mb-2">{label}</p>
        <h3 className="text-xl font-black text-white font-mono tracking-tighter">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(balance)}
        </h3>
    </div>
);
