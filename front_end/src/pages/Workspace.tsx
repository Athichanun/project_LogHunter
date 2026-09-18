import React from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { HomeTab } from '../components/HomeTab';
import { HistoryTab } from '../components/HistoryTab';
import { SettingsTab } from '../components/SettingsTab';
import { Toast } from '../components/Toast';

export const Workspace: React.FC = () => {
  const { activeTab, toast } = useApp();

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-surface-base bg-gradient-radial text-slate-200">
      <Navbar />

      <section className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="max-w-7xl mx-auto w-full fade-in">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </section>

      <Toast toast={toast} />
    </div>
  );
};
