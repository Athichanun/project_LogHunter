import React from 'react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    history,
    credentials,
    logout,
    geminiApiKey,
    websiteStatus,
  } = useApp();

  type TabKey = 'home' | 'history' | 'settings';
  const tabs: { key: TabKey; label: string; icon: string; badge?: number }[] = [
    { key: 'home', label: 'นำเข้าล็อก', icon: 'fa-terminal' },
    { key: 'history', label: 'ประวัติวิเคราะห์', icon: 'fa-box-archive', badge: history.length },
    { key: 'settings', label: 'ตั้งค่า', icon: 'fa-sliders' },
  ];

  return (
    <header className="glass-strong border-b border-white/[0.04] shrink-0 sticky top-0 z-40">
      <div className="flex items-center justify-between px-5 h-14">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center glow-teal-sm">
            <i className="fa-solid fa-shield-halved text-white text-xs" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-100 tracking-wide">LogHunter</span>
            <span className="text-[9px] text-slate-600 font-mono bg-surface-overlay px-1.5 py-0.5 rounded-md border border-border-default hidden sm:inline">v2.0</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center h-full space-x-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center space-x-2 px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer rounded-lg ${
                  isActive
                    ? 'text-teal-300 bg-teal-500/10 border border-teal-500/20 glow-teal-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-[10px]`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-teal-500/15 text-teal-300 text-[9px] font-mono px-1.5 py-0.5 rounded-md ml-0.5 border border-teal-500/20">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Status indicators */}
          <div className="hidden lg:flex items-center space-x-3 text-[11px]">
            {websiteStatus.isWebsiteEnabled ? (
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                <span className="font-mono text-[10px]">Online</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
                <span className="font-mono text-[10px]">Offline</span>
              </span>
            )}
            <span className="w-px h-4 bg-border-default" />
            <span className={`font-mono text-[10px] ${geminiApiKey ? 'text-emerald-400' : 'text-slate-500'}`}>
              {geminiApiKey ? '✦ Gemini Active' : 'Local Mode'}
            </span>
          </div>

          <div className="w-px h-5 bg-border-default hidden md:block" />

          {/* User */}
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-surface-overlay to-surface-sunken text-slate-300 flex items-center justify-center text-[10px] border border-border-default">
              <i className="fa-solid fa-user" />
            </div>
            <div className="text-[11px] text-left hidden sm:block">
              <p className="font-medium text-slate-300 truncate max-w-[100px]">{credentials.username}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-red-400 transition-all duration-200 p-1.5 cursor-pointer hover:bg-red-500/8 rounded-lg"
            title="ออกจากระบบ"
          >
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </div>
    </header>
  );
};
