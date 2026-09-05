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
      showToast('🌐', 'เปิดการใช้งานหน้าเว็ปตามปกติเรียบร้อย');
    } else {
      showToast('🚨', 'ปิดการใช้งานหน้าเว็ป: ระบบเข้าสู่โหมดปิดปรับปรุงชั่วคราว');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-200">
          ⚙️ ตั้งค่าส่วนตัวและศูนย์ปฏิบัติการ (System Configuration)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          ตั้งค่าบัญชีความปลอดภัย เปลี่ยนรหัสผ่านความมั่นคง กำหนดค่าเครื่องมือสแกน และควบคุมการเปิด/ปิดหน้าเว็ป
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account profile management */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 border-b border-slate-800/80 pb-2">
            <i className="fa-solid fa-id-card text-cyan-400"></i>
            <span>ข้อมูลบัญชีนักวิเคราะห์ (Analyst Profile)</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                ชื่อประจำตัววิเคราะห์ (Analyst Name ID)
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                บทบาท/ระดับสิทธิการวิเคราะห์ (Privilege Role)
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-300"
              >
                <option value="L1 Security Analyst">L1 Security Analyst</option>
                <option value="L2 Incident Responder">L2 Incident Responder</option>
                <option value="L3 Incident Analyst">L3 Incident Analyst</option>
                <option value="Forensics Lab Director">Forensics Lab Director</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg transition duration-150 cursor-pointer shadow-md"
              >
                บันทึกโปรไฟล์ใหม่
              </button>
            </div>
          </form>
        </div>

        {/* Password manager */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 border-b border-slate-800/80 pb-2">
            <i className="fa-solid fa-key text-amber-400"></i>
            <span>เปลี่ยนรหัสผ่านเพื่อความปลอดภัย (Authentication Security)</span>
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                รหัสผ่านปัจจุบัน
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="รหัสผ่านเข้าศูนย์ปฏิบัติการใหม่..."
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg transition duration-150 cursor-pointer shadow-md"
              >
                อัปเดตรหัสผ่าน
              </button>
            </div>
          </form>
        </div>

        {/* Section: ฟังก์ชั่นเปิด/ปิดการใช้งานหน้าเว็ป (Website Access Control) */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4 md:col-span-2 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <i className="fa-solid fa-power-off text-rose-400"></i>
              <span>ฟังก์ชั่นเปิด/ปิดการใช้งานหน้าเว็ป (Website Access & Maintenance Mode)</span>
            </h3>

            {/* Current Status Pill */}
            <div>
              {websiteStatus.isWebsiteEnabled ? (
                <span className="inline-flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-900/50 text-emerald-400 text-[10px] font-bold font-mono px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>สถานะปัจจุบัน: เปิดใช้งานหน้าเว็ป (ONLINE)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 bg-rose-950/80 border border-rose-900/50 text-rose-400 text-[10px] font-bold font-mono px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                  <span>สถานะปัจจุบัน: ปิดการใช้งานหน้าเว็ป (MAINTENANCE)</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ผู้ดูแลระบบสามารถควบคุมการเปิดหรือปิดการเข้าถึงหน้าเว็ปไซต์ได้ทันที เมื่อปิดการใช้งาน ผู้ใช้ที่เข้ามาจะพบกับหน้าจอแจ้งเตือนปิดปรับปรุงระบบชั่วคราว
          </p>

          <form onSubmit={handleSaveWebsiteStatus} className="space-y-4 pt-1">
            {/* Toggle Switch */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">สวิตช์เปิด/ปิดหน้าเว็ป</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isWebEnabled
                    ? 'เว็ปไซต์เปิดให้บริการแก่ผู้ใช้งานตามปกติ'
                    : 'เว็ปไซต์ถูกระงับการใช้งานและจะแสดงหน้าต่างปิดปรับปรุง'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsWebEnabled(!isWebEnabled)}
                  className={`relative w-12 h-6 rounded-full transition duration-200 shrink-0 cursor-pointer ${
                    isWebEnabled ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                  title="สลับสถานะเปิด/ปิดการใช้งานหน้าเว็ป"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-slate-100 shadow transition duration-200 transform ${
                      isWebEnabled ? 'translate-x-6' : ''
                    }`}
                  ></span>
                </button>
                <span
                  className={`text-xs font-bold uppercase w-16 ${
                    isWebEnabled ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isWebEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>
            </div>

            {/* Custom Announcement Message */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                ข้อความแจ้งเตือนเมื่อปิดปรับปรุง (Maintenance Notice)
              </label>
              <textarea
                value={maintMsg}
                onChange={(e) => setMaintMsg(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg p-3 text-xs text-slate-200 leading-relaxed"
                placeholder="ระบุข้อความเหตุผลการปิดปรับปรุงหรือข้อมูลติดต่อผู้ดูแล..."
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">
                อัปเดตล่าสุด: {websiteStatus.updatedAt}
              </span>
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-lg transition duration-150 cursor-pointer shadow-md"
              >
                <i className="fa-solid fa-floppy-disk mr-1.5"></i> บันทึกการตั้งค่าสถานะหน้าเว็ป
              </button>
            </div>
          </form>
        </div>

        {/* AI Engine setup */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 border-b border-slate-800/80 pb-2">
            <i className="fa-solid fa-robot text-emerald-400"></i>
            <span>การเชื่อมต่อสมองกล AI วิเคราะห์ (AI Cognitive Core)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                ตามโครงสร้างสากล LogHunter สามารถส่งสตรีมข้อมูลไปวิเคราะห์ประมวลความสุ่มเสี่ยงที่{' '}
                <strong className="text-slate-300">Gemini API</strong> ได้โดยตรง หากคุณต้องการใช้งานจริง
                โปรดระบุ API Key ด้านล่างนี้
              </p>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  ตัวจับเวลาจำลองวิเคราะห์ (Simulation Scan Delay)
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="500"
                  value={simDelay}
                  onChange={(e) => setSimDelay(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>รวดเร็ว (0.5 วินาที)</span>
                  <span className="text-cyan-400 font-bold font-mono">
                    ปัจจุบัน: {(simDelay / 1000).toFixed(1)}s
                  </span>
                  <span>เสมือนจริง (3 วินาที)</span>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-3.5 flex items-start space-x-2.5">
                <i className="fa-solid fa-circle-info text-cyan-400 text-xs mt-0.5"></i>
                <div className="text-[10px] text-slate-400 leading-normal">
                  หากปิดตัวเลือก API Key หรือปล่อยว่างไว้ ระบบ LogHunter จะรันชุดข้อมูลสกัดพฤติกรรมผ่าน{' '}
                  <strong className="text-slate-300">Heuristics Local Matcher</strong> ในเบราว์เซอร์โดยอัตโนมัติ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
