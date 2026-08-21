import React from 'react';
import { ReportItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectReport
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      reportId: 'RPT-8832',
      title: '🚨 High-Priority Water Main Leak Reported',
      desc: 'AI Triage assigned Case #RPT-8832 to Water & Sewer (95% confidence).',
      time: '10 min ago',
      unread: true
    },
    {
      id: 'notif-2',
      reportId: 'RPT-8831',
      title: '⚠️ Potential Duplicate Detected',
      desc: 'Report #RPT-8832 matched #CAS-402 with 98% geographic similarity.',
      time: '12 min ago',
      unread: true
    },
    {
      id: 'notif-3',
      reportId: 'RPT-8829',
      title: '✅ Field Crew Dispatched',
      desc: 'Electrical crew en route to Streetlight #LP-4091 on Main St.',
      time: '1 hr ago',
      unread: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-start justify-end p-4 md:p-6 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#c6c6cd] overflow-hidden mt-12">
        <div className="p-4 bg-[#f7f9fb] border-b border-[#c6c6cd] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006a61] text-[20px]">notifications</span>
            <span className="font-bold text-[16px] text-[#000000]">Municipal Alerts &amp; Logs</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#eceef0] text-[#76777d] hover:text-[#000000]"
          >
            ✕
          </button>
        </div>

        <div className="divide-y divide-[#e6e8ea] max-h-[400px] overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onSelectReport(n.reportId);
                onClose();
              }}
              className={`p-4 hover:bg-[#f7f9fb] cursor-pointer transition-colors ${
                n.unread ? 'bg-[#dae2fd]/15' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-[13.5px] text-[#000000]">{n.title}</span>
                <span className="text-[11px] text-[#76777d]">{n.time}</span>
              </div>
              <p className="text-[12.5px] text-[#45464d] leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#f2f4f6] text-center border-t border-[#c6c6cd]">
          <span className="text-[12px] text-[#76777d]">All dispatch notifications synced in real-time</span>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#c6c6cd]">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#e6e8ea]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006a61] text-[22px]">tune</span>
            <h3 className="text-[18px] font-bold text-[#000000]">CivicLink System Settings</h3>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#000000] text-[18px]">
            ✕
          </button>
        </div>

        <div className="space-y-4 text-[14px]">
          <div>
            <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
              Active Municipal Station
            </label>
            <input
              type="text"
              readOnly
              value="Metropolis Department of Public Works - District 4 Station"
              className="w-full bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg px-3 py-2 text-[#45464d] text-[13.5px]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
              AI Triage Auto-Routing Threshold
            </label>
            <div className="flex items-center justify-between bg-[#f7f9fb] p-3 rounded-lg border border-[#c6c6cd]">
              <span className="text-[#45464d]">Minimum Confidence for Auto-Dispatch</span>
              <span className="font-bold text-[#006a61]">80%</span>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
              Active User Account
            </label>
            <div className="flex items-center gap-3 p-3 bg-[#f7f9fb] rounded-lg border border-[#c6c6cd]">
              <div className="w-10 h-10 rounded-full bg-[#131b2e] text-white flex items-center justify-center font-bold">
                CL
              </div>
              <div>
                <div className="font-bold text-[#000000]">Officer K. Lin (Dispatcher #402)</div>
                <div className="text-[12px] text-[#76777d]">Department of Public Works • Metropolis HQ</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#000000] text-white rounded-lg text-[13px] font-semibold hover:bg-black/85"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
