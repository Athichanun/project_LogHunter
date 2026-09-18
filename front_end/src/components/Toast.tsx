import type { ToastMessage } from '../types/forensic';

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 glass-strong rounded-xl shadow-glow z-50 flex items-center space-x-2.5 slide-in-right max-w-sm overflow-hidden">
      <div className="flex items-center space-x-2.5 px-4 py-3">
        <span className="text-sm shrink-0">{toast.icon}</span>
        <span className="text-xs font-medium leading-snug text-slate-200">{toast.message}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 progress-bar" />
    </div>
  );
};
