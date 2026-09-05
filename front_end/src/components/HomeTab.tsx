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
      showToast('⚠️', "ตรวจพบไฟล์ระบบไบนารี .evtx จำเป็นต้องคลิกปุ่ม 'แปลงไฟล์' ก่อนนำวิเคราะห์");
    } else {
      setHasConverted(true);
      showToast('📄', 'โครงสร้าง XML นำเข้าพร้อมใช้งาน');
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
      showToast('⚙️', `แปลงไฟล์ ${currentPreset.fileName} เป็น XML Schema สมบูรณ์`);
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
      showToast('🕶️', 'เปิดโหมดปกปิดข้อมูล: มาสก์ IP Address และ SID อัตโนมัติก่อนวิเคราะห์');
    } else {
      setLogText(originalLogText);
      showToast('👁️', 'ปิดโหมดปกปิดข้อมูล: แสดงข้อมูลต้นฉบับ');
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
    showToast('📊', 'สแกนพฤติกรรมเสร็จสิ้น: ย้ายข้อมูลไปที่คลังประวัติรายงานแล้ว');
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
          showToast('🔮', 'โมเดลปัญญาประดิษฐ์สกัดวิเคราะห์คำตอบสมบูรณ์แบบ!');
          return;
        }
      }
      throw new Error('Gemini API Error');
    } catch {
      showToast('❌', 'การเชื่อมต่อ API ขัดข้อง: สลับทำงาน Heuristics ในเครื่องอัตโนมัติ');
      executeOfflineRuleMatch(log);
    }
  };

  const handleStartAnalysis = async () => {
    const raw = logText.trim();
    if (!raw) {
      showToast('❌', 'กรุณาระบุข้อมูล Event Log ก่อนสั่งเริ่มสแกน');
      return;
    }

    if (currentPreset && currentPreset.binary && !hasConverted) {
      showToast('⚠️', 'กรุณาสกัดไฟล์ EVTX ไบนารีให้เรียบร้อยก่อนส่งสแกน');
      return;
    }

    setIsAnalyzing(true);
    setScanStep(1);

    const stepDelay = Math.floor(simDelay / 3);

    // Animate checklist progress
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

  return (
    <div className="space-y-6">
      {/* If analyzing is in progress, show overlay panel */}
      {isAnalyzing ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[380px] fade-in">
          {/* Cyber Scanning background sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-24 w-full animate-[bounce_3s_infinite] pointer-events-none border-b border-cyan-500/20"></div>

          <div className="relative space-y-4">
            <div className="inline-block relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
              <div
                className="w-10 h-10 rounded-full border-4 border-slate-800 border-b-blue-500 animate-spin absolute top-3 left-3"
                style={{ animationDirection: 'reverse' }}
              ></div>
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-200">
                กำลังถอดรหัสพฤติกรรมทางพจนานุกรมและ AI...
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ตรวจจับความแปรปรวนของ Event Log, แมปปิ้งเข้าสู่ MITRE ATT&CK และเตรียมจัดเก็บพยานหลักฐานสถิติ
              </p>
            </div>

            {/* Progress tracking checklist */}
            <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-3.5 max-w-sm mx-auto text-left space-y-2.5 font-mono text-[10px] text-slate-400 shadow-xl">
              <div
                className={`flex justify-between items-center ${
                  scanStep >= 1 ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                <span>1. Parsing XML Data Node Schema</span>
                <span className="text-emerald-400 font-bold uppercase">
                  {scanStep > 1 ? (
                    <i className="fa-solid fa-check text-emerald-400"></i>
                  ) : (
                    <i className="fa-solid fa-spinner animate-spin text-cyan-400"></i>
                  )}
                </span>
              </div>

              <div
                className={`flex justify-between items-center ${
                  scanStep >= 2 ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                <span>2. Mapping MITRE ATT&CK Matrix</span>
                <span className="font-bold uppercase">
                  {scanStep > 2 ? (
                    <i className="fa-solid fa-check text-emerald-400"></i>
                  ) : scanStep === 2 ? (
                    <i className="fa-solid fa-spinner animate-spin text-cyan-400"></i>
                  ) : (
                    'WAITING'
                  )}
                </span>
              </div>

              <div
                className={`flex justify-between items-center ${
                  scanStep >= 3 ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                <span>3. Writing Forensic Narrative & Advise</span>
                <span className="font-bold uppercase">
                  {scanStep === 3 ? (
                    <i className="fa-solid fa-spinner animate-spin text-cyan-400"></i>
                  ) : (
                    'WAITING'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Title */}
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-200">
              📥 นำเข้าแฟ้มบันทึกเหตุการณ์ (Windows Ingestion)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              อัปโหลด ลากวางไฟล์ หรือวางข้อมูล XML/JSON เพื่อประมวลหาเวกเตอร์ความสุ่มเสี่ยง
            </p>
          </div>

          {/* Preset Picker Grid */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              ชุดพยานหลักฐานจำลองระดับสากล (Forensic Case Presets)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {Object.values(LOG_PRESETS).map((preset) => {
                const isSelected = currentPreset?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 text-left border rounded-xl flex flex-col justify-between group transition cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500/50 bg-slate-900/60 shadow-lg shadow-cyan-950/30'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/40'
                    }`}
                  >
                    <span
                      className={`text-xs font-bold truncate group-hover:text-cyan-400 transition ${
                        isSelected ? 'text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      <i className={`fa-solid ${preset.icon} ${preset.colorClass} mr-1.5`}></i>
                      {preset.fileName}
                    </span>
                    <div className="flex items-center justify-between mt-2 w-full">
                      <span
                        className={`text-[8px] px-1 rounded uppercase font-mono font-bold ${
                          preset.id === 'rdp'
                            ? 'bg-blue-950 text-blue-400 border border-blue-900/30'
                            : preset.id === 'powershell'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                            : preset.id === 'clear'
                            ? 'bg-rose-950 text-rose-400 border border-rose-900/30'
                            : preset.id === 'ransomware'
                            ? 'bg-red-950 text-red-400 border border-red-900/30'
                            : 'bg-purple-950 text-purple-400 border border-purple-900/30'
                        }`}
                      >
                        {preset.tag}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold font-mono ${
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

          {/* Drag Ingestion Area */}
          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 transition rounded-2xl p-8 text-center bg-slate-900/10 flex flex-col items-center justify-center relative min-h-[180px]">
            {!currentPreset && (
              <div className="space-y-2">
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-700"></i>
                <p className="text-xs text-slate-300">
                  ลากและวางไฟล์ล็อก Windows (.evtx, .xml, .json) ลงที่นี่ หรือคลิกปุ่ม Presets ด้านบน
                </p>
                <p className="text-[10px] text-slate-500">
                  รองรับ Binary Event Logs ตระกูล Security, Sysmon, และ System
                </p>
              </div>
            )}

            {/* Detected file state (Before convert) */}
            {currentPreset && currentPreset.binary && !hasConverted && (
              <div className="space-y-3 fade-in">
                {isConverting ? (
                  <div className="flex flex-col items-center justify-center space-y-2.5 py-4">
                    <i className="fa-solid fa-spinner animate-spin text-3xl text-amber-500"></i>
                    <p className="text-xs text-amber-400 font-bold">
                      กำลังประมวลผล EVTX Binary ➔ XML Schema...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="inline-flex p-3 bg-amber-950 text-amber-400 border border-amber-900/50 rounded-xl text-lg animate-pulse">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">
                        {currentPreset.fileName}
                      </h4>
                      <p className="text-xs text-amber-400 font-semibold mt-1">
                        🚨 แจ้งเตือน: ตรวจพบไฟล์ระบบไบนารีดิบ (.evtx)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ระบบวิเคราะห์หลักฐานต้องการโครงสร้าง XML/JSON คุณจำเป็นต้องใช้คอมโพเนนต์แปลงโครงสร้างก่อน
                      </p>
                    </div>
                    <div className="pt-1 flex justify-center space-x-2">
                      <button
                        onClick={handleTriggerConvert}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition duration-150 shadow-md cursor-pointer"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles mr-1.5"></i> แปลงไฟล์ EVTX เป็น XML
                      </button>
                      <button
                        onClick={handleResetImport}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Converted Success State */}
            {currentPreset && hasConverted && (
              <div className="space-y-3 fade-in">
                <div className="inline-flex p-3 bg-emerald-950 text-emerald-400 border border-emerald-900/50 rounded-xl text-lg animate-pulse">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    {currentPreset.fileName.replace('.evtx', '.xml')}
                  </h4>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    ✅ แกะโครงสร้างและพร้อมทำการสแกน!
                  </p>
                </div>
                <div className="pt-1 flex justify-center space-x-2">
                  <button
                    onClick={handleStartAnalysis}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-lg transition duration-150 shadow-md cursor-pointer"
                  >
                    <i className="fa-solid fa-bolt mr-1.5"></i> เริ่มทำการรันตัววิเคราะห์พฤติกรรม
                  </button>
                  <button
                    onClick={handleResetImport}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Log text area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                หน้าต่างตรวจสอบสตรีมล็อกและชุดคำสั่งสากล (Log Plainview Editor)
              </label>

              {/* Privacy Mask Toggle */}
              <div className="flex items-center space-x-2.5 bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-1.5">
                <i className="fa-solid fa-user-secret text-slate-500 text-xs"></i>
                <span className="text-[10px] font-bold text-slate-300">Privacy Mask</span>
                <span className="text-[9px] text-slate-600">(ปกปิด IP / SID)</span>
                <button
                  onClick={handleTogglePrivacyMask}
                  type="button"
                  className={`relative w-9 h-5 rounded-full transition duration-200 shrink-0 cursor-pointer ${
                    privacyMaskOn ? 'bg-cyan-600' : 'bg-slate-700'
                  }`}
                  title="เปิด/ปิดโหมดปกปิดข้อมูลอ่อนไหว"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-slate-200 shadow transition duration-200 transform ${
                      privacyMaskOn ? 'translate-x-4' : ''
                    }`}
                  ></span>
                </button>
                <span
                  className={`text-[9px] font-bold uppercase w-12 ${
                    privacyMaskOn ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                >
                  {privacyMaskOn ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <textarea
                value={logText}
                onChange={handleTextareaChange}
                className="w-full h-48 p-4 bg-slate-950/40 code-font text-xs text-cyan-400/80 focus:outline-none resize-none leading-relaxed"
                placeholder="วางโค้ดข้อมูลล็อก XML, Sysmon หรือ Security Event Log ตรงนี้ เพื่อนำสแกนตรวจหาภัยคุกคาม..."
              ></textarea>

              {privacyMaskOn && (
                <div className="absolute top-2 right-2 bg-cyan-950/90 border border-cyan-500/40 text-cyan-400 text-[9px] font-bold px-2 py-1 rounded-lg flex items-center space-x-1 shadow-lg">
                  <i className="fa-solid fa-eye-slash"></i>
                  <span>กำลังปกปิดข้อมูลอ่อนไหวก่อนส่งวิเคราะห์</span>
                </div>
              )}
            </div>
          </div>

          {/* Trigger buttons */}
          <div className="flex justify-end space-x-2 border-t border-slate-900 pt-4">
            <button
              onClick={handleResetImport}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
            >
              ล้างข้อมูล
            </button>
            <button
              onClick={handleStartAnalysis}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs py-2 px-5 rounded-lg transition shadow-md shadow-cyan-950/20 cursor-pointer"
            >
              <i className="fa-solid fa-magnifying-glass-chart mr-1.5"></i> เริ่มสแกนระบุความเสี่ยง
            </button>
          </div>
        </>
      )}
    </div>
  );
};
