import type { FC, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard: FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`glass rounded-xl p-5 card-hover ${className}`}>
      {children}
    </div>
  );
};
