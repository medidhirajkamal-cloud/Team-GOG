import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { ReportItem } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  modelUsed?: string;
}

interface GeminiChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReport?: ReportItem;
  onJumpToReport?: (reportId: string) => void;
}

type ModelType = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';

interface RolePreset {
  id: string;
  name: string;
  icon: string;
  model: ModelType;
  systemInstruction: string;
  description: string;
}

const ROLES: RolePreset[] = [
  {
    id: 'dispatch',
    name: 'Municipal Dispatch Coordinator',
    icon: 'local_shipping',
    model: 'gemini-3.5-flash',
    systemInstruction:
      'You are the CityPulse Senior Municipal Dispatch Coordinator. You triage public works work orders, evaluate emergency response protocols, assess municipal department routing (Water, Transportation, Parks, Sanitation), and recommend field crew assignments based on SLA deadlines.',
    description: 'General municipal triage & field crew coordination'
  },
  {
    id: 'engineer',
    name: 'Civil Engineering Inspector',
    icon: 'engineering',
    model: 'gemini-3.1-pro-preview',
    systemInstruction:
      'You are a Senior Civil and Structural Infrastructure Engineer for the Department of Public Works. Provide rigorous, detailed engineering assessments of structural pavement failure, sinkholes, water main hydrodynamics, slope stability, electrical grid hazards, and compliance with municipal code Title 14.',
    description: 'Complex structural calculations & civil engineering analysis'
  },
  {
    id: 'fast-311',
    name: 'Rapid 311 Citizen Guide',
    icon: 'bolt',
    model: 'gemini-3.1-flash-lite',
    systemInstruction:
      'You are the CityPulse Rapid 311 Assistant. Answer citizen questions immediately with high speed, concise language, clear step-by-step instructions, tracking code lookups, and municipal contact info.',
    description: 'Fast queries, FAQs, and instant tracking status'
  },
  {
    id: 'environment',
    name: 'Environmental & Hazardous Waste Auditor',
    icon: 'eco',
    model: 'gemini-3.5-flash',
    systemInstruction:
      'You are the Municipal Environmental Health and Hazardous Material Auditor. Guide containment of toxic runoff, illegal industrial dumping, storm drain contamination, and EPA municipal sanitation standards.',
    description: 'Illegal dumping & environmental protection'
  }
];

export const GeminiChatbotDrawer: React.FC<GeminiChatbotDrawerProps> = ({
  isOpen,
  onClose,
  selectedReport,
  onJumpToReport
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('dispatch');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-3.5-flash');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your **CityPulse AI Assistant**. I can help you analyze civic incident reports, calculate infrastructure risk scores, interpret municipal repair codes, or draft crew dispatch orders. What can I assist with today?',
      time: 'Just now',
      modelUsed: 'gemini-3.5-flash'
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeRole = ROLES.find((r) => r.id === selectedRoleId) || ROLES[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // If active role changes, update default model
  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = ROLES.find((r) => r.id === roleId);
    if (role) {
      setSelectedModel(role.model);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages
        .concat(userMsg)
        .map((m) => ({ role: m.role, content: m.content }));

      // Attach context about selected report if exists
      let contextInstruction = activeRole.systemInstruction;
      if (selectedReport) {
        contextInstruction += `\nCurrently active report context in UI:\nID: ${selectedReport.id} (${selectedReport.trackingNumber})\nTitle: ${selectedReport.title}\nDept: ${selectedReport.suggestedDept}\nPriority: ${selectedReport.priority}\nLocation: ${selectedReport.location.address}\nDescription: ${selectedReport.description}`;
      }

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          model: selectedModel,
          systemInstruction: contextInstruction
        })
      });

      const data = await response.json();
      if (data.content) {
        const assistantMsg: Message = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed || selectedModel
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'No response returned');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Error communicating with Gemini (${selectedModel}):** ${err.message || 'Please check server logs.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-end z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-[#c6c6cd]">
        
        {/* Drawer Header */}
        <div className="p-4 bg-[#131b2e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#86f2e4] text-[#131b2e] flex items-center justify-center font-bold shadow-md">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px]">CivicLink Gemini AI Copilot</h3>
              </div>
              <p className="text-[12px] text-[#9ca3af]">Multi-turn assistant with specialized municipal roles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Role & Model Switcher Toolbar */}
        <div className="p-3 bg-[#f7f9fb] border-b border-[#c6c6cd] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-[#45464d] uppercase tracking-wider">AI Persona &amp; Role</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[#76777d]">Engine:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                className="bg-white border border-[#c6c6cd] rounded px-2 py-0.5 text-[11.5px] font-semibold text-[#006a61]"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              </select>
            </div>
          </div>

          {/* Role Pills */}
          <div className="grid grid-cols-2 gap-1.5">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role.id)}
                className={`p-2 rounded-lg text-left border transition-all flex items-start gap-2 ${
                  selectedRoleId === role.id
                    ? 'bg-white border-[#006a61] shadow-xs text-[#006a61]'
                    : 'bg-[#eef1f4] border-transparent text-[#45464d] hover:bg-[#e6e8ea]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">{role.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-[12px] truncate">{role.name}</div>
                  <div className="text-[10px] text-[#76777d] truncate">{role.description}</div>
                </div>
              </button>
            ))}
          </div>

          {selectedReport && (
            <div className="px-2.5 py-1.5 bg-[#dae2fd]/30 rounded-lg text-[11.5px] text-[#131b2e] flex items-center justify-between border border-[#dae2fd]">
              <span className="truncate">
                Active Case: <strong>#{selectedReport.trackingNumber}</strong> ({selectedReport.title})
              </span>
              <span className="text-[10px] text-[#006a61] font-bold">Context Injected</span>
            </div>
          )}
        </div>

        {/* Chat Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-bold text-[#45464d]">
                  {msg.role === 'user' ? 'You' : `${activeRole.name}`}
                </span>
                <span className="text-[10px] text-[#76777d]">• {msg.time}</span>
                {msg.modelUsed && (
                  <span className="text-[9.5px] px-1.5 py-0.2 bg-[#f2f4f6] text-[#76777d] rounded font-mono">
                    {msg.modelUsed}
                  </span>
                )}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-[13.5px] leading-relaxed max-w-[90%] shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#006a61] text-white rounded-br-none'
                    : 'bg-[#f7f9fb] text-[#191c1e] rounded-bl-none border border-[#e6e8ea]'
                }`}
              >
                <div className="markdown-body prose prose-sm max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#f7f9fb] border border-[#e6e8ea] rounded-2xl rounded-bl-none text-[13px] text-[#45464d]">
                <div className="w-4 h-4 border-2 border-[#006a61] border-t-transparent rounded-full animate-spin"></div>
                <span>{activeRole.name} is thinking ({selectedModel})...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-[#f7f9fb] border-t border-[#e6e8ea] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            'Calculate asphalt repair tonnage for #RPT-8832',
            'Summarize SLA deadlines for Water & Sewer',
            'Draft field crew safety notice',
            'What is the municipal response time requirement?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11.5px] bg-white border border-[#c6c6cd] hover:border-[#006a61] hover:text-[#006a61] px-3 py-1 rounded-full text-[#45464d] transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#c6c6cd]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${activeRole.name}...`}
              className="flex-1 border border-[#c6c6cd] rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#006a61] text-[#191c1e]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`px-4 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-1 shadow-xs transition-all ${
                isLoading || !inputMessage.trim()
                  ? 'bg-[#c6c6cd] text-white cursor-not-allowed'
                  : 'bg-[#006a61] hover:bg-[#00524b] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
