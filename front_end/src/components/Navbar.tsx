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

  const getSubTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'ศูนย์ปฏิบัติการนำเข้าพยานหลักฐาน';
      case 'history':
        return 'ฐานข้อมูลนิติวิทยาศาสตร์และแผงรายงานเหตุการณ์';
      case 'settings':
        return 'ตั้งค่าโครงข่ายและระบบความมั่นคงนักวิเคราะห์';
      default:
        return 'ศูนย์ปฏิบัติการนำเข้าพยานหลักฐาน';
    }
  };

  return (
    <div className="shrink-0">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-cyan-950 border border-cyan-500/20 text-cyan-400 rounded-lg text-xs shadow-md">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-widest text-slate-200">LOGHUNTER</h1>
            <p className="text-[9px] text-cyan-500 uppercase tracking-wider">Forensic Suite v2.0</p>
          </div>
        </div>

        {/* Horizontal Tab Menu List */}
        <nav className="flex items-center space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
          {/* Home Tab */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'home'
                ? 'text-cyan-400 bg-slate-950/50 border border-cyan-500/20 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-terminal text-[10px]"></i>
            <span>หน้าแรก (Ingest Log)</span>
          </button>

          {/* History Tab */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'history'
                ? 'text-cyan-400 bg-slate-950/50 border border-cyan-500/20 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-box-archive text-[10px]"></i>
            <span>ประวัติการวิเคราะห์</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                activeTab === 'history'
                  ? 'bg-cyan-950/40 border border-cyan-500/20 text-cyan-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-300'
              }`}
            >
              {history.length}
            </span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
              activeTab === 'settings'
                ? 'text-cyan-400 bg-slate-950/50 border border-cyan-500/20 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-sliders text-[10px]"></i>
            <span>ตั้งค่าระบบ (Settings)</span>
          </button>
        </nav>

        {/* Active Analyst Info & Indicators */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          {/* Website Active Status Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px]">
            <span className="text-slate-500">สถานะเว็ป:</span>
            {websiteStatus.isWebsiteEnabled ? (
              <span className="text-emerald-400 font-bold font-mono text-[9px] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>ONLINE</span>
              </span>
            ) : (
              <span className="text-rose-400 font-bold font-mono text-[9px] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block animate-pulse"></span>
                <span>MAINTENANCE</span>
              </span>
            )}
          </div>

          {/* Gemini Mode Indicator */}
          <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px]">
            <span className="text-slate-500">Gemini:</span>
            <span
              className={`uppercase tracking-wider font-mono font-bold text-[8px] ${
                geminiApiKey ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {geminiApiKey ? 'LIVE GEMINI MODEL ACTIVE' : 'OFFLINE MODEL'}
            </span>
          </div>

          {/* Analyst User Identity */}
          <div className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800/60 px-2 py-1 rounded-lg">
            <div className="w-6.5 h-6.5 rounded bg-gradient-to-br from-cyan-900 to-blue-900 text-cyan-400 flex items-center justify-center text-[10px] font-bold border border-cyan-500/20 p-1">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div className="text-[9px] text-left hidden sm:block">
              <p className="font-bold text-slate-300 truncate max-w-[100px]">{credentials.username}</p>
              <p className="text-slate-500 uppercase tracking-widest text-[7px] truncate max-w-[100px]">
                {credentials.role}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-rose-400 transition p-1.5 hover:bg-slate-900 rounded"
            title="ออกจากระบบ"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      {/* Sub Status Header Bar */}
      <div className="bg-slate-900/20 border-b border-slate-800/80 px-6 py-2 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {getSubTitle()}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 font-mono">LOGHUNTER WEB HUB</span>
      </div>
    </div>
  );
};
