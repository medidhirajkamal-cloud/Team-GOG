import React from 'react';
import { AppView } from '../types';

interface SupportArchiveViewProps {
  view: 'support' | 'archive';
  onNavigate: (view: AppView) => void;
}

export const SupportArchiveView: React.FC<SupportArchiveViewProps> = ({ view, onNavigate }) => {
  if (view === 'archive') {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-[#f7f9fb]">
        <div className="max-w-[1000px] mx-auto space-y-6">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#000000] tracking-tight">
              Historical Incident Archive
            </h1>
            <p className="text-[15px] text-[#45464d] mt-1">
              Archived and sealed municipal public works cases from previous quarters.
            </p>
          </div>

          <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#e6e8ea] pb-3">
              <span className="font-bold text-[15px] text-[#000000]">Quarterly Archive Batches</span>
              <span className="text-[12px] text-[#76777d]">Retained for 7 years under Municipal Code §14-A</span>
            </div>

            <div className="divide-y divide-[#e6e8ea]">
              {[
                { name: '2023 Q2 Incident Records (1,842 cases)', date: 'Archived Jun 30, 2023', size: '14.2 MB' },
                { name: '2023 Q1 Incident Records (1,490 cases)', date: 'Archived Mar 31, 2023', size: '11.8 MB' },
                { name: '2022 Annual Comprehensive Public Works Log', date: 'Archived Dec 31, 2022', size: '48.6 MB' }
              ].map((batch, i) => (
                <div key={i} className="py-3.5 flex justify-between items-center hover:bg-[#f7f9fb] px-2 rounded">
                  <div>
                    <span className="text-[14px] font-semibold text-[#191c1e] block">{batch.name}</span>
                    <span className="text-[12px] text-[#76777d]">{batch.date} • {batch.size}</span>
                  </div>
                  <button className="text-[13px] text-[#006a61] font-semibold hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">file_download</span>
                    Download ZIP
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-[#f7f9fb]">
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#000000] tracking-tight">
            CityPulse Support &amp; Knowledge Base
          </h1>
          <p className="text-[15px] text-[#45464d] mt-1">
            Documentation, triage manuals, and dispatch escalation hotlines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#86f2e4] text-[#006f66] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">call</span>
            </div>
            <h2 className="text-[18px] font-bold text-[#000000] mb-2">311 Municipal Operations Hotline</h2>
            <p className="text-[13.5px] text-[#45464d] mb-4 leading-relaxed">
              For immediate dispatcher coordination, urgent road closures, or hazardous utility conditions.
            </p>
            <div className="text-[14px] font-semibold text-[#000000] space-y-1">
              <div>Phone: (555) 019-2831</div>
              <div>Internal Radio: Channel 4 (DPW Command)</div>
            </div>
          </div>

          <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#dae2fd] text-[#131b2e] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <h2 className="text-[18px] font-bold text-[#000000] mb-2">AI Triage Model Documentation</h2>
            <p className="text-[13.5px] text-[#45464d] mb-4 leading-relaxed">
              Learn how multimodal computer vision and NLP models classify citizen photos into municipal department work orders.
            </p>
            <button
              onClick={() => onNavigate('triage')}
              className="text-[13.5px] text-[#006a61] font-semibold hover:underline flex items-center gap-1"
            >
              Open Live Triage Queue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
