import React, { useState } from 'react';
import { ANALYTICS_STATS, RECURRING_ISSUES } from '../data/mockData';
import { RecurringIssue } from '../types';

interface AnalyticsDashboardProps {
  onSelectHotspot: (issue: RecurringIssue) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onSelectHotspot
}) => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<RecurringIssue | null>(RECURRING_ISSUES[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [exportToast, setExportToast] = useState(false);

  const handleExport = () => {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  const displayedHotspots = showCriticalOnly
    ? RECURRING_ISSUES.filter(i => i.urgency === 'urgent' || i.urgency === 'high')
    : RECURRING_ISSUES;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-[#f7f9fb]">
      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* Export Toast */}
        {exportToast && (
          <div className="fixed top-20 right-8 bg-[#131b2e] text-white px-4 py-2.5 rounded-lg shadow-lg z-50 text-[13px] flex items-center gap-2 border border-[#86f2e4]/30 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined text-[#86f2e4] text-[18px]">summarize</span>
            <span>Civic Performance Report (Q3 {timeRange}) exported as PDF</span>
          </div>
        )}

        {/* Page Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#000000] tracking-tight">
              Civic Analytics
            </h1>
            <p className="text-[15px] text-[#45464d] mt-1">
              Municipal triage performance and infrastructure trends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-[#c6c6cd] text-[#191c1e] text-[13.5px] font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer hover:bg-[#eceef0]"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Quarter (Q3)">This Quarter (Q3)</option>
              <option value="Year to Date">Year to Date</option>
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2 bg-[#000000] text-white rounded-lg text-[13.5px] font-semibold hover:bg-black/85 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Report
            </button>
          </div>
        </header>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Auto-Route Accuracy */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-sm">
            <div className="text-[13px] text-[#45464d] font-semibold mb-1">
              Auto-Route Accuracy
            </div>
            <div className="text-[32px] font-bold text-[#000000] tracking-tight leading-tight">
              {ANALYTICS_STATS.autoRouteAccuracy}%
            </div>
            <div className="mt-2 text-[12px] font-bold text-[#006a61] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              {ANALYTICS_STATS.autoRouteDiff}
            </div>
          </div>

          {/* Card 2: Avg Triage Time */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-sm">
            <div className="text-[13px] text-[#45464d] font-semibold mb-1">
              Avg. Triage Time
            </div>
            <div className="text-[32px] font-bold text-[#000000] tracking-tight leading-tight">
              {ANALYTICS_STATS.avgTriageTime}
            </div>
            <div className="mt-2 text-[12px] font-bold text-[#006a61] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              {ANALYTICS_STATS.avgTriageDiff}
            </div>
          </div>

          {/* Card 3: Avg Resolution Time */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-sm">
            <div className="text-[13px] text-[#45464d] font-semibold mb-1">
              Avg. Resolution Time
            </div>
            <div className="text-[32px] font-bold text-[#000000] tracking-tight leading-tight">
              {ANALYTICS_STATS.avgResolutionTime}
            </div>
            <div className="mt-2 text-[12px] font-bold text-[#ba1a1a] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              {ANALYTICS_STATS.avgResolutionDiff}
            </div>
          </div>

          {/* Card 4: Escalation Rate */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-sm">
            <div className="text-[13px] text-[#45464d] font-semibold mb-1">
              Escalation Rate
            </div>
            <div className="text-[32px] font-bold text-[#000000] tracking-tight leading-tight">
              {ANALYTICS_STATS.escalationRate}
            </div>
            <div className="mt-2 text-[12px] font-bold text-[#76777d] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
              {ANALYTICS_STATS.escalationStatus}
            </div>
          </div>

        </div>

        {/* Two-Column Grid: Map & Recurring Problems */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: High-Density Map (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h2 className="text-[20px] font-bold text-[#000000]">High-Density Report Areas</h2>
                <p className="text-[13px] text-[#45464d]">
                  Geographic concentration of incoming public works reports across sectors.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2.5 py-1 rounded text-[12px] font-semibold border transition-colors cursor-pointer ${
                    showHeatmap ? 'bg-[#dae2fd] text-[#131b2e] border-[#c6c6cd]' : 'bg-[#eceef0] text-[#76777d]'
                  }`}
                >
                  Heatmap {showHeatmap ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                  className={`px-2.5 py-1 rounded text-[12px] font-semibold border transition-colors cursor-pointer ${
                    showCriticalOnly ? 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]/30' : 'bg-[#eceef0] text-[#76777d]'
                  }`}
                >
                  Critical Only
                </button>
              </div>
            </div>

            {/* Interactive Vector Map Canvas Area */}
            <div className="relative rounded-xl overflow-hidden border border-[#c6c6cd] bg-[#131b2e] h-[400px] flex items-center justify-center">
              {/* Map base satellite / street vector imagery */}
              <div 
                className="absolute inset-0 bg-[#0f172a] transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaR83r09P55FKXJnZR8uhEzJ8Sz3fgbfPvjfKET-PIfI6ob1DYy7YXCieIS33Z5ypT_WhKdwq7jW_ftT1TkZ31_5yR9Rmpd_zt_aGmq6_hp-GjF5EUgTpAESxKcQZ21jZv27qD3YAOZzolc7G9M_b1-ZoybtUb6UzzBZem5XqQjEMwS6ZcHtik96S75YlTyus-hixyzJd6RZW7FJgK073vw6o6Ir8n6xxNWXqy-A8Vw653AhAIn9D6rw"
                  alt="City GIS sector map"
                  className="w-full h-full object-cover opacity-75 contrast-125"
                />

                {/* Heatmap overlay glows if enabled */}
                {showHeatmap && (
                  <>
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/25 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
                  </>
                )}

                {/* Interactive Hotspot Pins */}
                {displayedHotspots.map((item, idx) => {
                  const isSelected = selectedHotspot?.id === item.id;
                  // Map coordinates to approximate layout positions
                  const positions = [
                    { top: '38%', left: '46%' },
                    { top: '24%', left: '32%' },
                    { top: '52%', left: '58%' },
                    { top: '70%', left: '36%' },
                    { top: '60%', left: '72%' }
                  ];
                  const pos = positions[idx % positions.length];

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedHotspot(item);
                        onSelectHotspot(item);
                      }}
                      style={{ top: pos.top, left: pos.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                    >
                      <div className="relative flex items-center justify-center">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] shadow-lg transition-transform group-hover:scale-125 border-2 border-white"
                          style={{ backgroundColor: item.dotColor }}
                        >
                          {item.reportCount}
                        </span>
                        {item.urgency === 'urgent' && (
                          <span
                            className="absolute -inset-1 rounded-full animate-ping opacity-60 pointer-events-none"
                            style={{ backgroundColor: item.dotColor }}
                          />
                        )}
                      </div>

                      {/* Tooltip on hover or when selected */}
                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#131b2e] text-white p-2 rounded-lg text-center shadow-xl border border-white/20 transition-all pointer-events-none ${
                        isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                      }`}>
                        <div className="text-[12px] font-bold truncate">{item.location}</div>
                        <div className="text-[11px] text-[#7c839b]">{item.issueType}</div>
                        <div className="text-[11px] font-semibold text-[#86f2e4] mt-0.5">{item.reportCount} incidents logged</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-30">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
                  className="w-8 h-8 bg-white/90 backdrop-blur-xs text-[#000000] font-bold rounded flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.9))}
                  className="w-8 h-8 bg-white/90 backdrop-blur-xs text-[#000000] font-bold rounded flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  aria-label="Zoom out"
                >
                  -
                </button>
              </div>

              {/* Active Hotspot Footer Bar */}
              {selectedHotspot && (
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-[#c6c6cd] shadow-md z-30 flex items-center gap-3 text-[13px]">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedHotspot.dotColor }} />
                  <div>
                    <span className="font-bold text-[#000000]">{selectedHotspot.location}</span>
                    <span className="text-[#45464d] ml-2 text-[12px]">({selectedHotspot.reportCount} reports)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Recurring Problems Table (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm flex flex-col">
            <h2 className="text-[20px] font-bold text-[#000000] mb-4">Recurring Problems</h2>
            <p className="text-[13px] text-[#45464d] mb-4">
              Ranked municipal clusters triggering multi-report threshold alerts:
            </p>

            <div className="divide-y divide-[#e6e8ea] flex-1">
              {RECURRING_ISSUES.map((issue) => {
                const isSelected = selectedHotspot?.id === issue.id;
                return (
                  <div
                    key={issue.id}
                    onClick={() => {
                      setSelectedHotspot(issue);
                      onSelectHotspot(issue);
                    }}
                    className={`py-3.5 px-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#f2f4f6]' : 'hover:bg-[#f7f9fb]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: issue.dotColor }}
                      />
                      <div>
                        <h3 className="text-[14px] font-bold text-[#000000] leading-tight">
                          {issue.location}
                        </h3>
                        <p className="text-[12px] text-[#76777d] mt-0.5">
                          {issue.issueType}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[15px] font-bold text-[#000000] block">
                        {issue.reportCount}
                      </span>
                      <span className="text-[11px] text-[#76777d]">reports</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#e6e8ea] mt-4 text-[12px] text-[#76777d] flex items-center justify-between">
              <span>Automatic cluster threshold: 10+</span>
              <button 
                onClick={() => handleExport()}
                className="text-[#006a61] font-semibold hover:underline"
              >
                View Full Audit
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
