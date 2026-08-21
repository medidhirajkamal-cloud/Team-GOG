import React, { useState } from 'react';
import { ReportItem, DepartmentType, PriorityLevel } from '../types';

interface IntakePortalProps {
  onSubmitReport: (newReport: ReportItem) => void;
  onTrackExisting: () => void;
  onOpenVoiceAssistant?: () => void;
}

const COMMON_ISSUES = [
  { id: 'pothole', label: 'Pothole', icon: 'warning', dept: 'Transportation' as DepartmentType, priority: 'high' as PriorityLevel },
  { id: 'streetlight', label: 'Street Light', icon: 'lightbulb', dept: 'Electrical & Lighting' as DepartmentType, priority: 'normal' as PriorityLevel },
  { id: 'graffiti', label: 'Graffiti', icon: 'format_paint', dept: 'Public Works' as DepartmentType, priority: 'low' as PriorityLevel },
  { id: 'dumping', label: 'Illegal Dumping', icon: 'delete', dept: 'Sanitation' as DepartmentType, priority: 'high' as PriorityLevel },
  { id: 'tree', label: 'Tree Issue', icon: 'park', dept: 'Parks & Rec' as DepartmentType, priority: 'normal' as PriorityLevel },
  { id: 'water', label: 'Water Leak', icon: 'water_drop', dept: 'Water & Sewer' as DepartmentType, priority: 'urgent' as PriorityLevel },
  { id: 'other', label: 'Other Issue', icon: 'more_horiz', dept: 'Public Works' as DepartmentType, priority: 'normal' as PriorityLevel }
];

export const IntakePortal: React.FC<IntakePortalProps> = ({ onSubmitReport, onTrackExisting, onOpenVoiceAssistant }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedIssueType, setSelectedIssueType] = useState<string>('water');
  const [title, setTitle] = useState('Water Main Leak Reported');
  const [description, setDescription] = useState('Pavement bubbling with continuous water flow at intersection. High volume leak flooding roadway.');
  const [mediaList, setMediaList] = useState<string[]>([
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=600'
  ]);
  const [address, setAddress] = useState('4200 Block, Maple Avenue');
  const [crossStreet, setCrossStreet] = useState('Near intersection with 5th St.');
  const [sector, setSector] = useState('Sector 4');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<ReportItem | null>(null);

  const selectedIssueObj = COMMON_ISSUES.find(i => i.id === selectedIssueType) || COMMON_ISSUES[5];

  const handleQuickSelect = (issue: typeof COMMON_ISSUES[0]) => {
    setSelectedIssueType(issue.id);
    if (!title || title.includes('Reported') || title.includes('Pothole') || title.includes('Water') || title.includes('Graffiti')) {
      if (issue.id === 'water') setTitle('Water Main Leak Reported');
      else if (issue.id === 'pothole') setTitle('Deep Pothole Hazard');
      else if (issue.id === 'streetlight') setTitle('Broken / Flickering Streetlight');
      else if (issue.id === 'graffiti') setTitle('Graffiti on Public Property');
      else if (issue.id === 'dumping') setTitle('Illegal Waste Dumping');
      else if (issue.id === 'tree') setTitle('Fallen Tree / Hazardous Limb');
      else setTitle('Community Maintenance Request');
    }
  };

  const handleAddSampleMedia = (url: string) => {
    if (!mediaList.includes(url)) {
      const updated = [...mediaList, url];
      setMediaList(updated);
      triggerAiAnalysis(url);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result;
          setMediaList([...mediaList, base64]);
          triggerAiAnalysis(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAiAnalysis = async (imgData: string) => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/triage-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location: `${address}, ${crossStreet}`,
          image: imgData
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data);
        if (data.detectedIssue) setTitle(data.detectedIssue);
        if (data.recommendedDept) {
          const matched = COMMON_ISSUES.find(c => c.dept.toLowerCase() === data.recommendedDept.toLowerCase());
          if (matched) setSelectedIssueType(matched.id);
        }
      }
    } catch (err) {
      console.warn('AI Triage scan fallback:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `RPT-${Math.floor(8833 + Math.random() * 1000)}`;
      const trackingCode = `CW-2026-${Math.floor(100 + Math.random() * 900)}`;
      
      const newReport: ReportItem = {
        id: newId,
        trackingNumber: trackingCode,
        title: title || `${selectedIssueObj.label} Incident`,
        description: description || 'Citizen reported community issue via portal.',
        issueType: selectedIssueType as any,
        issueTypeName: selectedIssueObj.label,
        iconName: selectedIssueObj.icon,
        aiConfidence: aiAnalysisResult?.confidence || (selectedIssueType === 'water' ? 95 : 88),
        suggestedDept: (aiAnalysisResult?.recommendedDept as DepartmentType) || selectedIssueObj.dept,
        actualDept: (aiAnalysisResult?.recommendedDept as DepartmentType) || selectedIssueObj.dept,
        priority: (aiAnalysisResult?.priority as PriorityLevel) || selectedIssueObj.priority,
        status: 'Pending Review',
        createdAt: 'Just now',
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        location: {
          address: address || 'Maple Avenue',
          crossStreet: crossStreet,
          sector: sector,
          lat: 37.7749,
          lng: -122.4194
        },
        evidenceImages: mediaList,
        aiGist: {
          summary: aiAnalysisResult?.summary || `${selectedIssueObj.label} reported near ${address}. Automatic classification determined ${selectedIssueObj.dept} routing.`,
          impact: selectedIssueObj.priority === 'urgent' ? 'High' : 'Moderate',
          riskScore: aiAnalysisResult?.riskScore || (selectedIssueObj.priority === 'urgent' ? 92 : 65),
          infrastructureImpact: selectedIssueObj.priority === 'urgent' ? 'High' : 'Moderate',
          publicSafetyRisk: selectedIssueObj.priority === 'urgent' ? 'Moderate' : 'Low',
          keywords: aiAnalysisResult?.keywords || [selectedIssueObj.label.toLowerCase(), 'citizen report', 'dispatched'],
          explanation: aiAnalysisResult?.explanation || `Assigned to ${selectedIssueObj.dept} based on keyword syntax & automated civic image classification.`
        },
        routingLog: [
          {
            time: 'Just now',
            title: 'AI Classification (Gemini 3.5 Flash)',
            detail: `Categorized as '${title || selectedIssueObj.label}' with ${aiAnalysisResult?.confidence || 94}% confidence.`,
            type: 'ai'
          },
          {
            time: 'Just now',
            title: 'Initial Intake',
            detail: 'Submitted via Web Citizen Portal (Geo-tagged & Verified)',
            type: 'intake'
          }
        ]
      };

      onSubmitReport(newReport);
      setIsSubmitting(false);
      setSubmissionSuccess(newReport);
    }, 600);
  };

  return (
    <div className="w-full pb-20">
      {/* Hero Section */}
      <section className="relative bg-[#f2f4f6] pt-12 pb-16 md:pb-20 px-4 md:px-10 border-b border-[#c6c6cd] overflow-hidden">
        <div className="max-w-[1280px] mx-auto relative z-10 text-center md:text-left grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#000000] mb-4 md:mb-5 leading-tight tracking-tight">
              Report a Community Issue
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#45464d] mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
              Help keep our city safe, accessible, and clean. Use this portal or speak to our Live Voice 311 Dispatcher to report potholes, water leaks, or graffiti directly to municipal teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center md:justify-start">
              <button
                onClick={() => {
                  setSubmissionSuccess(null);
                  setCurrentStep(1);
                  const el = document.getElementById('report-wizard');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#000000] text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-black/85 transition-colors shadow-md active:scale-95 duration-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Start New Report
              </button>
              {onOpenVoiceAssistant && (
                <button
                  onClick={onOpenVoiceAssistant}
                  className="bg-[#131b2e] text-[#86f2e4] border border-[#86f2e4]/40 text-[14px] font-bold px-6 py-3 rounded-lg hover:bg-[#1e273d] transition-colors shadow-md active:scale-95 duration-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                  Voice 311 Report
                </button>
              )}
              <button
                onClick={onTrackExisting}
                className="border border-[#76777d] text-[#191c1e] text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-[#eceef0] transition-colors active:scale-95 duration-100 flex items-center justify-center gap-2 bg-white/70 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Track Report
              </button>
            </div>
          </div>

          <div className="hidden md:block relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg border border-[#c6c6cd]/50 bg-white">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
              alt="City skyline"
              className="w-full h-full object-cover absolute inset-0 z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f7f9fb]/90 via-[#f7f9fb]/30 to-transparent z-10" />
            <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-[#c6c6cd] shadow-sm max-w-xs">
              <div className="flex items-center gap-2 text-[#006a61] text-[12px] font-bold">
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                AI Multimodal Dispatch
              </div>
              <p className="text-[11.5px] text-[#45464d] mt-1">
                Powered by Gemini 3.5 Flash &amp; Gemini 3.1 Live Voice for instant municipal response.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#dae2fd]/40 rounded-full blur-3xl opacity-50 z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#86f2e4]/30 rounded-full blur-3xl opacity-50 z-0 pointer-events-none" />
      </section>

      {/* Main Wizard Form Area */}
      <div id="report-wizard" className="max-w-[1280px] mx-auto px-4 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Wizard Container */}
          <div className="lg:col-span-8">
            {/* Progress Tracker */}
            <div className="mb-8 flex items-center justify-between relative px-2">
              <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1 bg-[#e6e8ea] z-0 rounded-full" />
              
              {/* Step 1 */}
              <div 
                onClick={() => setCurrentStep(1)}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] mb-1.5 transition-all ${
                  currentStep >= 1 ? 'bg-[#000000] text-white shadow-md' : 'bg-[#eceef0] text-[#76777d] border-2 border-[#c6c6cd]'
                }`}>
                  1
                </div>
                <span className={`text-[12px] font-semibold ${currentStep === 1 ? 'text-[#000000]' : 'text-[#76777d]'}`}>
                  Details
                </span>
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => setCurrentStep(2)}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] mb-1.5 transition-all ${
                  currentStep >= 2 ? 'bg-[#000000] text-white shadow-md' : 'bg-[#eceef0] text-[#76777d] border-2 border-[#c6c6cd]'
                }`}>
                  2
                </div>
                <span className={`text-[12px] font-semibold ${currentStep === 2 ? 'text-[#000000]' : 'text-[#76777d]'}`}>
                  Media &amp; AI
                </span>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => setCurrentStep(3)}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] mb-1.5 transition-all ${
                  currentStep >= 3 ? 'bg-[#000000] text-white shadow-md' : 'bg-[#eceef0] text-[#76777d] border-2 border-[#c6c6cd]'
                }`}>
                  3
                </div>
                <span className={`text-[12px] font-semibold ${currentStep === 3 ? 'text-[#000000]' : 'text-[#76777d]'}`}>
                  Location
                </span>
              </div>

              {/* Step 4 */}
              <div 
                onClick={() => setCurrentStep(4)}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] mb-1.5 transition-all ${
                  currentStep === 4 ? 'bg-[#000000] text-white shadow-md' : 'bg-[#eceef0] text-[#76777d] border-2 border-[#c6c6cd]'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
                <span className={`text-[12px] font-semibold ${currentStep === 4 ? 'text-[#000000]' : 'text-[#76777d]'}`}>
                  Review
                </span>
              </div>
            </div>

            {/* Success Submission Banner if just submitted */}
            {submissionSuccess ? (
              <div className="bg-white border border-[#006a61] rounded-xl shadow-sm p-8 text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-[#86f2e4] text-[#006f66] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <h2 className="text-[24px] font-bold text-[#000000] mb-2">Report Successfully Submitted!</h2>
                <p className="text-[15px] text-[#45464d] max-w-md mx-auto mb-4">
                  Your report has been received and triaged by the AI routing system. It is now assigned to the <strong>{submissionSuccess.suggestedDept}</strong> department.
                </p>
                <div className="bg-[#f2f4f6] inline-block px-5 py-2.5 rounded-lg border border-[#c6c6cd] mb-6">
                  <span className="text-[12px] text-[#76777d] uppercase tracking-wider block">Tracking Reference</span>
                  <span className="text-[20px] font-bold text-[#000000]">{submissionSuccess.trackingNumber}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={onTrackExisting}
                    className="bg-[#000000] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-black/85 transition-colors cursor-pointer"
                  >
                    Track Report Status
                  </button>
                  <button
                    onClick={() => {
                      setSubmissionSuccess(null);
                      setCurrentStep(1);
                      setTitle('');
                      setDescription('');
                    }}
                    className="border border-[#76777d] text-[#191c1e] px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-[#eceef0] transition-colors cursor-pointer"
                  >
                    Submit Another Report
                  </button>
                </div>
              </div>
            ) : (
              /* Step Cards */
              <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
                
                {/* STEP 1: Describe the Issue */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-[22px] font-bold text-[#000000] mb-6 flex items-center gap-2 border-b border-[#e6e8ea] pb-4">
                      <span className="material-symbols-outlined text-[#006a61]">description</span>
                      Describe the Issue
                    </h2>

                    {/* Common Reports Quick Select */}
                    <div className="mb-8">
                      <label className="block text-[14px] font-semibold text-[#191c1e] mb-3">
                        Quick Select Common Issues
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {COMMON_ISSUES.map((issue) => {
                          const isSelected = selectedIssueType === issue.id;
                          return (
                            <button
                              key={issue.id}
                              type="button"
                              onClick={() => handleQuickSelect(issue)}
                              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-center h-24 cursor-pointer focus:outline-none ${
                                isSelected
                                  ? 'border-[#000000] bg-[#f2f4f6] text-[#000000] ring-2 ring-[#000000]'
                                  : 'border-[#c6c6cd] bg-white text-[#45464d] hover:bg-[#f2f4f6] hover:border-[#000000] hover:text-[#000000]'
                              }`}
                            >
                              <span className={`material-symbols-outlined mb-2 text-[28px] transition-transform ${
                                isSelected ? 'text-[#000000] scale-110' : 'text-[#76777d]'
                              }`}>
                                {issue.icon}
                              </span>
                              <span className="text-[12px] font-medium leading-tight">{issue.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Manual Entry Inputs */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[14px] font-semibold text-[#191c1e] mb-2" htmlFor="issue-title">
                          Issue Title
                        </label>
                        <input
                          id="issue-title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="E.g., Large pothole on Main St."
                          className="w-full bg-white border border-[#c6c6cd] rounded-lg px-4 py-3 text-[15px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent transition-shadow placeholder-[#76777d]/60"
                        />
                      </div>

                      <div>
                        <label className="block text-[14px] font-semibold text-[#191c1e] mb-2" htmlFor="issue-description">
                          Detailed Description
                          <span className="text-[#45464d]/70 font-normal ml-1">(Optional but helpful)</span>
                        </label>
                        <textarea
                          id="issue-description"
                          rows={5}
                          value={description}
                          maxLength={500}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Please provide any additional details that might help crews locate or understand the issue..."
                          className="w-full bg-white border border-[#c6c6cd] rounded-lg px-4 py-3 text-[15px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent transition-shadow resize-y placeholder-[#76777d]/60"
                        />
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[12px] text-[#006a61]">
                            {selectedIssueObj && `⚡ Auto-routes to ${selectedIssueObj.dept}`}
                          </span>
                          <span className="text-[12px] text-[#76777d]">{description.length}/500 characters</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-[#e6e8ea] mt-8">
                      <button
                        type="button"
                        onClick={() => {
                          setTitle('');
                          setDescription('');
                        }}
                        className="text-[#45464d] hover:text-[#000000] text-[14px] font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-[#eceef0]"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="bg-[#000000] text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-black/85 transition-colors shadow-sm active:scale-95 duration-100 flex items-center gap-2 cursor-pointer"
                      >
                        Continue to Media
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Media & Evidence */}
                {currentStep === 2 && (
                  <div>
                    <div className="flex justify-between items-center mb-6 border-b border-[#e6e8ea] pb-4">
                      <h2 className="text-[22px] font-bold text-[#000000] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006a61]">photo_camera</span>
                        Upload Evidence &amp; AI Analysis
                      </h2>
                      {isAiAnalyzing && (
                        <span className="text-[12px] font-bold text-[#006a61] flex items-center gap-1.5 bg-[#86f2e4]/30 px-3 py-1 rounded-full animate-pulse">
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          Gemini Vision Analyzing...
                        </span>
                      )}
                    </div>

                    <p className="text-[14px] text-[#45464d] mb-4">
                      Upload photos to trigger multimodal AI damage detection, measure severity, and ensure accurate dispatch routing.
                    </p>

                    {/* Upload Dropzone */}
                    <div className="border-2 border-dashed border-[#c6c6cd] rounded-xl p-6 text-center hover:bg-[#f2f4f6] transition-colors mb-6 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-[40px] text-[#76777d] mb-2">cloud_upload</span>
                        <span className="text-[15px] font-semibold text-[#000000]">Drag &amp; drop photos or click to browse</span>
                        <span className="text-[12px] text-[#76777d] mt-1">Supports JPG, PNG, WEBP • Automatically runs AI Vision scan</span>
                      </div>
                    </div>

                    {/* Photo previews */}
                    <div className="mb-6">
                      <label className="block text-[14px] font-semibold text-[#191c1e] mb-3">
                        Attached Photos ({mediaList.length})
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {mediaList.map((url, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#c6c6cd] h-32 bg-[#eceef0]">
                            <img src={url} alt="Evidence preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(idx)}
                              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                            >
                              ✕
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-0.5 truncate">
                              AI Analyzed • High Clarity
                            </div>
                          </div>
                        ))}

                        {/* Quick Add Preset Evidence */}
                        {mediaList.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleAddSampleMedia('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=600')}
                            className="border border-[#c6c6cd] rounded-lg h-32 flex flex-col items-center justify-center text-[#006a61] hover:bg-[#f2f4f6] text-[13px] font-medium p-2 text-center"
                          >
                            <span className="material-symbols-outlined mb-1">add_photo_alternate</span>
                            Use Sample Photo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Smart Tag Detection Badge */}
                    {aiAnalysisResult ? (
                      <div className="bg-[#131b2e] text-white rounded-xl p-4 mb-6 shadow-xs border border-[#86f2e4]/30 animate-in fade-in">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-[#86f2e4] font-bold text-[13.5px]">
                            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                            <span>Gemini Multimodal Vision Diagnosis</span>
                          </div>
                          <span className="bg-[#86f2e4] text-[#00201d] text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {aiAnalysisResult.confidence || 95}% Confidence
                          </span>
                        </div>
                        <p className="text-[13px] text-[#dae2fd] mb-2 leading-relaxed">
                          {aiAnalysisResult.summary || 'Surface flooding and pressurized rupture pattern detected.'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <span className="bg-white/10 px-2 py-0.5 rounded text-white">
                            Dept: {aiAnalysisResult.recommendedDept || selectedIssueObj.dept}
                          </span>
                          <span className="bg-white/10 px-2 py-0.5 rounded text-white">
                            Risk: {aiAnalysisResult.riskScore || 85}/100
                          </span>
                          {aiAnalysisResult.keywords?.map((kw: string, i: number) => (
                            <span key={i} className="bg-[#86f2e4]/20 text-[#86f2e4] px-2 py-0.5 rounded">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      mediaList.length > 0 && (
                        <div className="bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg p-3.5 flex items-start gap-3 mb-6">
                          <span className="material-symbols-outlined text-[#006a61] text-[20px] mt-0.5">auto_awesome</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[13px] font-semibold text-[#000000]">AI Vision Pre-Scan Active</span>
                              <button
                                type="button"
                                onClick={() => triggerAiAnalysis(mediaList[0])}
                                className="text-[12px] text-[#006a61] font-bold hover:underline"
                              >
                                Re-Scan with AI
                              </button>
                            </div>
                            <span className="text-[12px] text-[#45464d] block mt-0.5">
                              Ready to classify surface anomalies, water pooling, structural damage, and lane obstructions.
                            </span>
                          </div>
                        </div>
                      )
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-[#e6e8ea]">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[#45464d] hover:text-[#000000] text-[14px] font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-[#eceef0] flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="bg-[#000000] text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-black/85 transition-colors shadow-sm active:scale-95 duration-100 flex items-center gap-2 cursor-pointer"
                      >
                        Continue to Location
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Location Details */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-[22px] font-bold text-[#000000] mb-6 flex items-center gap-2 border-b border-[#e6e8ea] pb-4">
                      <span className="material-symbols-outlined text-[#006a61]">location_on</span>
                      Specify Location
                    </h2>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-[14px] font-semibold text-[#191c1e] mb-1.5" htmlFor="street-addr">
                          Street Address / Block
                        </label>
                        <input
                          id="street-addr"
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="E.g. 4200 Block, Maple Avenue"
                          className="w-full bg-white border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[15px] text-[#191c1e] focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[14px] font-semibold text-[#191c1e] mb-1.5" htmlFor="cross-street">
                            Nearest Cross-Street
                          </label>
                          <input
                            id="cross-street"
                            type="text"
                            value={crossStreet}
                            onChange={(e) => setCrossStreet(e.target.value)}
                            placeholder="E.g. Near intersection with 5th St."
                            className="w-full bg-white border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[15px] text-[#191c1e] focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[14px] font-semibold text-[#191c1e] mb-1.5" htmlFor="sector-select">
                            City Sector / Ward
                          </label>
                          <select
                            id="sector-select"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="w-full bg-white border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[15px] text-[#191c1e] focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none"
                          >
                            <option value="Sector 1">Sector 1 - North District</option>
                            <option value="Sector 2">Sector 2 - Central Core</option>
                            <option value="Sector 3">Sector 3 - Riverwalk / Waterfront</option>
                            <option value="Sector 4">Sector 4 - Downtown Sector</option>
                            <option value="Sector 5">Sector 5 - Eastside Industrial</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Pin Map Preview */}
                    <div className="rounded-xl overflow-hidden border border-[#c6c6cd] mb-6 relative">
                      <div className="h-48 w-full bg-[#eceef0] relative flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                          alt="City map"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-bold text-[#000000] border border-[#c6c6cd] shadow-xs flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
                          Pin Dropped: {address}
                        </div>
                      </div>
                      <div className="p-3 bg-[#f2f4f6] text-[12px] text-[#45464d] flex justify-between items-center">
                        <span>Click map or drag marker to refine coordinates</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAddress('3900 Block, Broadway');
                            setCrossStreet('Intersection with 4th St');
                          }}
                          className="text-[#006a61] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">my_location</span>
                          Use GPS
                        </button>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-[#e6e8ea]">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[#45464d] hover:text-[#000000] text-[14px] font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-[#eceef0] flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="bg-[#000000] text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-black/85 transition-colors shadow-sm active:scale-95 duration-100 flex items-center gap-2 cursor-pointer"
                      >
                        Review Report
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review & Submit */}
                {currentStep === 4 && (
                  <div>
                    <h2 className="text-[22px] font-bold text-[#000000] mb-6 flex items-center gap-2 border-b border-[#e6e8ea] pb-4">
                      <span className="material-symbols-outlined text-[#006a61]">task_alt</span>
                      Review &amp; Confirm Submission
                    </h2>

                    {/* AI Predicted Triage Card */}
                    <div className="bg-[#131b2e] text-white rounded-xl p-5 mb-6 shadow-md border border-[#c6c6cd]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#86f2e4]">psychology</span>
                          <span className="text-[14px] font-bold text-[#86f2e4]">AI Pre-Triage Prediction (Gemini 3.5 Flash)</span>
                        </div>
                        <span className="bg-[#86f2e4] text-[#00201d] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {aiAnalysisResult?.confidence || 95}% Confidence
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px] pt-2 border-t border-white/10">
                        <div>
                          <span className="text-[#7c839b] block text-[11px]">Assigned Department</span>
                          <span className="font-semibold text-white">{aiAnalysisResult?.recommendedDept || selectedIssueObj.dept}</span>
                        </div>
                        <div>
                          <span className="text-[#7c839b] block text-[11px]">Estimated Priority</span>
                          <span className="font-semibold capitalize text-[#ffdad6]">{selectedIssueObj.priority} Priority</span>
                        </div>
                        <div>
                          <span className="text-[#7c839b] block text-[11px]">SLA Response Window</span>
                          <span className="font-semibold text-white">Under 2 Hours</span>
                        </div>
                      </div>
                    </div>

                    {/* Details Summary Grid */}
                    <div className="bg-[#f2f4f6] rounded-xl p-5 border border-[#c6c6cd] space-y-4 mb-6 text-[14px]">
                      <div className="flex justify-between items-start border-b border-[#c6c6cd]/50 pb-3">
                        <div>
                          <span className="text-[12px] text-[#76777d] uppercase tracking-wider font-semibold block">Issue Details</span>
                          <span className="font-bold text-[#000000] text-[16px]">{title || 'Untitled Issue'}</span>
                          <p className="text-[#45464d] text-[13px] mt-1">{description || 'No description provided.'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-[#006a61] text-[12px] font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="flex justify-between items-start border-b border-[#c6c6cd]/50 pb-3">
                        <div>
                          <span className="text-[12px] text-[#76777d] uppercase tracking-wider font-semibold block">Location</span>
                          <span className="font-semibold text-[#000000]">{address}</span>
                          <span className="text-[#45464d] text-[13px] block">{crossStreet} • {sector}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-[#006a61] text-[12px] font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[12px] text-[#76777d] uppercase tracking-wider font-semibold block">Photos Attached</span>
                          <span className="font-semibold text-[#000000]">{mediaList.length} photo(s) attached</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-[#006a61] text-[12px] font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Final Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-[#e6e8ea]">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-[#45464d] hover:text-[#000000] text-[14px] font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-[#eceef0] flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="bg-[#006a61] text-white text-[14px] font-semibold px-8 py-3 rounded-lg hover:bg-[#005049] transition-colors shadow-md active:scale-95 duration-100 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                            Triaging &amp; Submitting...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[20px]">send</span>
                            Submit Official Report
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Information */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Voice Dispatcher Callout */}
            {onOpenVoiceAssistant && (
              <div className="bg-[#131b2e] border border-[#86f2e4]/30 rounded-xl p-5 shadow-xs text-white">
                <div className="flex items-center gap-2 text-[#86f2e4] font-bold text-[14px] mb-2">
                  <span className="material-symbols-outlined text-[22px]">graphic_eq</span>
                  Live Voice 311 Dispatcher
                </div>
                <p className="text-[12.5px] text-[#dae2fd] mb-4 leading-relaxed">
                  Prefer speaking? Call into our bidirectional real-time Gemini Live AI dispatcher to verbally describe municipal hazards in natural conversation.
                </p>
                <button
                  onClick={onOpenVoiceAssistant}
                  className="w-full bg-[#86f2e4] hover:bg-[#72ded0] text-[#00201d] text-[13px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                  Launch Voice Dispatcher
                </button>
              </div>
            )}

            {/* Emergency Warning Card */}
            <div className="bg-[#ffdad6]/40 border border-[#ba1a1a]/30 rounded-xl p-5 flex items-start gap-4 shadow-xs">
              <div className="text-[#ba1a1a] mt-0.5 shrink-0">
                <span className="material-symbols-outlined text-[28px]">emergency</span>
              </div>
              <div>
                <h3 className="text-[14px] text-[#191c1e] font-bold mb-1">Is this an emergency?</h3>
                <p className="text-[12px] text-[#45464d] mb-3 leading-relaxed">
                  This portal is for non-emergency municipal issues only. It is monitored during normal business hours.
                </p>
                <p className="text-[14px] text-[#ba1a1a] font-bold">
                  For emergencies, please call 911 immediately.
                </p>
              </div>
            </div>

            {/* Reporting Guidelines Card */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
              <h3 className="text-[18px] font-bold text-[#000000] mb-4">Reporting Guidelines</h3>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006a61] text-[20px] mt-0.5 shrink-0">check_circle</span>
                  <span className="text-[13.5px] text-[#45464d] leading-snug">Be as specific as possible with the location and landmark coordinates.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006a61] text-[20px] mt-0.5 shrink-0">check_circle</span>
                  <span className="text-[13.5px] text-[#45464d] leading-snug">Provide clear, well-lit photos if safely possible without entering roadway.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006a61] text-[20px] mt-0.5 shrink-0">check_circle</span>
                  <span className="text-[13.5px] text-[#45464d] leading-snug">One issue per report helps our AI routing engine dispatch the proper field crew faster.</span>
                </li>
              </ul>
            </div>

            {/* Contact Info Mini-Card */}
            <div className="bg-[#f2f4f6] rounded-xl p-5 border border-[#c6c6cd]/70">
              <h4 className="text-[14px] text-[#191c1e] mb-2.5 font-bold">Need Help?</h4>
              <div className="flex items-center gap-2.5 text-[13.5px] text-[#45464d] mb-2">
                <span className="material-symbols-outlined text-[18px] text-[#006a61]">call</span>
                <span>311 Call Center (24/7 Support)</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13.5px] text-[#45464d]">
                <span className="material-symbols-outlined text-[18px] text-[#006a61]">mail</span>
                <a href="mailto:support@citypulse.gov" className="text-[#006a61] font-medium hover:underline">
                  support@citypulse.gov
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
