import React, { useState } from 'react';
import { Domain, DomainStatus } from '../types';
import { Calendar, Globe, AlertTriangle, CheckCircle, Clock, ArrowUpDown } from 'lucide-react';

interface DomainListProps {
  domains: Domain[];
  onSelect: (domain: Domain) => void;
  onDelete: (id: string) => void;
  onContextMenu: (domain: Domain, event: React.MouseEvent) => void;
}

type SortField = 'name' | 'status' | 'registrar' | 'registrationDate' | 'expirationDate';
type SortDirection = 'asc' | 'desc';

const statusConfig = {
  [DomainStatus.OWNED]: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: '已拥有' },
  [DomainStatus.BACKORDER]: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: '抢注中' },
  [DomainStatus.WATCHLIST]: { color: 'bg-blue-50 text-blue-600', icon: Globe, label: '关注' },
  [DomainStatus.EXPIRED]: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: '已过期' },
};

const DomainList: React.FC<DomainListProps> = ({ domains, onSelect, onDelete, onContextMenu }) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDomains = [...domains].sort((a, b) => {
    if (sortField === 'name') {
       // 1. Length
       const lenDiff = a.name.length - b.name.length;
       if (lenDiff !== 0) {
         return sortDirection === 'asc' ? lenDiff : -lenDiff;
       }

       // 2. First Character
       const charA = a.name.charAt(0).toLowerCase();
       const charB = b.name.charAt(0).toLowerCase();
       if (charA !== charB) {
         return sortDirection === 'asc' 
           ? charA.localeCompare(charB)
           : charB.localeCompare(charA);
       }

       // 3. Update Status (Updated/Success first)
       // Weight: success=0, manual_check=1, others=2
       const getStatusWeight = (s?: string) => {
         if (s === 'success') return 0;
         if (s === 'manual_check') return 1;
         return 2;
       };
       
       const statusA = getStatusWeight(a.updateStatus);
       const statusB = getStatusWeight(b.updateStatus);
       
       if (statusA !== statusB) {
         return sortDirection === 'asc' ? statusA - statusB : statusB - statusA;
       }

       // 4. Full Name (Tie-breaker)
       return sortDirection === 'asc' 
         ? a.name.localeCompare(b.name)
         : b.name.localeCompare(a.name);
     }

    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field: SortField) => {
    return <ArrowUpDown className={`w-4 h-4 ml-1 inline-block ${sortField === field ? 'text-blue-600' : 'text-gray-300'}`} />;
  };

  if (domains.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">暂无管理的域名</h3>
        <p className="text-gray-500 mt-1">导入列表或添加您的第一个域名以开始使用。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                域名 {renderSortIcon('name')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                状态 {renderSortIcon('status')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('registrar')}
              >
                注册商 {renderSortIcon('registrar')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('registrationDate')}
              >
                注册时间 {renderSortIcon('registrationDate')}
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('expirationDate')}
              >
                过期时间 {renderSortIcon('expirationDate')}
              </th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedDomains.map((domain) => {
              const StatusIcon = statusConfig[domain.status].icon;
              
              // Calculate status badge
              let statusBadge = null;
              if (domain.expirationDate) {
                const diff = new Date(domain.expirationDate).getTime() - Date.now();
                const days = diff / (1000 * 3600 * 24);
                
                if (days < 0) {
                   statusBadge = (
                     <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-900">
                       已过期
                     </span>
                   );
                } else if (days < 30) {
                   statusBadge = (
                     <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                       快过期
                     </span>
                   );
                }
              } else if (!domain.registrationDate && domain.status === DomainStatus.WATCHLIST && domain.updateStatus === 'success') {
                 // Only show "Available" if we successfully updated and found no registration date
                 statusBadge = (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      可注册
                    </span>
                 );
              }

              return (
                <tr 
                  key={domain.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => onSelect(domain)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onContextMenu(domain, e);
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 block group-hover:text-blue-600 transition-colors">{domain.name}</span>
                        {statusBadge}
                      </div>
                      
                      <div className="flex items-center mt-1 gap-1">
                        {domain.lastUpdated && (
                          domain.updateStatus === 'success' ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                              已更新
                            </span>
                          ) : domain.updateStatus === 'manual_check' ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                              需自填
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[domain.status].color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[domain.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {domain.registrar || <span className="text-gray-400 italic">未知</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                     {domain.registrationDate ? (
                        <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1.5 text-gray-400"/>
                            {new Date(domain.registrationDate).toLocaleDateString()}
                        </div>
                     ) : (
                         <span className="text-gray-400">-</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {domain.expirationDate ? (
                         <div className={`flex items-center ${new Date(domain.expirationDate) < new Date() ? 'text-red-600 font-medium' : ''}`}>
                            <Calendar className="w-3 h-3 mr-1.5 text-gray-400"/>
                            {new Date(domain.expirationDate).toLocaleDateString()}
                        </div>
                     ) : (
                         <span className="text-gray-400">-</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="text-gray-400 hover:text-red-600 transition-colors text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(domain.id);
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DomainList;