import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { login, credentials } = useApp();
  const [username, setUsername] = useState('analyst_bonus');
  const [password, setPassword] = useState('security101');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username.trim(), password.trim());
    if (!success) {
      setErrorMsg('Analyst ID หรือรหัสผ่านความปลอดภัยไม่ถูกต้อง');
    } else {
      setErrorMsg('');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 min-h-screen overflow-hidden">
      {/* Cyber grid background animation effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-cyan-950/80 border border-cyan-500/30 rounded-xl text-cyan-400 mb-3 animate-pulse">
            <i className="fa-solid fa-shield-halved text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-cyan-400">LOGHUNTER</h1>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Windows Event Incident Response Platform
          </p>
        </div>

        {/* Login Feedback Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-lg text-xs flex items-center space-x-2 fade-in">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              ชื่อผู้ใช้งาน (Analyst ID)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <i className="fa-solid fa-user-shield text-xs"></i>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                required
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-200"
                placeholder="กรอกรหัสประจำตัวนักวิเคราะห์..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              รหัสผ่านส่วนบุคคล
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <i className="fa-solid fa-key text-xs"></i>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                required
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-200"
                placeholder="กรอกรหัสผ่านเข้าระบบ..."
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold py-2.5 rounded-lg transition duration-150 shadow-lg shadow-cyan-950/30 text-sm cursor-pointer"
            >
              <i className="fa-solid fa-unlock-keyhole mr-1.5"></i> เข้าสู่ศูนย์ปฏิบัติการ
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest bg-slate-950/50 border border-slate-800 px-2.5 py-1 rounded">
            Demo Mode: {credentials.username} / {credentials.password}
          </span>
        </div>
      </div>
    </div>
  );
};
