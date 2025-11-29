import React, { useState, useEffect, useMemo } from 'react';
import { Domain, DomainStatus, DomainStats } from './types';
import { getDomains, saveDomains } from './services/storageService';
import DomainList from './components/DomainList';
import DomainModal from './components/DomainModal';
import ImportModal from './components/ImportModal';
import ConfirmModal from './components/ConfirmModal';
import { updateAllDomains } from './services/whoisService';
import { Plus, Search, LayoutGrid, BarChart2, CheckCircle, Clock, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<DomainStatus | 'ALL'>('ALL');
  
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [initialTab, setInitialTab] = useState<'details' | 'formatted_whois' | 'raw_whois' | undefined>(undefined);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<{current: number, total: number, currentDomain: string} | null>(null);

  // Load initial data
  useEffect(() => {
    const loaded = getDomains();
    setDomains(loaded);
    setIsLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (isLoaded) {
      saveDomains(domains);
    }
  }, [domains, isLoaded]);

  const handleImport = (newDomains: Domain[]) => {
    // Filter duplicates by name
    const existingNames = new Set(domains.map(d => d.name));
    const uniqueNew = newDomains.filter(d => !existingNames.has(d.name));
    
    if (uniqueNew.length < newDomains.length) {
      alert(`已跳过 ${newDomains.length - uniqueNew.length} 个重复域名。`);
    }
    
    setDomains(prev => [...prev, ...uniqueNew]);
  };

  const handleUpdate = (updated: Domain) => {
    setDomains(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const executeDelete = () => {
    if (deleteId) {
      setDomains(prev => prev.filter(d => d.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleUpdateAll = async () => {
    if (domains.length === 0) return;
    
    setIsUpdating(true);
    try {
      await updateAllDomains(
        domains, 
        (current, total, currentDomain) => {
          setUpdateProgress({ current, total, currentDomain });
        },
        (updatedDomain) => {
          setDomains(prev => prev.map(d => d.id === updatedDomain.id ? updatedDomain : d));
        }
      );
    } catch (error) {
      console.error('Update failed', error);
      alert('更新过程中发生错误');
    } finally {
      setIsUpdating(false);
      setUpdateProgress(null);
    }
  };

  const handleContextMenu = (domain: Domain, event: React.MouseEvent) => {
    setSelectedDomain(domain);
    setInitialTab('formatted_whois');
  };

  const filteredDomains = useMemo(() => {
    return domains.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [domains, searchQuery, filterStatus]);

  const stats: DomainStats = useMemo(() => {
    return {
      total: domains.length,
      owned: domains.filter(d => d.status === DomainStatus.OWNED).length,
      backorder: domains.filter(d => d.status === DomainStatus.BACKORDER).length,
      expiringSoon: domains.filter(d => {
        if (!d.expirationDate) return false;
        const diff = new Date(d.expirationDate).getTime() - Date.now();
        const days = diff / (1000 * 3600 * 24);
        return days > 0 && days < 30;
      }).length,
    };
  }, [domains]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LayoutGrid className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                DomainMaster 域名管家
              </h1>
            </div>
            <div className="flex items-center space-x-4">
               <span className="text-xs text-gray-400 hidden sm:block">本地存储已启用</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">域名总数</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
              <BarChart2 className="w-5 h-5 text-gray-300" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">已拥有</span>
             <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-green-600">{stats.owned}</span>
              <CheckCircle className="w-5 h-5 text-green-200" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">抢注中</span>
             <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-amber-600">{stats.backorder}</span>
              <Clock className="w-5 h-5 text-amber-200" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">即将过期 (30天)</span>
             <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-red-600">{stats.expiringSoon}</span>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索域名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as DomainStatus | 'ALL')}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">所有状态</option>
              <option value={DomainStatus.OWNED}>已拥有</option>
              <option value={DomainStatus.BACKORDER}>抢注中</option>
              <option value={DomainStatus.WATCHLIST}>关注列表</option>
              <option value={DomainStatus.EXPIRED}>已过期</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleUpdateAll}
              disabled={isUpdating || domains.length === 0}
              className={`w-full sm:w-auto px-5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center font-medium shadow-sm ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} /> 
              {isUpdating && updateProgress 
                ? `更新中 (${updateProgress.current}/${updateProgress.total})` 
                : '拉取域名信息'}
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              disabled={isUpdating}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" /> 添加域名
            </button>
          </div>
        </div>

        {/* List */}
        <DomainList 
          domains={filteredDomains} 
          onSelect={(domain) => {
            setSelectedDomain(domain);
            setInitialTab('details'); // Default to details on click
          }} 
          onDelete={handleDelete}
          onContextMenu={handleContextMenu}
        />

        {/* Modals */}
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImport}
        />

        {selectedDomain && (
          <DomainModal
            isOpen={!!selectedDomain}
            domain={selectedDomain}
            onClose={() => {
              setSelectedDomain(null);
              setInitialTab(undefined);
            }}
            onUpdate={handleUpdate}
            initialTab={initialTab}
          />
        )}

        <ConfirmModal
          isOpen={!!deleteId}
          title="删除域名"
          message="您确定要删除此域名吗？此操作无法撤销。"
          onConfirm={executeDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </div>
  );
};

export default App;