import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LOG_PRESETS } from '../data/presets';
import type { PresetItem, AnalysisResult } from '../types/forensic';

export const HomeTab: React.FC = () => {
  const {
    addCase,
    setActiveTab,
    setSelectedCaseId,
    showToast,
    geminiApiKey,
    simDelay,
  } = useApp();

  const [currentPreset, setCurrentPreset] = useState<PresetItem | null>(null);
  const [hasConverted, setHasConverted] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [originalLogText, setOriginalLogText] = useState('');
  const [logText, setLogText] = useState('');
  const [privacyMaskOn, setPrivacyMaskOn] = useState(false);

  // Analyzing overlay state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState<number>(1);

  // Mask IPv4 and Windows SID
  const maskSensitiveData = (text: string): string => {
    if (!text) return text;
    let masked = text;
    masked = masked.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[REDACTED-IP]');
    masked = masked.replace(/S-1-\d+(?:-\d+){1,}/g, '[REDACTED-SID]');
    return masked;
  };

  const handleSelectPreset = (key: string) => {
    const preset = LOG_PRESETS[key];
    if (!preset) return;

    setCurrentPreset(preset);
    setOriginalLogText(preset.rawText);

    if (privacyMaskOn) {
      setLogText(maskSensitiveData(preset.rawText));
    } else {
      setLogText(preset.rawText);
    }

    if (preset.binary) {
      setHasConverted(false);
      showToast('⚠️', "ตรวจพบไฟล์ไบนารี .evtx — ต้องแปลงไฟล์ก่อนวิเคราะห์");
    } else {
      setHasConverted(true);
      showToast('📄', 'นำเข้า XML สำเร็จ');
    }
  };

  const handleTriggerConvert = () => {
    if (!currentPreset) return;
    setIsConverting(true);

    setTimeout(() => {
      setIsConverting(false);
      setHasConverted(true);
      const xmlText = currentPreset.rawText;
      setOriginalLogText(xmlText);
      setLogText(privacyMaskOn ? maskSensitiveData(xmlText) : xmlText);
      showToast('⚙️', `แปลง ${currentPreset.fileName} → XML สำเร็จ`);
    }, 1000);
  };

  const handleResetImport = () => {
    setCurrentPreset(null);
    setHasConverted(false);
    setIsConverting(false);
    setOriginalLogText('');
    setLogText('');
  };

  const handleTogglePrivacyMask = () => {
    const nextState = !privacyMaskOn;
    setPrivacyMaskOn(nextState);

    if (nextState) {
      setOriginalLogText(logText);
      setLogText(maskSensitiveData(logText));
      showToast('🕶️', 'เปิด Privacy Mask: ปกปิด IP / SID');
    } else {
      setLogText(originalLogText);
      showToast('👁️', 'ปิด Privacy Mask');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLogText(val);
    if (!privacyMaskOn) {
      setOriginalLogText(val);
    }
  };

  // Rule match engine
  const executeOfflineRuleMatch = (rawLog: string) => {
    let report: AnalysisResult = LOG_PRESETS.rdp.analysis;
    let fileName = currentPreset ? currentPreset.fileName : 'custom_event_log.xml';

    if (rawLog.includes('powershell') || (rawLog.includes('Sysmon') && rawLog.includes('1'))) {
      report = LOG_PRESETS.powershell.analysis;
      fileName = currentPreset ? currentPreset.fileName : 'sysmon_powershell_obfuscated.xml';
    } else if (rawLog.includes('1102') || rawLog.includes('LogFileCleared')) {
      report = LOG_PRESETS.clear.analysis;
      fileName = currentPreset ? currentPreset.fileName : 'security_audit_cleared.xml';
    } else if (
      rawLog.includes('vssadmin') ||
      rawLog.includes('shadows') ||
      rawLog.includes('lockbit')
    ) {
      report = LOG_PRESETS.ransomware.analysis;
      fileName = currentPreset ? currentPreset.fileName : 'sysmon_ransomware_vss.xml';
    } else if (
      rawLog.includes('lsass.exe') ||
      rawLog.includes('0x1F10DD') ||
      rawLog.includes('comsvcs')
    ) {
      report = LOG_PRESETS.lsass.analysis;
      fileName = currentPreset ? currentPreset.fileName : 'sysmon_lsass_dump.xml';
    }

    const newCaseId = addCase({
      fileName: fileName.replace('.evtx', '.xml'),
      severity: report.severity,
      score: report.score,
      title: report.title,
      mitre: report.mitre,
      mitigation: report.mitigation,
      abstract: report.abstract,
      why: report.why,
      sourceLog: rawLog,
      analyst: '',
    });

    setIsAnalyzing(false);
    setActiveTab('history');
    setSelectedCaseId(newCaseId);
    showToast('📊', 'สแกนเสร็จสิ้น — ดูรายงานได้ที่ประวัติวิเคราะห์');
  };

  // Live Gemini Analysis API call if key is given
  const executeLiveGemini = async (key: string, log: string) => {
    const systemPrompt =
      'You are an expert Windows Incident Response system. You must analyze the Windows Event Log and return a JSON containing: severity, score (number 1-100), title, mitre (array of techniques), mitigation, abstract, and why (array of objects containing: title, desc). Response must be in Thai.';
    const userPrompt = `โปรดสืบสวนข้อมูลล็อก Windows ด้านล่างนี้และพ่นผลลัพธ์เป็นรูปแบบ JSON เท่านั้น:\n${log}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`;
    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        const resultText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (resultText) {
          const parsed = JSON.parse(resultText);
          const fileName = currentPreset ? currentPreset.fileName : 'live_streamed_log.xml';
          const newCaseId = addCase({
            fileName: fileName.replace('.evtx', '.xml'),
            severity: parsed.severity || 'CRITICAL',
            score: parsed.score || 90,
            title: parsed.title || 'AI Detected Security Incident',
            mitre: parsed.mitre || ['T1059'],
            mitigation: parsed.mitigation || 'ตรวจสอบระบบเครื่องเป้าหมายทันที',
            abstract: parsed.abstract || 'ตรวจพบพฤติกรรมสุ่มเสี่ยงความปลอดภัย',
            why: parsed.why || [],
            sourceLog: log,
            analyst: '',
          });

          setIsAnalyzing(false);
          setActiveTab('history');
          setSelectedCaseId(newCaseId);
          showToast('🔮', 'วิเคราะห์ด้วย Gemini สำเร็จ');
          return;
        }
      }
      throw new Error('Gemini API Error');
    } catch {
      showToast('❌', 'API ขัดข้อง — สลับไปใช้ Heuristics อัตโนมัติ');
      executeOfflineRuleMatch(log);
    }
  };

  const handleStartAnalysis = async () => {
    const raw = logText.trim();
    if (!raw) {
      showToast('❌', 'กรุณาระบุข้อมูล Event Log ก่อนสั่งสแกน');
      return;
    }

    if (currentPreset && currentPreset.binary && !hasConverted) {
      showToast('⚠️', 'กรุณาแปลงไฟล์ EVTX ก่อนส่งสแกน');
      return;
    }

    setIsAnalyzing(true);
    setScanStep(1);

    const stepDelay = Math.floor(simDelay / 3);

    setTimeout(() => {
      setScanStep(2);
    }, stepDelay);

    setTimeout(() => {
      setScanStep(3);
    }, stepDelay * 2);

    setTimeout(async () => {
      if (geminiApiKey) {
        await executeLiveGemini(geminiApiKey, raw);
      } else {
        executeOfflineRuleMatch(raw);
      }
    }, simDelay);
  };

  const stepLabels = [
    'Parsing XML schema...',
    'Mapping MITRE ATT&CK...',
    'Generating forensic report...',
  ];

  return (
    <div className="space-y-6">
      {/* Analyzing overlay */}
      {isAnalyzing ? (
        <div className="glass rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[380px] fade-in relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-6">
              <div className="w-14 h-14 rounded-2xl border-2 border-border-subtle border-t-teal-500 animate-spin mx-auto" />
            </div>

            <h3 className="text-base font-semibold text-slate-200 mb-1.5">
              กำลังวิเคราะห์ Event Log...
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              สแกนพฤติกรรม, แมป MITRE ATT&CK, และสร้างรายงาน
            </p>

            {/* Console-style progress */}
            <div className="bg-surface-sunken/80 border border-border-default rounded-xl p-4 w-full max-w-md text-left code-font text-[11px] space-y-2">
              {stepLabels.map((label, idx) => {
                const stepNum = idx + 1;
                const isDone = scanStep > stepNum;
                const isActive = scanStep === stepNum;
                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2.5 transition-all duration-300 ${
                      isDone ? 'text-emerald-400' : isActive ? 'text-teal-400' : 'text-slate-600'
                    }`}
                  >
                    <span className="w-5 text-center text-[10px]">
                      {isDone ? (
                        <i className="fa-solid fa-check" />
                      ) : isActive ? (
                        <i className="fa-solid fa-chevron-right" />
                      ) : (
                        <i className="fa-solid fa-circle text-[5px]" />
                      )}
                    </span>
                    <span>{label}</span>
                    {isActive && <span className="animate-pulse text-teal-400">|</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="pb-4">
            <div className="flex items-center space-x-3 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <i className="fa-solid fa-terminal text-teal-400 text-xs" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  นำเข้า Event Log
                </h2>
                <p className="text-xs text-slate-500">
                  เลือก preset หรือวางข้อมูล XML/JSON เพื่อวิเคราะห์ภัยคุกคาม
                </p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-teal-500/20 via-border-default to-transparent mt-3" />
          </div>

          {/* Preset Picker */}
          <div className="space-y-3">
            <label className="block text-xs text-slate-400 font-medium flex items-center space-x-1.5">
              <i className="fa-solid fa-folder-tree text-teal-400 text-[10px]" />
              <span>Forensic Case Presets</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {Object.values(LOG_PRESETS).map((preset) => {
                const isSelected = currentPreset?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 text-left border rounded-xl flex flex-col justify-between group transition-all duration-200 cursor-pointer hover-lift ${
                      isSelected
                        ? 'border-teal-500/40 bg-teal-500/8 glow-teal-sm'
                        : 'border-border-default hover:border-border-strong bg-surface-raised/60'
                    }`}
                  >
                    <span
                      className={`text-xs font-medium truncate group-hover:text-teal-400 transition ${
                        isSelected ? 'text-teal-400' : 'text-slate-300'
                      }`}
                    >
                      <i className={`fa-solid ${preset.icon} ${preset.colorClass} mr-1.5`} />
                      {preset.fileName}
                    </span>
                    <div className="flex items-center justify-between mt-2 w-full">
                      <span className="text-[10px] px-2 py-0.5 rounded-md text-slate-400 bg-surface-overlay/80 border border-border-default code-font">
                        {preset.tag}
                      </span>
                      <span
                        className={`text-[10px] font-medium code-font ${
                          preset.binary ? 'text-slate-500' : 'text-emerald-500'
                        }`}
                      >
                        {preset.binary ? 'EVTX' : 'XML'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag/Drop Zone */}
          <div className={`border border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[170px] transition-all duration-300 ${
            currentPreset && hasConverted
              ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
              : currentPreset && !hasConverted
              ? 'border-amber-500/30 bg-amber-500/[0.03]'
              : 'border-border-subtle hover:border-teal-500/30 bg-surface-raised/30 hover:bg-teal-500/[0.02]'
          }`}>
            {!currentPreset && (
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-surface-overlay/50 border border-border-default flex items-center justify-center mx-auto">
                  <i className="fa-solid fa-cloud-arrow-up text-xl text-slate-500" />
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  ลากวางไฟล์ล็อก (.evtx, .xml, .json) หรือเลือก Presets ด้านบน
                </p>
                <p className="text-[11px] text-slate-600">
                  รองรับ Security, Sysmon, System Event Logs
                </p>
              </div>
            )}

            {/* Binary file detected — needs conversion */}
            {currentPreset && currentPreset.binary && !hasConverted && (
              <div className="space-y-4 fade-in">
                {isConverting ? (
                  <div className="flex flex-col items-center space-y-3 py-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <i className="fa-solid fa-spinner animate-spin text-lg text-amber-500" />
                    </div>
                    <p className="text-xs text-amber-400 font-medium">
                      กำลังแปลง EVTX → XML...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-xl">
                      <i className="fa-solid fa-triangle-exclamation text-lg" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        {currentPreset.fileName}
                      </h4>
                      <p className="text-xs text-amber-400 mt-0.5">
                        ตรวจพบไฟล์ไบนารี (.evtx) — ต้องแปลงก่อนวิเคราะห์
                      </p>
                    </div>
                    <div className="flex justify-center space-x-2.5 pt-1">
                      <button
                        onClick={handleTriggerConvert}
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles mr-1.5" /> แปลงไฟล์
                      </button>
                      <button
                        onClick={handleResetImport}
                        className="bg-surface-overlay hover:bg-border-subtle text-slate-300 text-xs px-4 py-2.5 rounded-xl transition cursor-pointer border border-border-default"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Converted success */}
            {currentPreset && hasConverted && (
              <div className="space-y-4 fade-in">
                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl glow-teal-sm">
                  <i className="fa-solid fa-circle-check text-lg" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    {currentPreset.fileName.replace('.evtx', '.xml')}
                  </h4>
                  <p className="text-xs text-emerald-400 mt-0.5">
                    พร้อมสแกน
                  </p>
                </div>
                <div className="flex justify-center space-x-2.5 pt-1">
                  <button
                    onClick={handleStartAnalysis}
                    className="btn-primary text-white font-medium text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    <i className="fa-solid fa-bolt mr-1.5" /> เริ่มวิเคราะห์
                  </button>
                  <button
                    onClick={handleResetImport}
                    className="bg-surface-overlay hover:bg-border-subtle text-slate-300 text-xs px-4 py-2.5 rounded-xl transition cursor-pointer border border-border-default"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Log text area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs text-slate-400 font-medium flex items-center space-x-1.5">
                <i className="fa-solid fa-code text-teal-400 text-[10px]" />
                <span>Log Editor</span>
              </label>

              {/* Privacy Mask Toggle */}
              <div className="flex items-center space-x-2.5 text-[11px]">
                <span className="text-slate-500">Privacy Mask</span>
                <button
                  onClick={handleTogglePrivacyMask}
                  type="button"
                  className={`relative w-9 h-[18px] rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                    privacyMaskOn ? 'bg-teal-600 glow-teal-sm' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all duration-200 transform ${
                      privacyMaskOn ? 'translate-x-[18px]' : ''
                    }`}
                  />
                </button>
                <span className={`text-[11px] font-medium ${privacyMaskOn ? 'text-teal-400' : 'text-slate-600'}`}>
                  {privacyMaskOn ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div className="relative rounded-xl border border-border-default overflow-hidden bg-surface-sunken/50 focus-within:border-teal-500/30 focus-within:shadow-[0_0_0_3px_rgba(13,148,136,0.06)] transition-all duration-200">
              <textarea
                value={logText}
                onChange={handleTextareaChange}
                className="w-full h-48 p-4 bg-transparent code-font text-xs text-slate-300 focus:outline-none resize-none leading-relaxed"
                placeholder="วางข้อมูล Event Log (XML, Sysmon, Security) ตรงนี้..."
              />

              {privacyMaskOn && (
                <div className="absolute top-3 right-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-medium px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
                  <i className="fa-solid fa-eye-slash text-[9px]" />
                  <span>Masked</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2.5 pt-2">
            <button
              onClick={handleResetImport}
              className="bg-surface-raised hover:bg-surface-overlay text-slate-400 text-xs font-medium py-2.5 px-5 rounded-xl transition-all duration-200 cursor-pointer border border-border-default hover:border-border-strong"
            >
              ล้างข้อมูล
            </button>
            <button
              onClick={handleStartAnalysis}
              className="btn-primary text-white font-medium text-xs py-2.5 px-6 rounded-xl cursor-pointer"
            >
              <i className="fa-solid fa-magnifying-glass-chart mr-1.5" /> เริ่มสแกน
            </button>
          </div>
        </>
      )}
    </div>
  );
};
