import React, { useState, useRef } from 'react';
import { Upload, Plus, X, FileText } from 'lucide-react';
import { createDomain } from '../services/storageService';
import { Domain } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newDomains: Domain[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'file'>('manual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = () => {
    if (!textInput.trim()) return;
    
    // Split by newlines or commas
    const names = textInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    const newDomains = names.map(name => createDomain(name));
    
    onImport(newDomains);
    setTextInput('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const names = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        const newDomains = names.map(name => createDomain(name));
        onImport(newDomains);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-900">添加域名</h3>
          <button onClick={onClose} aria-label="Close import modal" className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        </div>

        <div className="flex p-2 gap-2 bg-gray-50 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${activeTab === 'manual' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            手动输入
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${activeTab === 'file' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            文件导入
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'manual' ? (
            <div className="space-y-4">
               <p className="text-sm text-gray-600">输入域名，每行一个。</p>
               <textarea
                 className="w-full h-40 rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="example.com&#10;test.org&#10;awesome-project.net"
                 value={textInput}
                 onChange={(e) => setTextInput(e.target.value)}
               />
               <button 
                 onClick={handleManualSubmit}
                 className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex justify-center items-center"
               >
                 <Plus className="w-4 h-4 mr-2" /> 添加域名
               </button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">点击上传 .txt 文件</p>
                <p className="text-xs text-gray-500 mt-1">支持每行一个域名</p>
              </div>
              <input 
                type="file" 
                aria-label="Upload domain list file"
                ref={fileInputRef} 
                accept=".txt" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;