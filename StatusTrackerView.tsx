import React, { useState } from 'react';
import { ReportItem } from '../types';
import { MapsGroundingCard } from './MapsGroundingCard';

interface StatusTrackerViewProps {
  report: ReportItem;
  onBack: () => void;
  onSearchOther: (trackingCode: string) => void;
}

export const StatusTrackerView: React.FC<StatusTrackerViewProps> = ({
  report,
  onBack,
  onSearchOther
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('citizen.resident@citypulse.gov');

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-[#f7f9fb]">
      <div className="max-w-[1100px] mx-auto space-y-6">
        
        {/* Top bar with back button & quick tracking lookup */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center text-[#45464d] hover:text-[#000000] text-[13.5px] font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] mr-1.5">arrow_back</span>
            Back to My Reports
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchCode.trim()) onSearchOther(searchCode.trim());
            }}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Track another (e.g. CW-2023-894)"
                className="w-full bg-white border border-[#c6c6cd] rounded-lg px-3 py-1.5 text-[13px] text-[#191c1e] focus:outline-none focus:border-black"
              />
            </div>
            <button
              type="submit"
              className="bg-[#000000] text-white px-3 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-black/85 cursor-pointer shrink-0"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Case Header Card */}
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e6e8ea] pb-5">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <h1 className="text-[26px] md:text-[30px] font-bold text-[#000000] tracking-tight">
                  {report.title}
                </h1>
                <span className="bg-[#86f2e4] text-[#00201d] px-3 py-1 rounded-full text-[12px] font-bold tracking-wide">
                  {report.status}
                </span>
              </div>
              <p className="text-[14px] text-[#45464d]">
                Reference: <span className="font-semibold text-[#000000]">#{report.trackingNumber}</span> • Submitted on {report.timestamp}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSubscribed
                    ? 'bg-[#86f2e4] border-[#006f66] text-[#006f66]'
                    : 'bg-[#f2f4f6] border-[#c6c6cd] text-[#191c1e] hover:bg-[#e6e8ea]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSubscribed ? 'notifications_active' : 'notifications'}
                </span>
                {isSubscribed ? 'Alerts Subscribed' : 'Get SMS/Email Alerts'}
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-[13.5px] text-[#45464d]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#006a61]">location_on</span>
              <span>{report.location.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#006a61]">business</span>
              <span>Assigned to: <strong>{report.actualDept || report.suggestedDept}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#006a61]">timer</span>
              <span>Estimated Resolution: <strong>Today, 4:00 PM</strong></span>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Timeline vs Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Interactive Progress Timeline (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm">
            <h2 className="text-[20px] font-bold text-[#000000] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61]">timeline</span>
              Status History &amp; Progress
            </h2>

            <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-3 before:w-[2px] before:bg-[#c6c6cd]">
              
              {/* Step 1: Report Submitted */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center ring-4 ring-white">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <div className="text-[12px] text-[#76777d]">Oct 24, 09:42 AM</div>
                <h3 className="text-[15px] font-bold text-[#000000] mt-0.5">Report Submitted</h3>
                <p className="text-[13.5px] text-[#45464d] mt-1">
                  Intake verified via Citizen Web Portal. Geolocation stamped at {report.location.address}.
                </p>
              </div>

              {/* Step 2: AI Triage & Verification */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center ring-4 ring-white">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <div className="text-[12px] text-[#76777d]">Oct 24, 09:45 AM</div>
                <h3 className="text-[15px] font-bold text-[#000000] mt-0.5">AI Triage &amp; Verification</h3>
                <p className="text-[13.5px] text-[#45464d] mt-1">
                  Categorized as <strong>{report.actualDept || report.suggestedDept}</strong> • Urgency: <strong>{report.priority.toUpperCase()}</strong> • Confidence: <strong>{report.aiConfidence}%</strong>.
                </p>

                {/* AI Routing Explanation Box */}
                <div className="mt-3 bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg p-3.5 text-[13px] text-[#191c1e]">
                  <div className="flex items-center gap-1.5 text-[#006a61] font-bold mb-1">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>AI Routing Explanation</span>
                  </div>
                  <p className="text-[#45464d] leading-relaxed">
                    {report.aiGist?.explanation ||
                      'Assigned to Water & Sewer due to detected keywords ("pavement bubbling", "continuous flow") and image analysis indicating a pressurized subsurface leak rather than surface runoff.'}
                  </p>
                </div>
              </div>

              {/* Step 3: Department Acknowledged */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-[#000000] text-white flex items-center justify-center ring-4 ring-white">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <div className="text-[12px] text-[#76777d]">Oct 24, 10:15 AM</div>
                <h3 className="text-[15px] font-bold text-[#000000] mt-0.5">Department Acknowledged</h3>
                <p className="text-[13.5px] text-[#45464d] mt-1">
                  Public Works Dispatcher confirmed ticket and placed into emergency field crew queue.
                </p>
              </div>

              {/* Step 4: Crew Dispatched */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-[#86f2e4] text-[#00201d] flex items-center justify-center ring-4 ring-white animate-pulse">
                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                </div>
                <div className="text-[12px] text-[#006a61] font-semibold">Oct 24, 10:45 AM • Current Step</div>
                <h3 className="text-[15px] font-bold text-[#000000] mt-0.5">Crew Dispatched</h3>
                <p className="text-[13.5px] text-[#45464d] mt-1">
                  Utility Field Crew #4 (Lead: S. Connor) dispatched to location. Estimated on-site arrival: <strong>11:30 AM</strong>.
                </p>
              </div>

              {/* Step 5: Resolution */}
              <div className="relative opacity-60">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-[#e6e8ea] border-2 border-[#c6c6cd] flex items-center justify-center ring-4 ring-white">
                  <span className="w-2 h-2 rounded-full bg-[#c6c6cd]" />
                </div>
                <div className="text-[12px] text-[#76777d]">Estimated ~4:00 PM</div>
                <h3 className="text-[15px] font-bold text-[#45464d] mt-0.5">Resolution</h3>
                <p className="text-[13.5px] text-[#76777d] mt-1">
                  Pending on-site excavation, replacement valve coupling, and final roadway safety clearance.
                </p>
              </div>

            </div>
          </div>

          {/* Right: Location & Evidence Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Google Maps Grounding Card */}
            <MapsGroundingCard
              address={report.location.address}
              report={report}
            />

            {/* Submitted Evidence Card */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#000000] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61]">photo_library</span>
                Submitted Evidence
              </h3>

              {report.evidenceImages.length > 0 ? (
                <div>
                  <div className="h-44 rounded-lg overflow-hidden border border-[#c6c6cd] bg-[#eceef0] mb-2">
                    <img
                      src={report.evidenceImages[0]}
                      alt="Submitted evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[12px] text-[#76777d]">
                    <span>{report.evidenceImages.length} photo attached</span>
                    <span className="text-[#006a61] font-medium">Analyzed by City AI</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-[#76777d] text-[13px]">
                  No photos attached to this report.
                </div>
              )}
            </div>

            {/* Notification Subscription Card */}
            {isSubscribed && (
              <div className="bg-[#dae2fd]/30 border border-[#86f2e4] rounded-xl p-4 text-[13px] animate-in fade-in">
                <span className="font-bold text-[#131b2e] block mb-1">Live Notifications Active</span>
                <span className="text-[#45464d]">
                  Updates are being dispatched to <strong>{notificationEmail}</strong>. You will receive an alert as soon as Field Crew #4 completes inspection.
                </span>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
