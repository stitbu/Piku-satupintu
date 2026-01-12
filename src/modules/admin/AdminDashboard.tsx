
import React, { useState } from 'react';
import { AdmissionForm } from './AdmissionForm';
import { Icon } from '../../components/Icon';

export const AdminDashboard: React.FC = () => {
    // In future phases, this can toggle between "Admission", "Billing", "Academic", etc.
    const [activeSubModule, setActiveSubModule] = useState<'ADMISSION' | 'RECORDS'>('ADMISSION');

    return (
        <div className="flex flex-col h-full gap-6">
            
            {/* Admin Module Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Icon name="ShieldCheck" className="text-indigo-400" size={28} />
                        Administration & SIM
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Centralized academic operations and student intake.</p>
                </div>

                <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex gap-1">
                    <button 
                        onClick={() => setActiveSubModule('ADMISSION')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSubModule === 'ADMISSION' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Icon name="UserPlus" size={16} /> Admission
                    </button>
                    <button 
                        onClick={() => setActiveSubModule('RECORDS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSubModule === 'RECORDS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Icon name="Database" size={16} /> Data Records
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 bg-[#0f172a]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl relative overflow-hidden">
                {activeSubModule === 'ADMISSION' ? (
                    <AdmissionForm />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                        <Icon name="Server" size={64} className="mb-4 text-indigo-900" />
                        <p>Student Records Database - Coming Soon in Phase 4</p>
                    </div>
                )}
            </div>
        </div>
    );
};
