
import { useState, useEffect } from 'react';
import { Transaction, BillingLog, CompanyCode, TransactionType, TransactionStatus, Student } from '../../types/schema';

// --- MOCK DATA ---
const INITIAL_PK_BALANCE = 154000000;
const INITIAL_KS_BALANCE = 42500000;

const MOCK_DEBTORS: (Partial<Student> & { billing: BillingLog })[] = [
    {
        id: 's1', full_name: 'Aditya Pratama', phone: '08123456789', company: 'PK',
        billing: { id: 'b1', student_id: 's1', invoice_number: 'INV-001', total_bill: 5000000, amount_paid: 1000000, remaining_balance: 4000000, due_date: '2023-09-01', late_level: 5 }
    },
    {
        id: 's2', full_name: 'Sarah Amalia', phone: '08567891234', company: 'PK',
        billing: { id: 'b2', student_id: 's2', invoice_number: 'INV-002', total_bill: 4500000, amount_paid: 2000000, remaining_balance: 2500000, due_date: '2023-09-15', late_level: 4 }
    },
    {
        id: 's3', full_name: 'Budi Santoso', phone: '08199887766', company: 'KS',
        billing: { id: 'b3', student_id: 's3', invoice_number: 'INV-KS-01', total_bill: 7500000, amount_paid: 0, remaining_balance: 7500000, due_date: '2023-08-20', late_level: 5 }
    }
];

const MOCK_RECENT_TRANSACTIONS: Transaction[] = [
    { id: 't1', company: 'PK', title: 'Pembayaran SPP Aditya', amount: 1000000, type: TransactionType.INCOME, category: 'Tuition', status: TransactionStatus.APPROVED, transaction_date: '2023-10-25', created_by: 'admin' },
    { id: 't2', company: 'KS', title: 'Sewa Server Ujian', amount: 2500000, type: TransactionType.EXPENSE, category: 'Infrastructure', status: TransactionStatus.APPROVED, transaction_date: '2023-10-24', created_by: 'admin' },
    { id: 't3', company: 'PK', title: 'Iklan Instagram', amount: 500000, type: TransactionType.EXPENSE, category: 'Marketing', status: TransactionStatus.APPROVED, transaction_date: '2023-10-24', created_by: 'marketing' },
];

export const useFinanceLogic = () => {
    // Wallet States
    const [balancePK, setBalancePK] = useState(INITIAL_PK_BALANCE);
    const [balanceKS, setBalanceKS] = useState(INITIAL_KS_BALANCE);
    
    // Data States
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_RECENT_TRANSACTIONS);
    const [riskAccounts, setRiskAccounts] = useState(MOCK_DEBTORS);
    const [isScanning, setIsScanning] = useState(false);

    // --- ACTIONS ---

    const addTransaction = (tx: Partial<Transaction>) => {
        const newTx: Transaction = {
            id: `tx_${Date.now()}`,
            company: tx.company || 'PK',
            title: tx.title || 'Untitled Transaction',
            amount: tx.amount || 0,
            type: tx.type || TransactionType.EXPENSE,
            category: tx.category || 'General',
            status: TransactionStatus.APPROVED, // Auto-approve for demo
            transaction_date: new Date().toISOString().split('T')[0],
            created_by: 'current_user',
            ...tx
        };

        // Update Transactions History
        setTransactions(prev => [newTx, ...prev]);

        // Update Balances
        if (newTx.company === 'PK') {
            setBalancePK(prev => newTx.type === TransactionType.INCOME ? prev + newTx.amount : prev - newTx.amount);
        } else {
            setBalanceKS(prev => newTx.type === TransactionType.INCOME ? prev + newTx.amount : prev - newTx.amount);
        }

        // Update Billing if Student Related
        if (newTx.related_student_id && newTx.type === TransactionType.INCOME) {
            setRiskAccounts(prev => prev.map(acc => {
                if (acc.id === newTx.related_student_id) {
                    const newPaid = (acc.billing.amount_paid || 0) + newTx.amount;
                    const newRemaining = (acc.billing.total_bill || 0) - newPaid;
                    // Auto reduce late level if debt is cleared significantly (logic simplified)
                    const newLevel = newRemaining < 1000000 ? 0 : acc.billing.late_level;
                    
                    return {
                        ...acc,
                        billing: {
                            ...acc.billing,
                            amount_paid: newPaid,
                            remaining_balance: newRemaining,
                            late_level: newLevel as any
                        }
                    };
                }
                return acc;
            }));
        }
    };

    const simulateScanReceipt = async () => {
        setIsScanning(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsScanning(false);
        return {
            title: 'Pembayaran Via QRIS (Scanned)',
            amount: 1500000,
            category: 'Tuition'
        };
    };

    return {
        balancePK,
        balanceKS,
        transactions,
        riskAccounts,
        isScanning,
        addTransaction,
        simulateScanReceipt
    };
};
