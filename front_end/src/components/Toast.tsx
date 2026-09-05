import type { ToastMessage } from '../types/forensic';

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 border border-cyan-500/30 text-slate-100 text-xs px-4 py-3 rounded-xl shadow-2xl transition duration-300 transform translate-y-0 opacity-100 z-50 flex items-center space-x-2.5 neon-glow-cyan fade-in">
      <span className="text-cyan-400 text-sm">{toast.icon}</span>
      <span className="font-medium">{toast.message}</span>
    </div>
  );
};
