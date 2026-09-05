export interface WhyReason {
  title: string;
  desc: string;
}

export interface AnalysisResult {
  severity: string;
  score: number;
  title: string;
  mitre: string[];
  mitigation: string;
  abstract: string;
  why: WhyReason[];
}

export interface PresetItem {
  id: string;
  label: string;
  fileName: string;
  badge: string;
  tag: string;
  binary: boolean;
  icon: string;
  colorClass: string;
  rawText: string;
  analysis: AnalysisResult;
}

export interface ForensicCase {
  id: string;
  fileName: string;
  timestamp: string;
  analyst: string;
  severity: string;
  score: number;
  title: string;
  mitre: string[];
  mitigation: string;
  abstract: string;
  why: WhyReason[];
  sourceLog: string;
}

export interface AnalystCredentials {
  username: string;
  password: string;
  role: string;
}

export interface WebsiteStatus {
  isWebsiteEnabled: boolean;
  maintenanceMessage: string;
  updatedAt: string;
}

export interface ToastMessage {
  id: number;
  icon: string;
  message: string;
}
