import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AnalystCredentials,
  ForensicCase,
  WebsiteStatus,
  ToastMessage,
} from '../types/forensic';

interface AppContextType {
  // Auth & Profile
  isLoggedIn: boolean;
  credentials: AnalystCredentials;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (username: string, role: string) => void;
  updatePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };

  // Tab Navigation
  activeTab: 'home' | 'history' | 'settings';
  setActiveTab: (tab: 'home' | 'history' | 'settings') => void;

  // History & Cases
  history: ForensicCase[];
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  addCase: (caseItem: Omit<ForensicCase, 'id' | 'timestamp'>) => string;
  renameCase: (id: string, newTitle: string) => void;
  deleteCase: (id: string) => void;

  // Website Status / Maintenance Control (ฟังก์ชั่นเปิดปิดการใช้งานหน้าเว็ป)
  websiteStatus: WebsiteStatus;
  toggleWebsiteStatus: (enabled: boolean, message?: string) => void;

  // AI & Sim Settings
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  simDelay: number;
  setSimDelay: (delay: number) => void;

  // Toast
  toast: ToastMessage | null;
  showToast: (icon: string, message: string, duration?: number) => void;
}

const DEFAULT_CREDENTIALS: AnalystCredentials = {
  username: 'analyst_bonus',
  password: 'security101',
  role: 'L3 Incident Analyst',
};

const DEFAULT_WEBSITE_STATUS: WebsiteStatus = {
  isWebsiteEnabled: true,
  maintenanceMessage: 'ระบบกำลังอยู่ระหว่างปรับปรุงประสิทธิภาพและความมั่นคงปลอดภัยชั่วคราว',
  updatedAt: new Date().toLocaleString('th-TH'),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Credentials
  const [credentials, setCredentials] = useState<AnalystCredentials>(() => {
    try {
      const saved = localStorage.getItem('loghunter_analyst_profile');
      return saved ? JSON.parse(saved) : DEFAULT_CREDENTIALS;
    } catch {
      return DEFAULT_CREDENTIALS;
    }
  });

  // Session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return !!sessionStorage.getItem('loghunter_session_active');
    } catch {
      return false;
    }
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings'>('home');

  // Forensic Cases History
  const [history, setHistory] = useState<ForensicCase[]>(() => {
    try {
      const saved = localStorage.getItem('loghunter_forensic_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Website Status (Website enable/disable toggle)
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>(() => {
    try {
      const saved = localStorage.getItem('loghunter_website_status');
      return saved ? JSON.parse(saved) : DEFAULT_WEBSITE_STATUS;
    } catch {
      return DEFAULT_WEBSITE_STATUS;
    }
  });

  // Settings: Gemini API & Simulation speed
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [simDelay, setSimDelay] = useState<number>(1200);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (icon: string, message: string, duration = 3000) => {
    const id = Date.now();
    setToast({ id, icon, message });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, duration);
  };

  const login = (username: string, password: string): boolean => {
    if (username === credentials.username && password === credentials.password) {
      setIsLoggedIn(true);
      try {
        sessionStorage.setItem('loghunter_session_active', username);
      } catch {
        // ignore storage error
      }
      showToast('🛡️', 'เข้าสู่ระบบศูนย์ปฏิบัติการพยานหลักฐานดิจิทัลสำเร็จ');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    try {
      sessionStorage.removeItem('loghunter_session_active');
    } catch {
      // ignore
    }
    showToast('🚪', 'ออกจากขอบเขตความปลอดภัยเรียบร้อย');
  };

  const updateProfile = (username: string, role: string) => {
    const updated = { ...credentials, username, role };
    setCredentials(updated);
    try {
      localStorage.setItem('loghunter_analyst_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('🛡️', 'อัปเดตข้อมูลนักวิเคราะห์ส่วนบุคคลเสร็จสิ้น');
  };

  const updatePassword = (oldPass: string, newPass: string) => {
    if (oldPass !== credentials.password) {
      return { success: false, message: 'รหัสผ่านเดิมที่ระบุไม่ถูกต้อง ระบบปฏิเสธคำขอแก้ไข' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'รหัสผ่านความปลอดภัยใหม่ต้องมีความยาวอย่างน้อย 6 หลัก' };
    }

    const updated = { ...credentials, password: newPass };
    setCredentials(updated);
    try {
      localStorage.setItem('loghunter_analyst_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('🔐', 'เปลี่ยนรหัสเข้าศูนย์ปฏิบัติการความมั่นคงสำเร็จแล้ว');
    return { success: true, message: 'สำเร็จ' };
  };

  const addCase = (caseItem: Omit<ForensicCase, 'id' | 'timestamp'>): string => {
    const caseId = `case-${Date.now()}`;
    const timestamp = new Date().toLocaleString('th-TH');
    const newRecord: ForensicCase = {
      ...caseItem,
      id: caseId,
      timestamp,
      analyst: credentials.username,
    };

    const updated = [newRecord, ...history];
    setHistory(updated);
    try {
      localStorage.setItem('loghunter_forensic_history', JSON.stringify(updated));
    } catch {
      // ignore
    }
    return caseId;
  };

  const renameCase = (id: string, newTitle: string) => {
    const updated = history.map((item) =>
      item.id === id ? { ...item, title: newTitle.trim() } : item
    );
    setHistory(updated);
    try {
      localStorage.setItem('loghunter_forensic_history', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('✏️', 'เปลี่ยนชื่อเคสเรียบร้อย');
  };

  const deleteCase = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    if (selectedCaseId === id) {
      setSelectedCaseId(null);
    }
    try {
      localStorage.setItem('loghunter_forensic_history', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('🗑️', 'ลบประวัติเคสเรียบร้อย');
  };

  // Toggle website status function (เปิด/ปิดการใช้งานหน้าเว็ป)
  const toggleWebsiteStatus = (enabled: boolean, message?: string) => {
    const updated: WebsiteStatus = {
      isWebsiteEnabled: enabled,
      maintenanceMessage: message ?? websiteStatus.maintenanceMessage,
      updatedAt: new Date().toLocaleString('th-TH'),
    };
    setWebsiteStatus(updated);
    try {
      localStorage.setItem('loghunter_website_status', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        credentials,
        login,
        logout,
        updateProfile,
        updatePassword,
        activeTab,
        setActiveTab,
        history,
        selectedCaseId,
        setSelectedCaseId,
        addCase,
        renameCase,
        deleteCase,
        websiteStatus,
        toggleWebsiteStatus,
        geminiApiKey,
        setGeminiApiKey,
        simDelay,
        setSimDelay,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
