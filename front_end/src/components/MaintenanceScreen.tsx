import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const MaintenanceScreen: React.FC = () => {
  const { websiteStatus, toggleWebsiteStatus, showToast } = useApp();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin unlock password matches security101 or admin
    if (adminPass === 'security101' || adminPass === 'admin') {
      toggleWebsiteStatus(true, '');
      setShowAdminModal(false);
      showToast('⚡', 'เปิดใช้งานเว็ปไซต์เรียบร้อย');
    } else {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-base bg-gradient-mesh bg-grid relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb orb-teal w-[350px] h-[350px] top-10 -right-20 opacity-60" />
      <div className="orb orb-purple w-[400px] h-[400px] -bottom-32 -left-32 opacity-50" />

      <div className="w-full max-w-md relative z-10 slide-up">
        <div className="glass-strong rounded-2xl p-8 text-center glow-red">
          {/* Warning Icon */}
          <div className="inline-flex p-4 bg-red-500/10 border border-red-500/15 rounded-2xl text-red-400 mb-5 float">
            <i className="fa-solid fa-triangle-exclamation text-3xl" />
          </div>

          {/* Status */}
          <div className="mb-4">
            <span className="inline-flex items-center space-x-2 text-red-400 text-[11px] font-medium code-font bg-red-500/8 px-3 py-1.5 rounded-lg border border-red-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
              <span>SYSTEM OFFLINE</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            ระบบปิดชั่วคราว
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            LogHunter อยู่ระหว่างปิดปรับปรุง
          </p>

          {/* Maintenance Message */}
          <div className="bg-surface-sunken/80 border border-border-default rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="text-[10px] text-slate-600 code-font flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-amber-500/10 flex items-center justify-center">
                  <i className="fa-solid fa-bullhorn text-amber-400 text-[7px]" />
                </div>
                <span>ข้อความจากผู้ดูแล</span>
              </span>
              <span>{websiteStatus.updatedAt}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {websiteStatus.maintenanceMessage || 'ระบบกำลังปรับปรุงประสิทธิภาพ หรือถูกระงับชั่วคราวโดยผู้ดูแลระบบ'}
            </p>
          </div>

          {/* Unlock Button */}
          <button
            onClick={() => setShowAdminModal(true)}
            className="w-full sm:w-auto px-6 py-3 btn-primary text-white font-medium text-xs rounded-xl cursor-pointer"
          >
            <i className="fa-solid fa-key mr-2" />
            ปลดล็อกสำหรับผู้ดูแล
          </button>

          <div className="mt-6 pt-4 border-t border-border-default/30 text-[10px] text-slate-600 code-font flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-br from-teal-600 to-teal-800 rounded flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-white text-[5px]" />
            </div>
            <span>LogHunter v2.0</span>
          </div>
        </div>
      </div>

      {/* Admin Unlock Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 fade-in">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-xs shadow-glow slide-up">
            <div className="text-center mb-4">
              <div className="inline-flex p-3 bg-teal-500/10 border border-teal-500/15 rounded-xl text-teal-400 mb-3 glow-teal-sm">
                <i className="fa-solid fa-lock-open text-xl" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">เปิดใช้งานเว็ปไซต์</h3>
              <p className="text-[11px] text-slate-500 mt-1">กรอกรหัสผ่าน (Demo: security101)</p>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-red-500/8 border border-red-500/15 text-red-400 text-xs rounded-lg text-center fade-in">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                value={adminPass}
                onChange={(e) => {
                  setAdminPass(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="รหัสผ่าน..."
                className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/50 focus:outline-none rounded-xl py-2.5 px-3.5 text-xs text-slate-200 transition-all duration-200 input-glow"
                autoFocus
              />

              <div className="flex gap-2.5">
                <button
                  type="submit"
                  className="flex-1 btn-primary text-white font-medium text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  ยืนยัน
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setErrorMsg('');
                    setAdminPass('');
                  }}
                  className="px-4 bg-surface-overlay hover:bg-border-subtle text-slate-300 text-xs py-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-border-default"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
