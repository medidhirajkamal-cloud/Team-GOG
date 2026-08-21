import React, { useState } from 'react';
import { AppView, UserRole } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { signInWithGoogle, logOut } from '../lib/firebase';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenImageStudio: () => void;
  onOpenGeminiChat: () => void;
  currentUser: FirebaseUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  userRole,
  setUserRole,
  searchQuery,
  setSearchQuery,
  unreadNotifications,
  onOpenNotifications,
  onOpenSettings,
  onOpenVoiceAssistant,
  onOpenImageStudio,
  onOpenGeminiChat,
  currentUser
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setShowUserMenu(false);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <header className="bg-[#f7f9fb] border-b border-[#c6c6cd] sticky top-0 z-40 shrink-0">
      <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-[1400px] mx-auto h-16">
        
        {/* Left: Brand & Desktop Navigation */}
        <div className="flex items-center gap-6 h-full">
          <button 
            onClick={() => setCurrentView('intake')}
            className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#006a61] text-white flex items-center justify-center font-bold text-[16px] shadow-sm">
              CL
            </div>
            <span className="text-[20px] font-bold text-[#000000] tracking-tight group-hover:text-[#006a61] transition-colors">
              CivicLink
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-6 items-center h-full">
            <button
              onClick={() => setCurrentView(userRole === 'citizen' ? 'intake' : 'triage')}
              className={`h-full flex items-center text-[13.5px] font-semibold tracking-wide transition-colors cursor-pointer ${
                currentView === 'intake' || currentView === 'triage'
                  ? 'text-[#000000] border-b-2 border-[#000000] pt-1'
                  : 'text-[#45464d] hover:text-[#000000]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('cases')}
              className={`h-full flex items-center text-[13.5px] font-semibold tracking-wide transition-colors cursor-pointer ${
                currentView === 'cases' || currentView === 'case-detail' || currentView === 'tracking'
                  ? 'text-[#000000] border-b-2 border-[#000000] pt-1'
                  : 'text-[#45464d] hover:text-[#000000]'
              }`}
            >
              Incident Queue
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`h-full flex items-center text-[13.5px] font-semibold tracking-wide transition-colors cursor-pointer ${
                currentView === 'analytics'
                  ? 'text-[#000000] border-b-2 border-[#000000] pt-1'
                  : 'text-[#45464d] hover:text-[#000000]'
              }`}
            >
              Civic Analytics
            </button>
          </nav>
        </div>

        {/* Center/Right AI Action Hub Tools */}
        <div className="flex items-center gap-2">
          
          {/* 1. Live Voice Assistant Button */}
          <button
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-[#131b2e] text-[#86f2e4] hover:bg-[#1e273d] transition-all shadow-xs border border-[#86f2e4]/30"
            title="Open Gemini Live Voice Dispatcher (gemini-3.1-flash-live-preview)"
          >
            <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
            <span className="hidden lg:inline">Live Voice 311</span>
          </button>

          {/* 2. Visual Repair Studio */}
          <button
            onClick={onOpenImageStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#006a61] transition-all border border-[#c6c6cd]"
            title="Create & Edit Visual Work Diagrams (gemini-3.1-flash-image-preview)"
          >
            <span className="material-symbols-outlined text-[18px]">image_search</span>
            <span className="hidden xl:inline">Visual Studio</span>
          </button>

          {/* 3. Gemini Chatbot Copilot */}
          <button
            onClick={onOpenGeminiChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-[#006a61] hover:bg-[#00524b] text-white transition-all shadow-xs"
            title="Open Multi-Turn Gemini AI Copilot (gemini-3.1-pro-preview / gemini-3.5-flash / gemini-3.1-flash-lite)"
          >
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            <span className="hidden lg:inline">AI Copilot</span>
          </button>

          <div className="h-6 w-px bg-[#c6c6cd] mx-1 hidden sm:block"></div>

          {/* Role Switcher Pill */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border border-[#c6c6cd] bg-[#f2f4f6] text-[#45464d] hover:bg-[#e6e8ea] hover:text-[#191c1e] transition-colors"
              title="Switch view perspective"
            >
              <span className="w-2 h-2 rounded-full bg-[#006a61]" />
              <span className="capitalize">{userRole === 'citizen' ? 'Resident' : 'Staff / DPW'}</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#c6c6cd] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  Select Perspective
                </div>
                <button
                  onClick={() => {
                    setUserRole('citizen');
                    setCurrentView('intake');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] flex items-center justify-between ${
                    userRole === 'citizen' ? 'bg-[#f2f4f6] text-[#000000] font-semibold' : 'text-[#45464d] hover:bg-[#f7f9fb]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span>Resident Portal</span>
                  </div>
                  {userRole === 'citizen' && <span className="material-symbols-outlined text-[16px] text-[#006a61]">check</span>}
                </button>
                <button
                  onClick={() => {
                    setUserRole('staff');
                    setCurrentView('triage');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] flex items-center justify-between ${
                    userRole === 'staff' ? 'bg-[#f2f4f6] text-[#000000] font-semibold' : 'text-[#45464d] hover:bg-[#f7f9fb]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    <span>City DPW Staff</span>
                  </div>
                  {userRole === 'staff' && <span className="material-symbols-outlined text-[16px] text-[#006a61]">check</span>}
                </button>
              </div>
            )}
          </div>

          {/* Notification Button */}
          <button 
            onClick={onOpenNotifications}
            className="p-2 text-[#45464d] hover:text-[#000000] transition-colors rounded-full hover:bg-[#e6e8ea] relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
            )}
          </button>

          {/* Firebase Authentication / User Avatar */}
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-[#e6e8ea] border border-[#c6c6cd] hover:border-[#000000] transition-all"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#006a61] text-white flex items-center justify-center text-[12px] font-bold">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[12px] font-semibold text-[#191c1e] max-w-[90px] truncate hidden md:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#76777d]">expand_more</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#c6c6cd] p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="pb-3 border-b border-[#e6e8ea]">
                    <div className="font-bold text-[13.5px] text-[#000000]">{currentUser.displayName || 'CivicLink User'}</div>
                    <div className="text-[12px] text-[#76777d] truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[11px] font-semibold text-emerald-700">Firebase Auth Verified</span>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#45464d] hover:bg-[#f7f9fb] flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span>
                      Municipal Account Settings
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#e6e8ea]">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12.5px] text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold bg-white border border-[#c6c6cd] text-[#191c1e] hover:bg-[#f7f9fb] shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
