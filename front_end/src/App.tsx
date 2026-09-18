import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { Workspace } from './pages/Workspace';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { isLoggedIn, websiteStatus, toast } = useApp();

  if (!websiteStatus.isWebsiteEnabled) {
    return (
      <div className="min-h-screen bg-surface-base text-slate-200 flex flex-col">
        <MaintenanceScreen />
        <Toast toast={toast} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface-base text-slate-200 flex flex-col">
        <LoginScreen />
        <Toast toast={toast} />
      </div>
    );
  }

  return <Workspace />;
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
