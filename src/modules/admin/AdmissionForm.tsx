
import React, { useState } from 'react';
import { useAdmissionLogic } from './useAdmissionLogic';
import { Icon } from '../../components/Icon';
import { ProgramType } from '../../types/schema';
import { GeminiService } from '../../services/geminiService';

export const AdmissionForm: React.FC = () => {
    const { 
        step, formData, billing, verification, isLoading, isScanning,
        handleInputChange, nextStep, submitAdmission
    } = useAdmissionLogic();

    const [aiTerminalOpen, setAiTerminalOpen] = useState(false);
    const [rawInput, setRawInput] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    const handleAiIngest = async () => {
        if (!rawInput.trim()) return;
        setIsParsing(true);
        const data = await GeminiService.parseAdmissionText(rawInput);
        if (data.full_name) handleInputChange('full_name', data.full_name);
        if (data.nik) handleInputChange('nik', data.nik);
        if (data.phone) handleInputChange('phone', data.phone);
        if (data.address) handleInputChange('address', data.address);
        if (data.mother_name) handleInputChange('mother_name', data.mother_name);
        setIsParsing(false);
        setAiTerminalOpen(false);
        setRawInput('');
    };

    return (
        <div className="flex flex-col h-full gap-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Admission Terminal</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Digital Student Ingest Gateway V3.0</p>
                </div>
                <button 
                    onClick={() => setAiTerminalOpen(true)}
                    className="flex items-center gap-3 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.5)] active:scale-95"
                >
                    <Icon name="Zap" size={16} /> 
                    <span>Open AI Ingest Terminal</span>
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                <div className="flex-1 bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 overflow-y-auto custom-scrollbar shadow-2xl relative">
                    <div className="space-y-10">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Icon name="User" size={18}/></div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Identity Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nama Lengkap" value={formData.full_name} onChange={v => handleInputChange('full_name', v)} placeholder="Sesuai KTP" />
                                <InputField label="NIK (Nomor Induk)" value={formData.nik} onChange={v => handleInputChange('nik', v)} placeholder="16 Digit NIK" mono />
                                <InputField label="Phone / WhatsApp" value={formData.phone} onChange={v => handleInputChange('phone', v)} placeholder="628..." mono />
                                <InputField label="Email Address" value={formData.email} onChange={v => handleInputChange('email', v)} placeholder="student@example.com" />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Icon name="GraduationCap" size={18}/></div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Academic Target</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Jalur Pendaftaran</label>
                                    <select className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-pk-400 appearance-none font-bold text-sm" value={formData.program_type} onChange={e => handleInputChange('program_type', e.target.value)}>
                                        <option value="">-- Pilih Program --</option>
                                        {Object.values(ProgramType).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <InputField label="Nama Ibu Kandung" value={formData.mother_name} onChange={v => handleInputChange('mother_name', v)} placeholder="Wajib untuk Sinkron PDDIKTI" />
                            </div>
                        </section>
                    </div>
                </div>

                <div className="w-full lg:w-[400px] flex flex-col gap-6">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-200">Tuition Preview</span>
                            <div className="mt-8 space-y-4">
                                <div className="flex justify-between items-end border-b border-white/20 pb-4">
                                    <span className="text-xs font-bold text-indigo-100">Total Tagihan</span>
                                    <span className="text-2xl font-black font-mono">Rp {new Intl.NumberFormat('id-ID').format(billing.total_bill || 0)}</span>
                                </div>
                                <p className="text-[10px] text-indigo-100/60 leading-relaxed mt-4 italic">*Nilai estimasi SPP Semester 1.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Icon name="FileCheck" size={18}/></div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Admission Status</h4>
                        </div>
                        <div className="space-y-4 flex-1">
                            <StepItem label="Identity Input" active={step === 1} completed={step > 1} />
                            <StepItem label="Document Verification" active={step === 2} completed={step > 2} />
                            <StepItem label="Validation & NIM" active={step === 3} completed={step > 3} />
                        </div>
                        <button onClick={nextStep} className="w-full py-5 bg-pk-500 hover:bg-pk-400 text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_15px_30px_-10px_rgba(14,165,233,0.5)] transition-all active:scale-95 mt-6">
                            Next Stage
                        </button>
                    </div>
                </div>
            </div>
            {/* Modal and Styles */}
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder, mono = false }: any) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <input 
            className={`w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-pk-400 transition-all text-sm placeholder-slate-700 ${mono ? 'font-mono' : ''}`} 
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
        />
    </div>
);

const StepItem = ({ label, active, completed }: any) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${active ? 'bg-pk-500/10 border-pk-500/20' : 'border-transparent'}`}>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${completed ? 'bg-emerald-500 text-slate-950' : (active ? 'bg-pk-500 text-slate-950' : 'bg-slate-800 text-slate-600')}`}>
            {completed ? <Icon name="Check" size={14} /> : <Icon name="ChevronRight" size={14} />}
        </div>
        <span className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
    </div>
);
