import React, { useState } from 'react';
import { ReportItem, DepartmentType } from '../types';
import { MapsGroundingCard } from './MapsGroundingCard';

interface CaseDetailViewProps {
  report: ReportItem;
  onBack: () => void;
  onUpdateReport: (updated: ReportItem) => void;
  onTrackView: (report: ReportItem) => void;
  onOpenImageStudio?: () => void;
  onOpenGeminiChat?: () => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  report,
  onBack,
  onUpdateReport,
  onTrackView,
  onOpenImageStudio,
  onOpenGeminiChat
}) => {
  const [showRerouteModal, setShowRerouteModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentType>(report.suggestedDept);
  const [resolveNotes, setResolveNotes] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Safety Inspector');
  const [messageToast, setMessageToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setMessageToast(msg);
    setTimeout(() => setMessageToast(null), 3000);
  };

  const handleEscalate = () => {
    const updated: ReportItem = {
      ...report,
      priority: 'urgent',
      routingLog: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Today',
          title: 'Emergency Escalation',
          detail: 'Priority elevated to Critical/Urgent by Public Works Command.',
          type: 'dispatch'
        },
        ...(report.routingLog || [])
      ]
    };
    onUpdateReport(updated);
    triggerToast(`Case #${report.id} escalated to Critical Priority`);
  };

  const handleReroute = () => {
    const updated: ReportItem = {
      ...report,
      suggestedDept: selectedDept,
      actualDept: selectedDept,
      routingLog: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Today',
          title: `Re-routed to ${selectedDept}`,
          detail: `Department re-assignment executed from dispatch dashboard.`,
          type: 'handoff',
          badge: selectedDept
        },
        ...(report.routingLog || [])
      ]
    };
    onUpdateReport(updated);
    setShowRerouteModal(false);
    triggerToast(`Case #${report.id} re-routed to ${selectedDept}`);
  };

  const handleResolve = () => {
    const updated: ReportItem = {
      ...report,
      status: 'Resolved',
      routingLog: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Today',
          title: 'Case Marked Resolved',
          detail: resolveNotes || 'Field repairs verified and closed out by dispatch unit.',
          type: 'resolution'
        },
        ...(report.routingLog || [])
      ]
    };
    onUpdateReport(updated);
    setShowResolveModal(false);
    triggerToast(`Case #${report.id} marked as Resolved`);
  };

  const handleAddMember = () => {
    if (!newMemberName) return;
    const currentMembers = report.coordination?.teamMembers || [];
    const newMember = {
      id: `tm-${Date.now()}`,
      name: newMemberName,
      role: newMemberRole,
      status: 'En Route' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };

    const updated: ReportItem = {
      ...report,
      coordination: {
        teamMembers: [...currentMembers, newMember]
      },
      routingLog: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Today',
          title: `Field Assignment: ${newMemberName}`,
          detail: `Assigned as ${newMemberRole} (En Route).`,
          type: 'assignment'
        },
        ...(report.routingLog || [])
      ]
    };

    onUpdateReport(updated);
    setShowAssignModal(false);
    setNewMemberName('');
    triggerToast(`Assigned ${newMemberName} to active coordination team`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-[#f7f9fb]">
      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* Toast Alert */}
        {messageToast && (
          <div className="fixed top-20 right-8 bg-[#131b2e] text-white px-4 py-2.5 rounded-lg shadow-lg z-50 text-[13px] flex items-center gap-2 border border-[#86f2e4]/40 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined text-[#86f2e4] text-[18px]">check_circle</span>
            <span>{messageToast}</span>
          </div>
        )}

        {/* Back Link & Header / Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#c6c6cd]">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center text-[#45464d] hover:text-[#000000] text-[13px] font-semibold mb-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] mr-1">arrow_back</span>
              Back to Queue
            </button>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-[28px] md:text-[36px] font-bold text-[#000000] tracking-tight">
                Case #{report.id}
              </h1>
              {report.priority === 'urgent' && (
                <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] px-3 py-1 rounded-full text-[12px] font-bold border border-[#ba1a1a]/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">priority_high</span> Urgent
                </span>
              )}
              {report.priority === 'high' && (
                <span className="bg-[#006a61]/10 text-[#006a61] px-3 py-1 rounded-full text-[12px] font-bold border border-[#006a61]/20 flex items-center gap-1">
                  High Priority
                </span>
              )}
              {report.status === 'Resolved' && (
                <span className="bg-[#86f2e4] text-[#006f66] px-3 py-1 rounded-full text-[12px] font-bold">
                  Resolved
                </span>
              )}
            </div>
            <p className="text-[16px] text-[#45464d] font-normal">
              {report.title} • <span className="font-semibold text-[#191c1e]">{report.location.address}</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            {onOpenGeminiChat && (
              <button
                onClick={onOpenGeminiChat}
                className="px-3.5 py-2 bg-[#131b2e] text-[#86f2e4] hover:bg-[#1e273d] rounded-lg transition-colors text-[13px] font-bold flex items-center gap-1.5 shadow-xs border border-[#86f2e4]/30"
              >
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                Ask Copilot
              </button>
            )}
            {onOpenImageStudio && (
              <button
                onClick={onOpenImageStudio}
                className="px-3.5 py-2 bg-[#f2f4f6] text-[#006a61] hover:bg-[#e6e8ea] rounded-lg transition-colors text-[13px] font-bold flex items-center gap-1.5 border border-[#c6c6cd]"
              >
                <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                AI Visual Studio
              </button>
            )}
            <button
              onClick={() => onTrackView(report)}
              className="px-3.5 py-2 border border-[#76777d] text-[#191c1e] hover:bg-[#eceef0] rounded-lg transition-colors text-[13px] font-semibold flex items-center gap-1.5 bg-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Resident View
            </button>
            <button
              onClick={() => setShowRerouteModal(true)}
              className="px-3.5 py-2 border border-[#76777d] text-[#45464d] hover:text-[#000000] hover:bg-[#eceef0] rounded-lg transition-colors text-[13px] font-semibold flex items-center gap-1.5 bg-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">alt_route</span>
              Re-route
            </button>
            <button
              onClick={handleEscalate}
              className="px-3.5 py-2 border border-[#76777d] text-[#45464d] hover:text-[#000000] hover:bg-[#eceef0] rounded-lg transition-colors text-[13px] font-semibold flex items-center gap-1.5 bg-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              Escalate
            </button>
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-4 py-2 bg-[#006a61] text-white hover:bg-[#005049] rounded-lg transition-opacity text-[13px] font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Resolve
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Summary, Maps Grounding & Coordination (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* AI Gist Summary Card */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006a61]">auto_awesome</span>
                  <h2 className="text-[20px] font-bold text-[#000000]">AI Gist Summary</h2>
                </div>
                <span className="text-[12px] bg-[#dae2fd] text-[#131b2e] px-2.5 py-0.5 rounded-full font-semibold">
                  Multi-Report Synthesized
                </span>
              </div>
              
              <p className="text-[15px] text-[#45464d] leading-relaxed mb-5">
                {report.aiGist?.summary || report.description}
              </p>

              <div className="flex gap-2 flex-wrap">
                <span className="bg-[#eceef0] px-2.5 py-1 rounded text-[12px] font-medium text-[#191c1e] border border-[#c6c6cd]">
                  Dept: {report.actualDept || report.suggestedDept}
                </span>
                <span className="bg-[#eceef0] px-2.5 py-1 rounded text-[12px] font-medium text-[#191c1e] border border-[#c6c6cd]">
                  Sector: {report.location.sector || 'Sector 4'}
                </span>
                <span className="bg-[#eceef0] px-2.5 py-1 rounded text-[12px] font-medium text-[#191c1e] border border-[#c6c6cd]">
                  Impact: {report.aiGist?.impact || 'High'}
                </span>
                {report.aiGist?.keywords?.map((kw, i) => (
                  <span key={i} className="bg-[#f2f4f6] px-2 py-1 rounded text-[11px] text-[#76777d]">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Google Maps Grounding Card */}
            <MapsGroundingCard
              address={report.location.address}
              report={report}
            />

            {/* Coordination Section */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-[#c6c6cd] pb-3">
                <h2 className="text-[20px] font-bold text-[#000000]">Coordination &amp; Assignments</h2>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-[13px] text-[#006a61] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  Assign Crew
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f2f4f6] border-b border-[#c6c6cd]">
                      <th className="py-3 px-4 text-[13px] text-[#45464d] font-semibold">Team Member</th>
                      <th className="py-3 px-4 text-[13px] text-[#45464d] font-semibold">Role</th>
                      <th className="py-3 px-4 text-[13px] text-[#45464d] font-semibold">Status</th>
                      <th className="py-3 px-4 text-[13px] text-[#45464d] font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px]">
                    {(report.coordination?.teamMembers || []).map((member) => (
                      <tr key={member.id} className="border-b border-[#e6e8ea] hover:bg-[#f7f9fb] transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3 font-medium text-[#191c1e]">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full bg-[#eceef0] object-cover border border-[#c6c6cd]"
                          />
                          <span>{member.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#45464d]">
                          {member.role}
                        </td>
                        <td className="py-3.5 px-4">
                          {member.status === 'En Route' ? (
                            <span className="bg-[#006a61]/10 text-[#006a61] px-2.5 py-0.5 rounded-full text-[12px] font-semibold border border-[#006a61]/20">
                              En Route
                            </span>
                          ) : (
                            <span className="bg-[#dae2fd] text-[#131b2e] px-2.5 py-0.5 rounded-full text-[12px] font-semibold border border-[#c6c6cd]">
                              {member.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button 
                            onClick={() => triggerToast(`Radio message sent to ${member.name}`)}
                            className="text-[#006a61] hover:underline text-[13px] font-semibold cursor-pointer"
                          >
                            Message
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!report.coordination?.teamMembers || report.coordination.teamMembers.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-[#76777d] text-[13px]">
                          No field team dispatched yet. Click "Assign Crew" to dispatch personnel.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evidence Thumbnail in detail view */}
            {report.evidenceImages.length > 0 && (
              <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[16px] font-bold text-[#000000]">Field Media &amp; Evidence</h3>
                  {onOpenImageStudio && (
                    <button
                      onClick={onOpenImageStudio}
                      className="text-[12.5px] text-[#006a61] font-bold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Edit Photo with AI
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {report.evidenceImages.map((img, i) => (
                    <div key={i} className="h-32 rounded-lg overflow-hidden border border-[#c6c6cd] bg-[#eceef0] relative group">
                      <img src={img} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[12px]">
                        Inspect Full Image
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Routing Log & Urgency Widget (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Urgency / Risk Profile Widget */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at top right, #ba1a1a 0%, transparent 70%)' }}
              />
              <h2 className="text-[20px] font-bold text-[#000000] mb-5 relative z-10">Risk Profile</h2>
              
              <div className="flex justify-between items-end mb-2 relative z-10">
                <div>
                  <div className="text-[38px] font-bold text-[#ba1a1a] leading-none">
                    {report.aiGist?.riskScore || 94}
                    <span className="text-[16px] font-normal text-[#45464d]">/100</span>
                  </div>
                  <div className="text-[12px] font-bold text-[#ba1a1a] mt-1 uppercase tracking-wider">
                    {report.priority === 'urgent' ? 'Critical Priority' : `${report.priority} Priority`}
                  </div>
                </div>
                <span className="material-symbols-outlined text-[36px] text-[#ba1a1a] opacity-85" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
              </div>

              <div className="space-y-4 mt-6 relative z-10">
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#45464d]">Infrastructure Impact</span>
                    <span className="font-bold text-[#191c1e]">{report.aiGist?.infrastructureImpact || 'High'}</span>
                  </div>
                  <div className="h-2 w-full bg-[#eceef0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ba1a1a] w-11/12 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#45464d]">Public Safety Risk</span>
                    <span className="font-bold text-[#191c1e]">{report.aiGist?.publicSafetyRisk || 'Moderate'}</span>
                  </div>
                  <div className="h-2 w-full bg-[#eceef0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f59e0b] w-7/12 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Automated Routing Log */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-sm flex-1">
              <h2 className="text-[20px] font-bold text-[#000000] mb-4 border-b border-[#c6c6cd] pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">route</span>
                Routing Log
              </h2>

              <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#c6c6cd] mt-4">
                {(report.routingLog || []).map((log, index) => {
                  let dotColor = 'bg-[#76777d]';
                  if (log.type === 'assignment') dotColor = 'bg-[#006a61]';
                  else if (log.type === 'handoff') dotColor = 'bg-[#000000]';
                  else if (log.type === 'ai') dotColor = 'bg-[#131b2e]';
                  else if (log.type === 'dispatch') dotColor = 'bg-[#ba1a1a]';
                  else if (log.type === 'resolution') dotColor = 'bg-[#006a61]';

                  return (
                    <div key={index} className="relative z-10">
                      <div className={`absolute -left-4 top-1 w-3 h-3 ${dotColor} rounded-full ring-4 ring-white`} />
                      <div className="text-[12px] text-[#76777d] mb-0.5">{log.time}</div>
                      <div className="text-[14px] font-semibold text-[#000000] flex items-center gap-1">
                        {log.type === 'ai' && <span className="material-symbols-outlined text-[16px] text-[#006a61]">smart_toy</span>}
                        {log.title}
                      </div>
                      <div className="text-[13px] text-[#45464d] mt-0.5 leading-snug">{log.detail}</div>
                      {log.badge && (
                        <span className="text-[11px] text-[#45464d] bg-[#e6e8ea] inline-block px-2 py-0.5 rounded mt-1.5 border border-[#c6c6cd]">
                          {log.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Re-route Modal */}
      {showRerouteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#c6c6cd]">
            <h3 className="text-[18px] font-bold text-[#000000] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61]">alt_route</span>
              Re-route Case #{report.id}
            </h3>
            <p className="text-[13.5px] text-[#45464d] mb-4">
              Select the new municipal department responsible for triage & resolution:
            </p>
            <div className="space-y-2 mb-6">
              {(['Water & Sewer', 'Transportation', 'Parks & Rec', 'Public Works', 'Sanitation', 'Electrical & Lighting'] as DepartmentType[]).map((dept) => (
                <label key={dept} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#c6c6cd] hover:bg-[#f2f4f6] cursor-pointer">
                  <input
                    type="radio"
                    name="reroute_dept"
                    checked={selectedDept === dept}
                    onChange={() => setSelectedDept(dept)}
                    className="accent-[#000000]"
                  />
                  <span className="text-[14px] font-medium text-[#191c1e]">{dept}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowRerouteModal(false)}
                className="px-4 py-2 border border-[#76777d] rounded-lg text-[13px] font-semibold hover:bg-[#eceef0]"
              >
                Cancel
              </button>
              <button
                onClick={handleReroute}
                className="px-4 py-2 bg-[#000000] text-white rounded-lg text-[13px] font-semibold hover:bg-black/85"
              >
                Confirm Re-routing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#c6c6cd]">
            <h3 className="text-[18px] font-bold text-[#000000] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61]">task_alt</span>
              Resolve Case #{report.id}
            </h3>
            <p className="text-[13.5px] text-[#45464d] mb-4">
              Enter closing resolution notes and notify citizen of completion:
            </p>
            <textarea
              rows={4}
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="E.g. Main isolated, replacement valve installed, roadway repaved and reopened to traffic."
              className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg p-3 text-[14px] text-[#191c1e] mb-4 focus:ring-2 focus:ring-[#000000] outline-none"
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 border border-[#76777d] rounded-lg text-[13px] font-semibold hover:bg-[#eceef0]"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-[13px] font-semibold hover:bg-[#005049]"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Crew Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#c6c6cd]">
            <h3 className="text-[18px] font-bold text-[#000000] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61]">person_add</span>
              Dispatch Personnel
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                  Responder Name
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="E.g. Officer D. Vance"
                  className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3 py-2 text-[14px] text-[#191c1e] outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#191c1e] mb-1">
                  Assignment Role
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-[#c6c6cd] rounded-lg px-3 py-2 text-[14px] text-[#191c1e] outline-none"
                >
                  <option value="Lead Engineer">Lead Engineer</option>
                  <option value="Traffic Control">Traffic Control</option>
                  <option value="Safety Inspector">Safety Inspector</option>
                  <option value="Excavation Crew">Excavation Crew</option>
                  <option value="Public Works Specialist">Public Works Specialist</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-[#76777d] rounded-lg text-[13px] font-semibold hover:bg-[#eceef0]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-[#000000] text-white rounded-lg text-[13px] font-semibold hover:bg-black/85"
              >
                Dispatch Member
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
