import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { Workspace } from './pages/Workspace';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const { isLoggedIn, websiteStatus, toast } = useApp();

  // 1. If website is disabled (Maintenance Mode), show Maintenance Screen
  if (!websiteStatus.isWebsiteEnabled) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <MaintenanceScreen />
        <Toast toast={toast} />
      </div>
    );
  }

  // 2. If website is enabled but analyst is not logged in, show Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <LoginScreen />
        <Toast toast={toast} />
      </div>
    );
  }

  // 3. Main Operational Workspace
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
