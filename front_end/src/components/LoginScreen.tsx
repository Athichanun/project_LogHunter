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
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-surface-base bg-gradient-mesh bg-grid relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb orb-teal w-[400px] h-[400px] -top-32 -left-32" />
      <div className="orb orb-purple w-[300px] h-[300px] bottom-20 -right-20" />
      <div className="orb orb-blue w-[250px] h-[250px] bottom-[-60px] left-1/3" />

      <div className="w-full max-w-sm relative z-10 slide-up">
        <div className="glass-strong rounded-2xl p-8 glow-teal-sm">
          {/* Brand */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg glow-teal-sm">
                <i className="fa-solid fa-shield-halved text-white text-sm" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 tracking-wide">LogHunter</h1>
                <p className="text-[11px] text-slate-500">Forensic Analysis Platform</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 p-3 bg-red-500/8 border border-red-500/15 text-red-400 rounded-lg text-xs flex items-center space-x-2 fade-in glow-red">
              <i className="fa-solid fa-circle-xmark text-[11px]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <i className="fa-solid fa-user text-xs" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/60 focus:outline-none rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 transition duration-200 input-glow"
                  placeholder="Analyst ID..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">
                รหัสผ่าน
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <i className="fa-solid fa-lock text-xs" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/60 focus:outline-none rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 transition duration-200 input-glow"
                  placeholder="Password..."
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full btn-primary text-white font-semibold py-3 rounded-xl text-sm cursor-pointer"
              >
                <i className="fa-solid fa-arrow-right-to-bracket mr-2" />
                เข้าสู่ระบบ
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-border-default/50 text-center">
            <span className="text-[11px] text-slate-500">
              Demo: <span className="text-slate-400 code-font">{credentials.username}</span> / <span className="text-slate-400 code-font">{credentials.password}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
