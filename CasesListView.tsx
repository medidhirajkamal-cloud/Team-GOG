import React, { useState } from 'react';
import { ReportItem } from '../types';

interface CasesListViewProps {
  reports: ReportItem[];
  onSelectCase: (report: ReportItem) => void;
  onNewReport: () => void;
}

export const CasesListView: React.FC<CasesListViewProps> = ({
  reports,
  onSelectCase,
  onNewReport
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending Review' | 'In Progress' | 'Dispatched' | 'Resolved'>('All');
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = reports.filter(r => {
    if (activeTab !== 'All' && r.status !== activeTab) return false;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.trackingNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.location.address.toLowerCase().includes(q) ||
        r.suggestedDept.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-[#f7f9fb]">
      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#000000] tracking-tight">
              Municipal Case Management
            </h1>
            <p className="text-[15px] text-[#45464d] mt-1">
              Active incident repository across all Metropolis departments and field squads.
            </p>
          </div>
          <button
            onClick={onNewReport}
            className="px-4 py-2.5 bg-[#000000] text-white rounded-lg text-[14px] font-semibold hover:bg-black/85 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Incident Case
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(['All', 'Pending Review', 'In Progress', 'Dispatched', 'Resolved'] as const).map((tab) => {
              const count = tab === 'All' ? reports.length : reports.filter(r => r.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#000000] text-white'
                      : 'text-[#45464d] hover:bg-[#f2f4f6]'
                  }`}
                >
                  {tab} <span className="opacity-70 text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by title, address, ID..."
              className="w-full bg-[#f2f4f6] pl-9 pr-3 py-1.5 border border-[#c6c6cd] rounded-lg text-[13.5px] text-[#191c1e] outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectCase(report)}
              className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[#000000] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-2.5">
                  <span className="text-[12px] font-bold text-[#006a61] bg-[#86f2e4]/30 px-2 py-0.5 rounded">
                    #{report.id}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    report.priority === 'urgent'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : report.priority === 'high'
                      ? 'bg-[#006a61]/10 text-[#006a61]'
                      : 'bg-[#eceef0] text-[#45464d]'
                  }`}>
                    {report.priority.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-[16px] font-bold text-[#000000] group-hover:text-[#006a61] transition-colors leading-snug mb-1.5">
                  {report.title}
                </h3>
                <p className="text-[13px] text-[#45464d] line-clamp-2 mb-3">
                  {report.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#e6e8ea] text-[12px] text-[#76777d] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">location_on</span>
                  <span className="truncate max-w-[140px]">{report.location.address}</span>
                </div>
                <span className="font-semibold text-[#191c1e]">{report.status}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-12 text-center text-[#76777d]">
            <span className="material-symbols-outlined text-[40px] block mb-2">folder_open</span>
            No cases found matching the selected filter.
          </div>
        )}

      </div>
    </div>
  );
};
