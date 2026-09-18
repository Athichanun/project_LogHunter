import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SettingsTab: React.FC = () => {
  const {
    credentials,
    updateProfile,
    updatePassword,
    geminiApiKey,
    setGeminiApiKey,
    simDelay,
    setSimDelay,
    websiteStatus,
    toggleWebsiteStatus,
    showToast,
  } = useApp();

  // Profile Form State
  const [usernameInput, setUsernameInput] = useState(credentials.username);
  const [roleInput, setRoleInput] = useState(credentials.role);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Website Status / Maintenance Form State
  const [isWebEnabled, setIsWebEnabled] = useState(websiteStatus.isWebsiteEnabled);
  const [maintMsg, setMaintMsg] = useState(websiteStatus.maintenanceMessage);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      updateProfile(usernameInput.trim(), roleInput);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updatePassword(oldPassword, newPassword);
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
    } else {
      showToast('❌', res.message);
    }
  };

  const handleSaveWebsiteStatus = (e: React.FormEvent) => {
    e.preventDefault();
    toggleWebsiteStatus(isWebEnabled, maintMsg.trim());
    if (isWebEnabled) {
      showToast('🌐', 'เปิดใช้งานเว็ปไซต์เรียบร้อย');
    } else {
      showToast('🚨', 'ปิดเว็ปไซต์ — เข้าสู่โหมดปิดปรับปรุง');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4">
        <div className="flex items-center space-x-3 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <i className="fa-solid fa-sliders text-teal-400 text-xs" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              ตั้งค่าระบบ
            </h2>
            <p className="text-xs text-slate-500">
              จัดการบัญชี, รหัสผ่าน, AI Engine, และสถานะเว็ปไซต์
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-teal-500/20 via-border-default to-transparent mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account Profile */}
        <div className="glass rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2.5 border-b border-border-default/50 pb-3">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <i className="fa-solid fa-id-card text-teal-400 text-[10px]" />
            </div>
            <span>ข้อมูลนักวิเคราะห์</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/50 focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-slate-200 transition-all duration-200 input-glow"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                บทบาท
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/50 focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-slate-300 transition-all duration-200 input-glow"
              >
                <option value="L1 Security Analyst">L1 Security Analyst</option>
                <option value="L2 Incident Responder">L2 Incident Responder</option>
                <option value="L3 Incident Analyst">L3 Incident Analyst</option>
                <option value="Forensics Lab Director">Forensics Lab Director</option>
              </select>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="btn-primary text-white font-medium text-xs py-2.5 px-5 rounded-xl cursor-pointer"
              >
                บันทึกโปรไฟล์
              </button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="glass rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2.5 border-b border-border-default/50 pb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <i className="fa-solid fa-key text-amber-400 text-[10px]" />
            </div>
            <span>เปลี่ยนรหัสผ่าน</span>
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                รหัสผ่านปัจจุบัน
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/50 focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-slate-200 transition-all duration-200 input-glow"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="รหัสผ่านใหม่..."
                required
                className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/50 focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-slate-200 transition-all duration-200 input-glow"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs py-2.5 px-5 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
              >
                อัปเดตรหัสผ่าน
              </button>
            </div>
          </form>
        </div>

        {/* Website Access Control */}
        <div className="glass rounded-xl p-6 space-y-5 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-default/50 pb-3 gap-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <i className="fa-solid fa-power-off text-red-400 text-[10px]" />
              </div>
              <span>สถานะเว็ปไซต์</span>
            </h3>

            {websiteStatus.isWebsiteEnabled ? (
              <span className="inline-flex items-center space-x-2 text-emerald-400 text-[11px] font-medium bg-emerald-500/8 px-3 py-1.5 rounded-lg border border-emerald-500/15">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                <span>Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-2 text-red-400 text-[11px] font-medium bg-red-500/8 px-3 py-1.5 rounded-lg border border-red-500/15">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
                <span>Maintenance</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            ควบคุมการเปิด/ปิดหน้าเว็ป เมื่อปิดผู้ใช้จะเห็นหน้าจอปิดปรับปรุง
          </p>

          <form onSubmit={handleSaveWebsiteStatus} className="space-y-4 pt-1">
            {/* Toggle */}
            <div className="bg-surface-sunken/80 border border-border-default p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-medium text-slate-200">เปิด/ปิดเว็ปไซต์</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isWebEnabled ? 'เว็ปเปิดให้บริการปกติ' : 'เว็ปถูกระงับชั่วคราว'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsWebEnabled(!isWebEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                    isWebEnabled ? 'bg-emerald-600 glow-teal-sm' : 'bg-red-600 glow-red'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 transform ${
                      isWebEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
                <span className={`text-xs font-medium w-14 ${isWebEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isWebEnabled ? 'เปิด' : 'ปิด'}
                </span>
              </div>
            </div>

            {/* Maintenance Message */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                ข้อความแจ้งเตือนเมื่อปิดปรับปรุง
              </label>
              <textarea
                value={maintMsg}
                onChange={(e) => setMaintMsg(e.target.value)}
                rows={2}
                className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/50 focus:outline-none rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed transition-all duration-200 input-glow"
                placeholder="ข้อความหรือเหตุผลการปิดปรับปรุง..."
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-600">
                อัปเดตล่าสุด: {websiteStatus.updatedAt}
              </span>
              <button
                type="submit"
                className="btn-primary text-white font-medium text-xs py-2.5 px-6 rounded-xl cursor-pointer"
              >
                <i className="fa-solid fa-floppy-disk mr-1.5" /> บันทึก
              </button>
            </div>
          </form>
        </div>

        {/* AI Engine */}
        <div className="glass rounded-xl p-6 space-y-5 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2.5 border-b border-border-default/50 pb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <i className="fa-solid fa-robot text-emerald-400 text-[10px]" />
            </div>
            <span>AI Engine Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                LogHunter สามารถส่งข้อมูลไปวิเคราะห์กับ <strong className="text-slate-300">Gemini API</strong> ได้
                หากต้องการใช้งาน ระบุ API Key ด้านล่าง
              </p>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/50 focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-slate-200 code-font transition-all duration-200 input-glow"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">
                  Simulation Delay
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="500"
                  value={simDelay}
                  onChange={(e) => setSimDelay(parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>0.5s</span>
                  <span className="text-teal-400 code-font font-medium bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/15">
                    {(simDelay / 1000).toFixed(1)}s
                  </span>
                  <span>3.0s</span>
                </div>
              </div>

              <div className="bg-surface-sunken/80 border border-border-default rounded-xl p-4 flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-md bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="fa-solid fa-circle-info text-teal-400 text-[9px]" />
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  หากไม่ระบุ API Key ระบบจะรันด้วย <strong className="text-slate-400">Heuristics Local Matcher</strong> ในเบราว์เซอร์อัตโนมัติ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
