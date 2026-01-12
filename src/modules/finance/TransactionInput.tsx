
import React, { useState } from 'react';
import { Icon } from '../../components/Icon';
import { CompanyCode, TransactionType } from '../../types/schema';

interface TransactionInputProps {
    onTransactionSubmit: (tx: any) => void;
    riskAccounts: any[];
    isScanning: boolean;
    onScan: () => Promise<any>;
}

export const TransactionInput: React.FC<TransactionInputProps> = ({ onTransactionSubmit, riskAccounts, isScanning, onScan }) => {
    const [company, setCompany] = useState<CompanyCode>('PK');
    const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
    const [amount, setAmount] = useState<string>('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !title) return;
        onTransactionSubmit({
            company, type, amount: parseFloat(amount), title, category: category || 'General', related_student_id: selectedStudent || undefined
        });
        setAmount(''); setTitle(''); setCategory(''); setSelectedStudent('');
    };

    const handleScanClick = async () => {
        const result = await onScan();
        if (result) {
            setTitle(result.title);
            setAmount(result.amount.toString());
            setCategory(result.category);
        }
    };

    const theme = company === 'PK' ? 'cyan' : 'amber';
    const isIncome = type === TransactionType.INCOME;

    return (
        <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <Icon name="Terminal" className="text-pk-400" />
                    Ledger Entry
                </h3>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black border bg-${theme}-500/10 border-${theme}-500/30 text-${theme}-400`}>
                    CONTEXT: {company}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    <button type="button" onClick={() => setCompany('PK')} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${company === 'PK' ? 'bg-pk-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}>PK - Wallet</button>
                    <button type="button" onClick={() => setCompany('KS')} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${company === 'KS' ? 'bg-ks-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}>KS - Wallet</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entry Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/30 appearance-none font-bold">
                            <option value={TransactionType.INCOME}>Cash Inflow</option>
                            <option value={TransactionType.EXPENSE}>Cash Outflow</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/30 appearance-none font-bold">
                            <option value="">Select Category</option>
                            <option value="Tuition">Student Payment</option>
                            <option value="Operational">Office OpEx</option>
                            <option value="Marketing">Ads & Promotion</option>
                            <option value="Salary">Payroll</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description / Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry notes..." className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-pk-400" />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (IDR)</label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">Rp</span>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white font-mono font-black text-lg outline-none focus:border-pk-400" placeholder="0" />
                        </div>
                        <button type="button" onClick={handleScanClick} disabled={isScanning} className="px-5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg active:scale-90">
                            {isScanning ? <Icon name="Loader2" className="animate-spin"/> : <Icon name="Scan" />}
                        </button>
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    <button 
                        type="submit"
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isIncome ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-red-600 hover:bg-red-500 shadow-red-900/40'}`}
                    >
                        <Icon name={isIncome ? "PlusCircle" : "MinusCircle"} size={20} />
                        {isIncome ? 'Record Income' : 'Post Expense'}
                    </button>
                </div>
            </form>
        </div>
    );
};
