import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 py-8 transition-all duration-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p className="mb-2">โครงร่างโปรเจคสำหรับนิสิต/นักศึกษา (Graduation Project Template)</p>
        <p>© {new Date().getFullYear()} React + Tailwind CSS v4.0. สงวนลิขสิทธิ์ทั้งหมด.</p>
      </div>
    </footer>
  );
};
