import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="gradient-border-top bg-surface-raised/50 py-6 mt-auto backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-2 mb-1.5">
          <div className="w-4 h-4 bg-gradient-to-br from-teal-600 to-teal-800 rounded flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-white text-[7px]" />
          </div>
          <span className="font-medium text-slate-400 text-[11px]">LogHunter</span>
        </div>
        <p className="mb-0.5 text-[11px]">โครงร่างโปรเจคสำหรับนิสิต/นักศึกษา (Graduation Project)</p>
        <p className="text-[11px]">© {new Date().getFullYear()} LogHunter. สงวนลิขสิทธิ์ทั้งหมด.</p>
      </div>
    </footer>
  );
};
