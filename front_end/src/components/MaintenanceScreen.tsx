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
      showToast('⚡', 'เปิดการใช้งานหน้าเว็ป LogHunter กลับคืนสู่สถานะปกติเรียบร้อย');
    } else {
      setErrorMsg('รหัสผ่านปลดล็อกไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>

      {/* Floating Particles/glow */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 p-8 rounded-2xl shadow-2xl shadow-rose-950/40 relative z-10 text-center fade-in">
        {/* Warning Icon */}
        <div className="inline-flex p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-400 mb-4 animate-pulse">
          <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
        </div>

        {/* Status Tag */}
        <div className="mb-3">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-900/50 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>SYSTEM OFFLINE / UNDER MAINTENANCE</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-wide text-slate-100 mb-2">
          ระบบปิดการใช้งานหน้าเว็ปชั่วคราว
        </h1>
        <p className="text-xs text-rose-400 font-medium mb-4">
          ศูนย์ปฏิบัติการ LogHunter อยู่ระหว่างระงับการให้บริการ
        </p>

        {/* Custom Maintenance Message Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left mb-6 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider flex items-center justify-between">
            <span><i className="fa-solid fa-bullhorn text-amber-400 mr-1.5"></i>ข้อความประกาศจากผู้ดูแลระบบ</span>
            <span>{websiteStatus.updatedAt}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {websiteStatus.maintenanceMessage || 'ระบบกำลังอยู่ระหว่างปรับปรุงประสิทธิภาพและความมั่นคงปลอดภัย หรือถูกระงับการใช้งานชั่วคราวโดยผู้ดูแลระบบ'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowAdminModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition duration-150 flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-key text-xs"></i>
            <span>ปลดล็อกสำหรับผู้ดูแลระบบ (Admin Access)</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
          LogHunter Windows Event Incident Response Platform • v2.0
        </div>
      </div>

      {/* Admin Unlock Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <div className="text-center mb-4">
              <div className="inline-flex p-2.5 bg-cyan-950 border border-cyan-500/30 rounded-xl text-cyan-400 mb-2">
                <i className="fa-solid fa-lock-open text-xl"></i>
              </div>
              <h3 className="text-sm font-bold text-slate-100">เปิดการใช้งานระบบกลับคืน (Enable Website)</h3>
              <p className="text-[11px] text-slate-400 mt-1">กรอกรหัสผ่านเพื่อเปิดใช้งานหน้าเว็ปทันที (Demo: security101)</p>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => {
                    setAdminPass(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="กรอกรหัสผ่านความปลอดภัย..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg py-2 px-3 text-xs text-slate-200"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs py-2 rounded-lg transition"
                >
                  ยืนยันเปิดใช้งานเว็ป
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setErrorMsg('');
                    setAdminPass('');
                  }}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg transition"
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
