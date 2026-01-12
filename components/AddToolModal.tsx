import React, { useState, useEffect } from 'react';
import { Tool, ToolCategory, DivisionType } from '../types';
import { Icon } from './Icon';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Partial<Tool>) => void;
  preselectedDivision?: DivisionType;
  initialData?: Tool; // For editing
  initialCategory?: ToolCategory; // New prop for defaults
}

export const AddToolModal: React.FC<AddToolModalProps> = ({ isOpen, onClose, onSave, preselectedDivision, initialData, initialCategory }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<ToolCategory>(ToolCategory.DAILY);
  const [iconName, setIconName] = useState('Link');
  const [color, setColor] = useState('bg-blue-500');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setUrl(initialData.url);
        setCategory(initialData.category);
        setIconName(initialData.icon || 'Link');
        setColor(initialData.color || 'bg-blue-500');
      } else {
        // Reset defaults
        setName('');
        setUrl('');
        setCategory(initialCategory || ToolCategory.DAILY);
        setIconName('Link');
        setColor('bg-blue-500');
      }
    }
  }, [isOpen, initialData, initialCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id, // Pass ID if editing
      name,
      url,
      category,
      icon: iconName,
      color,
      divisionId: preselectedDivision || initialData?.divisionId,
      isPersonal: !preselectedDivision && !initialData?.divisionId
    });
    onClose();
  };

  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 
    'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 
    'bg-pink-500', 'bg-rose-500', 'bg-slate-500'
  ];

  const commonIcons = ['Link', 'FileText', 'FileSpreadsheet', 'Folder', 'Globe', 'Database', 'Mail', 'MessageCircle', 'Calendar', 'CheckSquare', 'Trash2', 'Settings'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {initialData ? 'Edit Tool' : 'Add New Tool'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="X" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input 
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Monthly Report"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
            <input 
              required
              type="url"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select 
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
                value={category} onChange={e => setCategory(e.target.value as ToolCategory)}
              >
                {Object.values(ToolCategory).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
               <div className="flex flex-wrap gap-2 mt-2">
                 {colors.slice(0, 5).map(c => (
                   <button 
                     key={c}
                     type="button"
                     onClick={() => setColor(c)}
                     className={`w-6 h-6 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                   />
                 ))}
               </div>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
             <div className="flex gap-2 flex-wrap">
                {commonIcons.map(ico => (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => setIconName(ico)}
                    className={`p-2 rounded-lg border ${iconName === ico ? 'border-brand-500 bg-brand-50 dark:bg-brand-900' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <Icon name={ico} size={20} className="text-gray-600 dark:text-gray-300" />
                  </button>
                ))}
             </div>
          </div>

          <button type="submit" className="w-full py-3 mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-md transition-colors">
            {initialData ? 'Save Changes' : 'Add Tool'}
          </button>
        </form>
      </div>
    </div>
  );
};