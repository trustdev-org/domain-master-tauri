import React, { useState, useEffect } from 'react';
import { Domain, DomainStatus } from '../types';
import { X, Calendar, AlertCircle, Save, FileText, ChevronDown } from 'lucide-react';

interface DomainModalProps {
  domain: Domain;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedDomain: Domain) => void;
  initialTab?: 'details' | 'formatted_whois' | 'raw_whois';
}

const DomainModal: React.FC<DomainModalProps> = ({ domain, isOpen, onClose, onUpdate, initialTab }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'formatted_whois' | 'raw_whois'>('details');
  const [formData, setFormData] = useState<Domain>(domain);

  useEffect(() => {
    setFormData(domain);
  }, [domain]);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    } else if (isOpen && !initialTab) {
      // Reset to default if no initialTab provided
      setActiveTab('details');
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
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

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  const handleChange = (field: keyof Domain, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-sm text-gray-500 mt-1">托管域名</p>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            详情与设置
          </button>
          <button
            onClick={() => setActiveTab('formatted_whois')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'formatted_whois' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Whois信息
          </button>
          <button
            onClick={() => setActiveTab('raw_whois')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'raw_whois' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            原始 WHOIS 记录
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'details' && (
            <div className="space-y-6">
              
              {/* Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">所有权状态</label>
                  <div className="relative">
                    <select
                      aria-label="Ownership Status"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="appearance-none w-full rounded-lg border-gray-300 border p-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value={DomainStatus.OWNED}>✅ 已拥有</option>
                      <option value={DomainStatus.BACKORDER}>⚡ 抢注中</option>
                      <option value={DomainStatus.WATCHLIST}>👀 关注列表</option>
                      <option value={DomainStatus.EXPIRED}>❌ 已过期</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">注册商</label>
                   <input
                    type="text"
                    value={formData.registrar}
                    onChange={(e) => handleChange('registrar', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-white text-gray-900"
                    placeholder="例如：GoDaddy, Namecheap"
                   />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <label className="flex items-center text-sm font-bold text-gray-900 mb-1">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" /> 注册日期
                  </label>
                  <input
                    type="date"
                    aria-label="Registration Date"
                    value={formData.registrationDate || ''}
                    onChange={(e) => handleChange('registrationDate', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-bold text-gray-900 mb-1">
                    <AlertCircle className="w-4 h-4 mr-2 text-gray-500" /> 过期日期
                  </label>
                  <input
                    type="date"
                    aria-label="Expiration Date"
                    value={formData.expirationDate || ''}
                    onChange={(e) => handleChange('expirationDate', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">备注</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-white text-gray-900"
                  placeholder="项目详情、购买价格等..."
                />
              </div>
            </div>
          )}

          {activeTab === 'formatted_whois' && (
            <div className="h-full">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full overflow-y-auto">
                {(() => {
                  try {
                    // Try to parse as JSON (RDAP format)
                    const rdapData = JSON.parse(formData.rawWhois);
                    
                    const getValue = (label: string, value: any) => (
                      <div className="mb-3 pb-3 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                        <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</span>
                        <span className="block text-sm text-gray-900 font-mono break-all">{value || 'N/A'}</span>
                      </div>
                    );

                    return (
                      <div className="space-y-2">
                         {getValue('Domain Name', rdapData.ldhName || rdapData.handle)}
                         {getValue('Registry Domain ID', rdapData.handle)}
                         {getValue('Status', Array.isArray(rdapData.status) ? rdapData.status.join(', ') : rdapData.status)}
                         
                         {rdapData.events && (
                           <div className="mb-3 pb-3 border-b border-gray-200">
                             <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Key Dates</span>
                             <div className="grid grid-cols-1 gap-2">
                               {rdapData.events.map((event: any, idx: number) => (
                                 <div key={idx} className="flex justify-between text-sm">
                                   <span className="text-gray-600 capitalize">{event.eventAction.replace(/_/g, ' ')}:</span>
                                   <span className="font-mono text-gray-900">{new Date(event.eventDate).toLocaleString()}</span>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}

                         {rdapData.nameservers && (
                            <div className="mb-3 pb-3 border-b border-gray-200">
                              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name Servers</span>
                              <ul className="list-disc list-inside text-sm text-gray-900 font-mono">
                                {rdapData.nameservers.map((ns: any, idx: number) => (
                                  <li key={idx}>{ns.ldhName}</li>
                                ))}
                              </ul>
                            </div>
                         )}

                         {/* Entities (Registrar, etc.) simplified view */}
                         {rdapData.entities && rdapData.entities.map((entity: any, idx: number) => {
                            const role = entity.roles ? entity.roles.join(', ') : 'Entity';
                            // Try to find a name in vcard
                            let name = 'Unknown';
                            if (entity.vcardArray && entity.vcardArray[1]) {
                               const fn = entity.vcardArray[1].find((x: any) => x[0] === 'fn');
                               if (fn) name = fn[3];
                            }
                            return getValue(`${role} (${entity.handle || 'ID'})`, name);
                         })}
                      </div>
                    );
                  } catch (e) {
                    // Not JSON or failed to parse
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <AlertCircle className="w-12 h-12 mb-3 text-gray-300" />
                        <p>无法解析结构化数据。</p>
                        <p className="text-xs mt-2">可能是因为原始数据不是 RDAP JSON 格式，或者查询失败。</p>
                        <p className="text-xs mt-1">请查看“原始 WHOIS 记录”标签。</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {activeTab === 'raw_whois' && (
            <div className="h-full flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2"/> 原始 WHOIS 记录
                 </h3>
                 <span className="text-xs text-gray-400">可编辑</span>
              </div>
              <textarea
                value={formData.rawWhois}
                onChange={(e) => handleChange('rawWhois', e.target.value)}
                className="flex-1 w-full rounded-lg border-gray-300 border p-4 text-xs font-mono bg-slate-900 text-green-400 leading-relaxed resize-none focus:ring-0 focus:border-slate-700 h-full"
                placeholder="暂无 WHOIS 数据。请在此处粘贴信息。"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" /> 保存更改
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainModal;