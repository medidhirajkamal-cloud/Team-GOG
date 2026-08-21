import React, { useState } from 'react';
import { ReportItem, DepartmentType, PriorityLevel } from '../types';

interface TriageDashboardProps {
  reports: ReportItem[];
  onSelectCase: (report: ReportItem) => void;
  onAutoAssignHighConfidence: () => void;
  onMergeReports: (reportId: string, targetCaseId: string) => void;
  onDismissDuplicate: (reportId: string) => void;
}

export const TriageDashboard: React.FC<TriageDashboardProps> = ({
  reports,
  onSelectCase,
  onAutoAssignHighConfidence,
  onMergeReports,
  onDismissDuplicate
}) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>('All Departments');
  const [urgencyFilter, setUrgencyFilter] = useState<PriorityLevel | 'all'>('all');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [showExportToast, setShowExportToast] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [activeDuplicateReport, setActiveDuplicateReport] = useState<ReportItem | null>(
    reports.find(r => r.duplicateOf) || null
  );

  // Filtered reports
  const filteredReports = reports.filter(item => {
    if (departmentFilter !== 'All Departments' && item.suggestedDept !== departmentFilter) return false;
    if (urgencyFilter !== 'all' && item.priority !== urgencyFilter) return false;
    if (item.aiConfidence < minConfidence) return false;
    return true;
  });

  const pendingCount = reports.filter(r => r.status === 'Pending Review' || r.status === 'In Progress').length;

  const handleExportData = () => {
    const csvRows = [
      ['Case ID', 'Tracking #', 'Issue Type', 'AI Confidence', 'Suggested Dept', 'Priority', 'Status', 'Date', 'Address'],
      ...filteredReports.map(r => [
        r.id,
        r.trackingNumber,
        r.issueTypeName,
        `${r.aiConfidence}%`,
        r.suggestedDept,
        r.priority,
        r.status,
        r.createdAt,
        `"${r.location.address}"`
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `civiclink_triage_queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  const handleAutoAssign = () => {
    setIsAutoAssigning(true);
    setTimeout(() => {
      onAutoAssignHighConfidence();
      setIsAutoAssigning(false);
    }, 700);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-[#f7f9fb]">
      <div className="max-w-[1280px] mx-auto h-full flex flex-col gap-6">
        
        {/* Toast */}
        {showExportToast && (
          <div className="fixed top-20 right-8 bg-[#131b2e] text-white px-4 py-2.5 rounded-lg shadow-lg z-50 text-[13px] flex items-center gap-2 border border-[#86f2e4]/30 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined text-[#86f2e4] text-[18px]">download_done</span>
            <span>Triage queue exported to CSV successfully</span>
          </div>
        )}

        {/* Page Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
          <div>
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#000000] tracking-tight">
              AI Triage Overview
            </h2>
            <p className="text-[15px] text-[#45464d] mt-1">
              Review and route incoming citizen reports.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2 border border-[#76777d] text-[#191c1e] rounded-lg text-[14px] font-semibold hover:bg-[#eceef0] transition-colors flex items-center gap-2 bg-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              Export Data
            </button>
            <button
              onClick={handleAutoAssign}
              disabled={isAutoAssigning}
              className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-[14px] font-semibold hover:bg-[#005049] transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isAutoAssigning ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  Auto-Assigning...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">auto_mode</span>
                  Auto-Assign High Confidence
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Work Area: Queue + Side Panels */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          
          {/* Main Queue Table */}
          <div className="flex-1 flex flex-col bg-white border border-[#c6c6cd] rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.08)] overflow-hidden min-h-[420px]">
            <div className="p-4 border-b border-[#c6c6cd] bg-[#f7f9fb] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-[18px] font-bold text-[#000000]">New Reports</h3>
                <span className="text-[12px] text-[#76777d]">({filteredReports.length} shown)</span>
              </div>
              <span className="px-3 py-1 bg-[#ffdad6] text-[#93000a] text-[12px] font-bold rounded-full">
                {pendingCount} Pending Review
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#eceef0] sticky top-0 z-10 text-[13px] font-semibold text-[#45464d] border-b border-[#c6c6cd]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Case ID</th>
                    <th className="px-4 py-3 font-semibold">Issue Type</th>
                    <th className="px-4 py-3 font-semibold">AI Confidence</th>
                    <th className="px-4 py-3 font-semibold">Suggested Dept</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] text-[#191c1e] divide-y divide-[#e6e8ea]">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#76777d]">
                        <span className="material-symbols-outlined text-[36px] block mb-2 text-[#76777d]">inbox</span>
                        No reports matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => {
                      const isHighlighted = report.id === 'RPT-8832';
                      return (
                        <tr
                          key={report.id}
                          onClick={() => onSelectCase(report)}
                          className={`hover:bg-[#f7f9fb] transition-colors group cursor-pointer ${
                            isHighlighted ? 'bg-[#dae2fd]/20 border-l-3 border-[#000000]' : ''
                          }`}
                        >
                          <td className="px-4 py-4 font-semibold text-[#000000]">
                            #{report.id}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#45464d] text-[20px]">
                                {report.iconName || 'warning'}
                              </span>
                              <span className="font-medium text-[#191c1e]">{report.issueTypeName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-16 h-2 bg-[#eceef0] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    report.aiConfidence >= 80
                                      ? 'bg-[#006a61]'
                                      : report.aiConfidence >= 60
                                      ? 'bg-[#45464d]'
                                      : 'bg-[#ba1a1a]'
                                  }`}
                                  style={{ width: `${report.aiConfidence}%` }}
                                />
                              </div>
                              <span className={`text-[13px] font-semibold ${
                                report.aiConfidence >= 80 ? 'text-[#006a61]' : 'text-[#45464d]'
                              }`}>
                                {report.aiConfidence}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 bg-[#e6e8ea] text-[#000000] text-[12px] font-medium rounded border border-[#c6c6cd]">
                              {report.suggestedDept}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {report.priority === 'urgent' && (
                              <span className="px-2.5 py-1 bg-[#ba1a1a]/10 text-[#ba1a1a] rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border border-[#ba1a1a]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" /> Urgent
                              </span>
                            )}
                            {report.priority === 'high' && (
                              <span className="px-2.5 py-1 bg-[#006a61]/10 text-[#006a61] rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border border-[#006a61]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]" /> High
                              </span>
                            )}
                            {report.priority === 'normal' && (
                              <span className="px-2.5 py-1 bg-[#e0e3e5] text-[#45464d] rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border border-[#c6c6cd]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#76777d]" /> Normal
                              </span>
                            )}
                            {report.priority === 'low' && (
                              <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#76777d] rounded-full text-[12px] font-medium inline-flex items-center gap-1.5 border border-[#c6c6cd]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c6c6cd]" /> Low
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-[#45464d] text-[13px] whitespace-nowrap">
                            {report.createdAt}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCase(report);
                              }}
                              className="text-[#45464d] group-hover:text-[#000000] p-1 rounded hover:bg-[#eceef0] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Panels: Duplicate Detection & Quick Filters */}
          <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
            
            {/* Duplicate Detected Alert Card */}
            {activeDuplicateReport && (
              <div className="bg-[#ffdad6]/30 border border-[#ba1a1a]/30 rounded-xl p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[22px] mt-0.5 shrink-0">
                    content_copy
                  </span>
                  <div>
                    <h3 className="text-[14px] text-[#000000] font-bold">Duplicate Detected</h3>
                    <p className="text-[13px] text-[#45464d] mt-1 leading-snug">
                      #{activeDuplicateReport.id} is {activeDuplicateReport.similarityScore || 98}% similar to open case #{activeDuplicateReport.duplicateOf || 'CAS-402'} (Water Main, 5th Ave).
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          onMergeReports(activeDuplicateReport.id, activeDuplicateReport.duplicateOf || 'CAS-402');
                          setActiveDuplicateReport(null);
                        }}
                        className="px-3 py-1.5 bg-[#ba1a1a] text-white rounded text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Merge Reports
                      </button>
                      <button
                        onClick={() => {
                          onDismissDuplicate(activeDuplicateReport.id);
                          setActiveDuplicateReport(null);
                        }}
                        className="px-3 py-1.5 border border-[#c6c6cd] text-[#191c1e] rounded text-[12px] font-medium hover:bg-[#eceef0] transition-colors bg-white cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Filters Card */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-[0px_4px_12px_rgba(15,23,42,0.08)] flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#45464d] text-[18px]">filter_list</span>
                  Quick Filters
                </h3>
                {(departmentFilter !== 'All Departments' || urgencyFilter !== 'all' || minConfidence > 0) && (
                  <button
                    onClick={() => {
                      setDepartmentFilter('All Departments');
                      setUrgencyFilter('all');
                      setMinConfidence(0);
                    }}
                    className="text-[12px] text-[#006a61] hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-[12px] font-medium text-[#45464d] mb-1.5">
                    Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3 py-2 text-[14px] text-[#191c1e] focus:border-[#000000] focus:ring-1 focus:ring-[#000000] outline-none"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Water & Sewer">Water & Sewer</option>
                    <option value="Parks & Rec">Parks & Recreation</option>
                    <option value="Public Works">Public Works</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                  </select>
                </div>

                {/* Urgency Filter Chips */}
                <div>
                  <label className="block text-[12px] font-medium text-[#45464d] mb-1.5">
                    Urgency
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'urgent', 'high', 'normal', 'low'] as const).map((lvl) => {
                      const isActive = urgencyFilter === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setUrgencyFilter(lvl)}
                          className={`px-3 py-1 rounded-full text-[12px] capitalize transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#000000] text-white font-semibold shadow-xs'
                              : 'bg-[#eceef0] border border-[#c6c6cd] text-[#191c1e] hover:bg-[#e6e8ea]'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Confidence Range */}
                <div>
                  <div className="flex justify-between text-[12px] font-medium text-[#45464d] mb-1">
                    <span>AI Confidence</span>
                    <span className="font-bold text-[#000000]">≥ {minConfidence}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    className="w-full accent-[#000000] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#76777d] mt-1">
                    <span>0%</span>
                    <span>&gt; 70%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Summary Info */}
                <div className="pt-3 border-t border-[#e6e8ea] text-[12px] text-[#76777d]">
                  Filtering {filteredReports.length} of {reports.length} total active cases in the city dispatch queue.
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
