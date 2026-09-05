import type { FC, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard: FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl hover:border-white/20 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};
