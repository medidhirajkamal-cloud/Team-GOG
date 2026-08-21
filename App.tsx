/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, UserRole, ReportItem, RecurringIssue } from './types';
import { INITIAL_REPORTS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IntakePortal } from './components/IntakePortal';
import { TriageDashboard } from './components/TriageDashboard';
import { CaseDetailView } from './components/CaseDetailView';
import { StatusTrackerView } from './components/StatusTrackerView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CasesListView } from './components/CasesListView';
import { SupportArchiveView } from './components/SupportArchiveView';
import { NotificationsModal, SettingsModal } from './components/Modals';

// Gemini AI & Firebase Extensions
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ImageStudioModal } from './components/ImageStudioModal';
import { GeminiChatbotDrawer } from './components/GeminiChatbotDrawer';
import {
  auth,
  subscribeToReports,
  saveReportToFirestore,
  updateReportInFirestore
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('intake');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<ReportItem>(INITIAL_REPORTS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gemini AI Tools State
  const [showVoiceAssistant, setShowVoiceAssistant] = useState<boolean>(false);
  const [showImageStudio, setShowImageStudio] = useState<boolean>(false);
  const [showGeminiChat, setShowGeminiChat] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        showToast(`Welcome back, ${user.displayName || user.email}!`);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Firebase Firestore Real-Time Listener
  useEffect(() => {
    const unsubscribe = subscribeToReports(
      (firestoreReports) => {
        if (firestoreReports && firestoreReports.length > 0) {
          // Merge with initial reports to ensure full demo richness
          const existingIds = new Set(firestoreReports.map(r => r.id));
          const complementary = INITIAL_REPORTS.filter(r => !existingIds.has(r.id));
          setReports([...firestoreReports, ...complementary]);
        }
      },
      (err) => {
        console.log('Using local client state (Firestore offline or connecting):', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Add a new citizen report
  const handleAddNewReport = async (newReport: ReportItem) => {
    setReports(prev => [newReport, ...prev]);
    setSelectedReport(newReport);
    showToast(`New Report #${newReport.id} (${newReport.trackingNumber}) registered with AI Triage Engine`);

    // Sync to Firestore
    try {
      await saveReportToFirestore(newReport);
    } catch (e) {
      console.warn('Firestore write fallback:', e);
    }
  };

  // Update existing report (e.g. resolve, reroute, assign member)
  const handleUpdateReport = async (updated: ReportItem) => {
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelectedReport(updated);

    // Sync to Firestore
    try {
      await updateReportInFirestore(updated);
    } catch (e) {
      console.warn('Firestore update fallback:', e);
    }
  };

  // Select case for detail view
  const handleSelectCase = (report: ReportItem) => {
    setSelectedReport(report);
    setCurrentView('case-detail');
  };

  // Select case for tracking view
  const handleTrackView = (report: ReportItem) => {
    setSelectedReport(report);
    setCurrentView('tracking');
  };

  // Auto assign high confidence reports
  const handleAutoAssignHighConfidence = () => {
    let assignedCount = 0;
    const updatedReports = reports.map(r => {
      if (r.aiConfidence >= 80 && r.status === 'Pending Review') {
        assignedCount++;
        const updated: ReportItem = {
          ...r,
          status: 'In Progress' as const,
          actualDept: r.suggestedDept,
          routingLog: [
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Today',
              title: `Auto-Assigned to ${r.suggestedDept}`,
              detail: `High confidence AI threshold met (${r.aiConfidence}%). Dispatched directly to departmental active queue.`,
              type: 'ai' as const
            },
            ...(r.routingLog || [])
          ]
        };
        // Background sync
        updateReportInFirestore(updated).catch(() => {});
        return updated;
      }
      return r;
    });

    setReports(updatedReports);
    showToast(`Auto-routed ${assignedCount} high-confidence cases to their target municipal departments!`);
  };

  // Merge duplicate reports
  const handleMergeReports = (reportId: string, targetCaseId: string) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        const item: ReportItem = {
          ...r,
          status: 'Merged' as const,
          duplicateOf: targetCaseId,
          routingLog: [
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Today',
              title: `Merged into Case #${targetCaseId}`,
              detail: `Duplicate resolved and combined with master incident thread.`,
              type: 'handoff' as const
            },
            ...(r.routingLog || [])
          ]
        };
        updateReportInFirestore(item).catch(() => {});
        return item;
      }
      return r;
    });
    setReports(updated);
    showToast(`Case #${reportId} merged successfully into Master Incident #${targetCaseId}`);
  };

  // Dismiss duplicate suggestion
  const handleDismissDuplicate = (reportId: string) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        const { duplicateOf, similarityScore, ...rest } = r;
        const item = rest as ReportItem;
        updateReportInFirestore(item).catch(() => {});
        return item;
      }
      return r;
    });
    setReports(updated);
    showToast(`Duplicate alert dismissed for Case #${reportId}`);
  };

  // Search by tracking code or ID
  const handleSearchTracking = (code: string) => {
    const found = reports.find(
      r => r.trackingNumber.toLowerCase() === code.toLowerCase() || r.id.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      setSelectedReport(found);
      setCurrentView('tracking');
      showToast(`Located Incident Record #${found.trackingNumber}`);
    } else {
      showToast(`No incident record found matching "${code}". Try #CW-2023-894 or #RPT-8832`);
    }
  };

  // Select hotspot from analytics
  const handleSelectHotspot = (hotspot: RecurringIssue) => {
    const matched = reports.find(r => r.location.address.includes(hotspot.location) || hotspot.location.includes(r.location.address));
    if (matched) {
      setSelectedReport(matched);
      setCurrentView('case-detail');
    } else {
      showToast(`Viewing cluster: ${hotspot.location} (${hotspot.reportCount} incidents)`);
    }
  };

  const pendingTriageCount = reports.filter(r => r.status === 'Pending Review').length;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col font-sans selection:bg-[#86f2e4] selection:text-[#00201d]">
      
      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#131b2e] text-white px-5 py-3 rounded-xl shadow-2xl z-50 text-[13.5px] font-medium flex items-center gap-3 border border-[#86f2e4]/30 animate-in fade-in slide-in-from-bottom-5">
          <span className="material-symbols-outlined text-[#86f2e4] text-[20px]">info</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-[#7c839b] hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'intake') setUserRole('citizen');
          else if (view === 'triage' || view === 'cases' || view === 'analytics') setUserRole('staff');
        }}
        userRole={userRole}
        setUserRole={setUserRole}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q.toUpperCase().startsWith('CW-') || q.toUpperCase().startsWith('RPT-')) {
            handleSearchTracking(q);
          }
        }}
        unreadNotifications={2}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenVoiceAssistant={() => setShowVoiceAssistant(true)}
        onOpenImageStudio={() => setShowImageStudio(true)}
        onOpenGeminiChat={() => setShowGeminiChat(true)}
        currentUser={currentUser}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar for staff or wide screens */}
        {userRole === 'staff' && (
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            onNewReport={() => {
              setCurrentView('intake');
              setUserRole('citizen');
            }}
            pendingTriageCount={pendingTriageCount}
          />
        )}

        {/* Dynamic Views */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Screen 1: Citizen Intake Portal */}
          {currentView === 'intake' && (
            <div className="flex-1 overflow-y-auto">
              <IntakePortal
                onSubmitReport={(newRpt) => {
                  handleAddNewReport(newRpt);
                }}
                onTrackExisting={() => {
                  setSelectedReport(reports[0]);
                  setCurrentView('tracking');
                }}
                onOpenVoiceAssistant={() => setShowVoiceAssistant(true)}
              />
            </div>
          )}

          {/* Screen 2: AI Triage Overview */}
          {currentView === 'triage' && (
            <TriageDashboard
              reports={reports}
              onSelectCase={handleSelectCase}
              onAutoAssignHighConfidence={handleAutoAssignHighConfidence}
              onMergeReports={handleMergeReports}
              onDismissDuplicate={handleDismissDuplicate}
            />
          )}

          {/* Screen 3: Case Detail View */}
          {currentView === 'case-detail' && (
            <CaseDetailView
              report={selectedReport}
              onBack={() => setCurrentView(userRole === 'staff' ? 'triage' : 'cases')}
              onUpdateReport={handleUpdateReport}
              onTrackView={handleTrackView}
              onOpenImageStudio={() => setShowImageStudio(true)}
              onOpenGeminiChat={() => setShowGeminiChat(true)}
            />
          )}

          {/* Screen 4: Resident Status Tracker View */}
          {currentView === 'tracking' && (
            <StatusTrackerView
              report={selectedReport}
              onBack={() => setCurrentView('intake')}
              onSearchOther={handleSearchTracking}
            />
          )}

          {/* Screen 5: Civic Analytics Dashboard */}
          {currentView === 'analytics' && (
            <AnalyticsDashboard
              onSelectHotspot={handleSelectHotspot}
            />
          )}

          {/* Cases Repository List */}
          {currentView === 'cases' && (
            <CasesListView
              reports={reports}
              onSelectCase={handleSelectCase}
              onNewReport={() => {
                setCurrentView('intake');
                setUserRole('citizen');
              }}
            />
          )}

          {/* Support / Archive Views */}
          {(currentView === 'support' || currentView === 'archive') && (
            <SupportArchiveView
              view={currentView}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

        </main>
      </div>

      {/* 1. Live Voice 311 Assistant Modal (gemini-3.1-flash-live-preview) */}
      <VoiceAssistantModal
        isOpen={showVoiceAssistant}
        onClose={() => setShowVoiceAssistant(false)}
        onAutoCreateReport={(newRpt) => {
          const report: ReportItem = {
            id: `RPT-${Math.floor(8833 + Math.random() * 1000)}`,
            trackingNumber: `CW-2026-${Math.floor(100 + Math.random() * 900)}`,
            title: newRpt.title || 'Voice Dispatched Incident',
            description: newRpt.description || 'Reported via Voice 311 Assistant.',
            issueType: newRpt.issueType || 'water',
            issueTypeName: newRpt.issueTypeName || 'Water & Sewer Hazard',
            iconName: 'water_drop',
            aiConfidence: 94,
            suggestedDept: newRpt.suggestedDept || 'Water & Sewer',
            actualDept: newRpt.actualDept || 'Water & Sewer',
            priority: newRpt.priority || 'urgent',
            status: 'Pending Review',
            createdAt: 'Just now',
            timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            location: newRpt.location || {
              address: 'Maple Avenue',
              crossStreet: 'Near 5th St',
              sector: 'Sector 4',
              lat: 37.7749,
              lng: -122.4194
            },
            evidenceImages: newRpt.evidenceImages || [],
            aiGist: {
              summary: 'Real-time voice intake processed via Gemini Live WebSocket API.',
              impact: 'High',
              riskScore: 92,
              infrastructureImpact: 'High',
              publicSafetyRisk: 'Moderate',
              keywords: ['voice-dispatch', 'urgent', 'gemini-live'],
              explanation: 'Automated municipal dispatch from resident vocal transmission.'
            },
            routingLog: [
              {
                time: 'Just now',
                title: 'Gemini Live Voice Intake',
                detail: 'Dispatched through bidirectional audio streaming session.',
                type: 'ai'
              }
            ]
          };
          handleAddNewReport(report);
          setCurrentView('case-detail');
        }}
      />

      {/* 2. AI Image Generation & Editing Studio (gemini-3.1-flash-image-preview) */}
      <ImageStudioModal
        isOpen={showImageStudio}
        onClose={() => setShowImageStudio(false)}
        selectedReport={selectedReport}
        onAttachImageToReport={(imgUrl, note) => {
          if (selectedReport) {
            const updated: ReportItem = {
              ...selectedReport,
              evidenceImages: [imgUrl, ...(selectedReport.evidenceImages || [])],
              routingLog: [
                {
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Today',
                  title: 'AI Visual Plan Added',
                  detail: note || 'Field repair diagram or safety zone overlay generated by Gemini 3.1 Flash Image.',
                  type: 'ai'
                },
                ...(selectedReport.routingLog || [])
              ]
            };
            handleUpdateReport(updated);
            showToast('Repaired visual evidence saved to case record');
          }
        }}
      />

      {/* 3. Multi-Turn Gemini AI Copilot Drawer (gemini-3.1-pro-preview / gemini-3.5-flash / gemini-3.1-flash-lite) */}
      <GeminiChatbotDrawer
        isOpen={showGeminiChat}
        onClose={() => setShowGeminiChat(false)}
        selectedReport={selectedReport}
        onJumpToReport={(rptId) => {
          const match = reports.find(r => r.id === rptId || r.trackingNumber === rptId);
          if (match) {
            setSelectedReport(match);
            setCurrentView('case-detail');
            setShowGeminiChat(false);
          }
        }}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onSelectReport={(rptId) => {
          const match = reports.find(r => r.id === rptId);
          if (match) {
            setSelectedReport(match);
            setCurrentView('case-detail');
          }
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

    </div>
  );
}
