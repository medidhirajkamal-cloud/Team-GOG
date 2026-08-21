import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onNewReport: () => void;
  pendingTriageCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  onNewReport,
  pendingTriageCount
}) => {
  return (
    <nav className="hidden lg:flex flex-col w-64 h-[calc(100vh-64px)] sticky top-16 p-4 bg-[#f2f4f6] border-r border-[#c6c6cd] shrink-0">
      {/* Header Info */}
      <div className="mb-6 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#131b2e] flex items-center justify-center shrink-0 border border-[#c6c6cd]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4yuYD9l0rH65cHgXCiM42P0ZpekgrICG4mG9Q-PmW3Bv-q7kczxN8wBu9pdjZSDGdBstrjXsrxWe7z7P1t1m2Y-yLGxTpEleUUInGw-Ykl-3gX-8vxcWl3oDtpFbsylgzR38oVMLqv9DbNLhwFZn4j8KGvxIXoupWBtZMyGiYgfeVm-sQd_WJNDHSV3nfYdRhpgOy_gcQxp1wMtTB3kQR9TBvCcIAGPch_-mG65Fcs_WRKVgetWYHQg"
            alt="City official logo"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-[17px] font-bold text-[#000000] truncate leading-tight">
            City of Metropolis
          </h1>
          <p className="text-[12px] text-[#45464d] truncate">
            Department of Public Works
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onNewReport}
        className="mb-6 w-full py-2.5 bg-[#000000] text-white rounded-lg text-[14px] font-semibold hover:bg-black/85 transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        New Report
      </button>

      {/* Main Navigation Items */}
      <ul className="flex-1 space-y-1.5 overflow-y-auto">
        <li>
          <button
            onClick={() => setCurrentView('intake')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] transition-all duration-200 cursor-pointer ${
              currentView === 'intake'
                ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-xs'
                : 'text-[#45464d] hover:bg-[#e0e3e5] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            <span>Intake</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => setCurrentView('triage')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[14px] transition-all duration-200 cursor-pointer ${
              currentView === 'triage'
                ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-xs'
                : 'text-[#45464d] hover:bg-[#e0e3e5] hover:text-[#191c1e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === 'triage' ? "'FILL' 1" : "'FILL' 0" }}>
                rule
              </span>
              <span>Triage</span>
            </div>
            {pendingTriageCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#ffdad6] text-[#93000a]">
                {pendingTriageCount}
              </span>
            )}
          </button>
        </li>
        <li>
          <button
            onClick={() => setCurrentView('cases')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] transition-all duration-200 cursor-pointer ${
              currentView === 'cases' || currentView === 'case-detail'
                ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-xs'
                : 'text-[#45464d] hover:bg-[#e0e3e5] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: (currentView === 'cases' || currentView === 'case-detail') ? "'FILL' 1" : "'FILL' 0" }}>
              assignment
            </span>
            <span>Cases</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => setCurrentView('tracking')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] transition-all duration-200 cursor-pointer ${
              currentView === 'tracking'
                ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-xs'
                : 'text-[#45464d] hover:bg-[#e0e3e5] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">timeline</span>
            <span>Tracking</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => setCurrentView('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] transition-all duration-200 cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-xs'
                : 'text-[#45464d] hover:bg-[#e0e3e5] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === 'analytics' ? "'FILL' 1" : "'FILL' 0" }}>
              analytics
            </span>
            <span>Analytics</span>
          </button>
        </li>
      </ul>

      {/* Bottom secondary items */}
      <div className="mt-auto pt-4 border-t border-[#c6c6cd] space-y-1">
        <button
          onClick={() => setCurrentView('support')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] transition-colors ${
            currentView === 'support'
              ? 'bg-[#e0e3e5] text-[#000000] font-semibold'
              : 'text-[#45464d] hover:bg-[#e0e3e5] hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span>Support</span>
        </button>
        <button
          onClick={() => setCurrentView('archive')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] transition-colors ${
            currentView === 'archive'
              ? 'bg-[#e0e3e5] text-[#000000] font-semibold'
              : 'text-[#45464d] hover:bg-[#e0e3e5] hover:text-[#191c1e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>Archive</span>
        </button>
      </div>
    </nav>
  );
};
