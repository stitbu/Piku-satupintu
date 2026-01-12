
import React, { useState, useEffect } from 'react';
import { User, UserRole, DivisionType } from '../types';
import { Icon } from './Icon';
import { DIVISIONS } from '../constants';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  initialData?: User;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    division: DivisionType.MARKETING,
    role: UserRole.STAFF,
    email: '',
    phoneNumber: '',
    username: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          name: '',
          division: DivisionType.MARKETING,
          role: UserRole.STAFF,
          email: '',
          phoneNumber: '',
          username: ''
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.division) return;

    // Auto-generate username/id if new
    const finalUser: User = {
      id: initialData?.id || `emp_${Date.now()}`,
      username: initialData?.username || formData.name?.toLowerCase().replace(/\s/g, '') || 'user',
      name: formData.name!,
      role: formData.role || UserRole.STAFF,
      division: formData.division!,
      stickyNote: initialData?.stickyNote || 'Welcome!',
      email: formData.email,
      phoneNumber: formData.phoneNumber
    };

    onSave(finalUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]">
      <div className="bg-[#1e293b] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Icon name={initialData ? "UserCog" : "UserPlus"} className="text-brand-400"/> 
            {initialData ? 'Edit Karyawan' : 'Tambah Karyawan'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><Icon name="X" size={24}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <input 
              required
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 transition-all placeholder-gray-600"
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Divisi</label>
              <select 
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-brand-500 cursor-pointer"
                value={formData.division}
                onChange={e => setFormData({...formData, division: e.target.value as DivisionType})}
              >
                {DIVISIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Jabatan (Role)</label>
              <select 
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-3 text-white outline-none focus:border-brand-500 cursor-pointer"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
              >
                {Object.values(UserRole).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email (Opsional)</label>
                <input 
                  type="email"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 transition-all placeholder-gray-600"
                  placeholder="user@company.com"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp (Opsional)</label>
                <input 
                  type="tel"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 transition-all placeholder-gray-600"
                  placeholder="62812345678"
                  value={formData.phoneNumber || ''}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                />
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Batal</button>
            <button type="submit" className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
              <Icon name="Save" size={16} /> Simpan Data
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
