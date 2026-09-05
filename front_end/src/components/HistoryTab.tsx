import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const HistoryTab: React.FC = () => {
  const {
    history,
    selectedCaseId,
    setSelectedCaseId,
    renameCase,
    deleteCase,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');

  const selectedCase = history.find((c) => c.id === selectedCaseId);

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.fileName.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.analyst.toLowerCase().includes(q)
    );
  });

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCaseId(id);
    setNewTitleInput(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (newTitleInput.trim()) {
      renameCase(id, newTitleInput.trim());
    }
    setEditingCaseId(null);
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`ต้องการลบเคส "${title}" ใช่หรือไม่?\nการลบนี้ไม่สามารถย้อนกลับได้`)) {
      deleteCase(id);
    }
  };

  const handleCopyReport = () => {
    if (!selectedCase) return;

    const structuredText = `
[LOGHUNTER FORENSIC REPORT]
---------------------------
File Analyzed: ${selectedCase.fileName}
Incident Score: ${selectedCase.score}% (${selectedCase.severity})
Analyst Owner: ${selectedCase.analyst}
Date: ${selectedCase.timestamp}

[TITLE]
${selectedCase.title}

[ABSTRACT]
${selectedCase.abstract}

[MITRE ATT&CK TECHNIQUES]
${selectedCase.mitre.join(', ')}

[MITIGATION RECOMMENDATIONS]
${selectedCase.mitigation}
    `.trim();

    try {
      navigator.clipboard.writeText(structuredText);
      showToast('📋', 'คัดลอกรายงานนิติวิทยาศาสตร์ไซเบอร์ลงคลิปบอร์ดแล้ว');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = structuredText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('📋', 'คัดลอกรายงานนิติวิทยาศาสตร์ไซเบอร์ลงคลิปบอร์ดแล้ว');
    }
  };

  // Helper for gauge arc
  const radius = 34;
  const circumference = 2 * Math.PI * radius; // ~213.6
  const score = selectedCase?.score ?? 0;
  const dashoffset = circumference - (score / 100) * circumference;

  // Extract IPs from source log
  const renderIpLookup = () => {
    if (!selectedCase) return null;
    const sourceLog = selectedCase.sourceLog || '';

    if (sourceLog.includes('[REDACTED-IP]')) {
      return (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-globe text-amber-400 mr-1"></i> ที่อยู่ IP ต้องสงสัยที่พบในหลักฐาน
          </h4>
          <div className="text-[10px] text-slate-500 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 flex items-center space-x-2">
            <i className="fa-solid fa-eye-slash text-slate-600"></i>
            <span>ไอพีต้นฉบับถูกปกปิดไว้ด้วย Privacy Mask ตอนนำเข้า จึงไม่สามารถตรวจสอบต่อได้</span>
          </div>
        </div>
      );
    }

    const matches = sourceLog.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
    const ignoredPrefixes = ['0.', '127.', '255.'];
    const uniqueIps = [...new Set(matches)].filter(
      (ip) => !ignoredPrefixes.some((p) => ip.startsWith(p))
    );

    if (uniqueIps.length === 0) return null;

    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <i className="fa-solid fa-globe text-amber-400 mr-1"></i> ที่อยู่ IP ต้องสงสัยที่พบในหลักฐาน
        </h4>
        <div className="space-y-2">
          {uniqueIps.slice(0, 5).map((ip) => (
            <div
              key={ip}
              className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 fade-in"
            >
              <span className="code-font text-xs text-amber-400 font-bold">{ip}</span>
              <div className="flex items-center space-x-1.5">
                <a
                  href={`https://www.virustotal.com/gui/ip-address/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition"
                  title="ตรวจสอบบน VirusTotal"
                >
                  <i className="fa-solid fa-magnifying-glass mr-1"></i>VirusTotal
                </a>
                <a
                  href={`https://www.shodan.io/host/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition"
                  title="ตรวจสอบบน Shodan"
                >
                  <i className="fa-solid fa-satellite-dish mr-1"></i>Shodan
                </a>
                <a
                  href="https://socradar.io/free-tools/soc-incident-toolkit/ip-reputation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition"
                  title="เปิดเครื่องมือ IP Reputation ของ SOCRadar"
                >
                  <i className="fa-solid fa-tower-broadcast mr-1"></i>SOCRadar
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-slate-500 leading-relaxed">
          คลิกเพื่อเปิดผลตรวจสอบชื่อเสียงไอพีในแท็บใหม่จากผู้ให้บริการ Threat Intelligence ภายนอก
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-200">📊 คลังพยานหลักฐานและรายงานวิเคราะห์</h2>
          <p className="text-xs text-slate-400 mt-1">
            คัดกรองข้อมูล แยกวิเคราะห์ และสืบค้นบทสรุปทางนิติวิทยาศาสตร์ย้อนหลัง
          </p>
        </div>
        <span className="bg-cyan-950 text-cyan-400 border border-cyan-900/50 text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold">
          {history.length} CASES AVAILABLE
        </span>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Sub-Pane: List of Cases */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[560px]">
          <div className="relative mb-3 shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/30 focus:outline-none rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-300"
              placeholder="พิมพ์ชื่อไฟล์หรือข้อความเพื่อค้นหา..."
            />
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-1">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-20 px-4">
                <i className="fa-solid fa-folder-open text-slate-600 text-3xl mb-3"></i>
                <p className="text-xs text-slate-400">ยังไม่พบบันทึกการสแกน</p>
                <p className="text-[10px] text-slate-600 mt-1 leading-normal">
                  คุณสามารถเริ่มสแกนความผิดปกติได้ที่หน้าแรก (Ingest Log)
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isSelected = selectedCaseId === item.id;
                let badgeColor = 'text-orange-400 bg-orange-950/40 border-orange-900/30';
                if (item.score >= 85) {
                  badgeColor = 'text-rose-400 bg-rose-950/40 border-rose-900/30';
                } else if (item.score < 60) {
                  badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col space-y-1.5 cursor-pointer fade-in ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/40 text-cyan-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold truncate max-w-[140px]">
                        <i className="fa-solid fa-file-shield text-[9px] mr-1"></i>
                        {item.fileName}
                      </span>
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-bold ${badgeColor}`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    {editingCaseId === item.id ? (
                      <form
                        onSubmit={(e) => handleSaveRename(item.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center space-x-1.5 my-1"
                      >
                        <input
                          type="text"
                          value={newTitleInput}
                          onChange={(e) => setNewTitleInput(e.target.value)}
                          className="flex-1 bg-slate-950 border border-cyan-500/50 rounded px-2 py-1 text-xs text-slate-200"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="bg-cyan-600 text-slate-950 font-bold px-2 py-1 rounded text-[10px]"
                        >
                          บันทึก
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCaseId(null)}
                          className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px]"
                        >
                          ยกเลิก
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs font-bold text-slate-200 truncate block w-full mt-0.5">
                        {item.title}
                      </span>
                    )}

                    <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1 pt-1 border-t border-slate-900">
                      <span>
                        <i className="fa-solid fa-clock mr-1"></i>
                        {item.timestamp}
                      </span>
                      <span>BY: {item.analyst}</span>
                    </div>

                    {/* Rename & Delete Action Buttons */}
                    <div className="flex items-center justify-end space-x-1.5 mt-1 pt-1.5 border-t border-slate-900/70">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(item.id, item.title, e)}
                        className="flex items-center space-x-1 text-[9px] font-semibold px-2 py-1 rounded-md border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-pen text-[8px]"></i>
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, item.title, e)}
                        className="flex items-center space-x-1 text-[9px] font-semibold px-2 py-1 rounded-md border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-950/20 transition cursor-pointer"
                      >
                        <i className="fa-solid fa-trash text-[8px]"></i>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sub-Pane: Detailed Forensic Report */}
        <div className="lg:col-span-8 flex flex-col h-[560px]">
          {!selectedCase ? (
            <div className="flex-1 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/10">
              <i className="fa-solid fa-square-poll-vertical text-slate-700 text-4xl mb-3 animate-pulse"></i>
              <h3 className="text-sm font-semibold text-slate-300">กรุณาเลือกเคสจากรายการ</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                เลือกประวัติการสแกนด้านซ้ายมือเพื่อดึงแผงรายงานความเสียหายและหลักฐานเชื่อมโยง MITRE ATT&CK อย่างเต็มรูปแบบ
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pr-1 fade-in">
              {/* Meta header card */}
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-950/50 border border-cyan-500/30 rounded-xl text-cyan-400">
                    <i className="fa-solid fa-file-invoice"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{selectedCase.fileName}</h3>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                      <span>
                        นักวิเคราะห์: <span className="text-cyan-400 font-semibold">{selectedCase.analyst}</span>
                      </span>
                      <span>•</span>
                      <span>{selectedCase.timestamp}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCopyReport}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 px-3 rounded-lg transition font-semibold cursor-pointer"
                  title="คัดลอกรายงานผลสแกน"
                >
                  <i className="fa-solid fa-copy mr-1"></i> คัดลอกรายงาน
                </button>
              </div>

              {/* Risk Score Gauge & MITRE mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gauge */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="5"
                        className="text-slate-800"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="5"
                        className={`transition-all duration-1000 ease-out ${
                          score >= 85
                            ? 'text-rose-600'
                            : score >= 60
                            ? 'text-orange-500'
                            : 'text-emerald-500'
                        }`}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                      />
                    </svg>
                    <span
                      className={`absolute text-sm font-bold ${
                        score >= 85
                          ? 'text-rose-400'
                          : score >= 60
                          ? 'text-orange-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                        score >= 85
                          ? 'bg-rose-950 text-rose-400 border-rose-900/50'
                          : score >= 60
                          ? 'bg-orange-950 text-orange-400 border-orange-900/50'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-900/50'
                      }`}
                    >
                      {score >= 85 ? 'CRITICAL THREAT' : selectedCase.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 mt-1.5">ระดับภัยคุกคามโดยรวม</h4>
                    <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
                      พยากรณ์ความเสี่ยงบนระบบความมั่นคงปลอดภัย
                    </p>
                  </div>
                </div>

                {/* MITRE Card */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <i className="fa-solid fa-crosshairs text-rose-400 mr-1"></i> แผนภาพ MITRE ATT&CK Techniques
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedCase.mitre.map((m) => (
                        <span
                          key={m}
                          className="bg-rose-950/40 border border-rose-900/30 text-rose-400 text-[9px] px-2 py-0.5 rounded font-mono font-bold"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-500 mt-1">
                    อ้างอิงรหัสนิเวศวิทยาภัยพิบัติไซเบอร์ตามมาตรฐานสากล
                  </span>
                </div>
              </div>

              {/* Threat Intel IP Lookup */}
              {renderIpLookup()}

              {/* Narrative Summary */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                  <i className="fa-solid fa-book-open text-cyan-400"></i>
                  <span>บทสรุปความพยายามประทุษร้าย (Incident Narrative)</span>
                </div>
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-extrabold text-cyan-400">{selectedCase.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedCase.abstract}</p>
                </div>
              </div>

              {/* Forensic Reasons List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <i className="fa-solid fa-magnifying-glass-location text-amber-500 mr-1"></i> ลายนิ้วมือทางวิทยาศาสตร์และเหตุผลสนับสนุน (Evidential Reasonings)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCase.why.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-2 fade-in"
                    >
                      <h5 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900/30 flex items-center justify-center text-[9px] font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span>{item.title}</span>
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Mitigation Plan */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-2xl space-y-2">
                <h5 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>แผนปฏิบัติการกักกันและลดความเสี่ยงเร่งด่วน (Immediate Mitigations)</span>
                </h5>
                <div className="text-xs text-slate-300 leading-relaxed space-y-1 pl-2">
                  {selectedCase.mitigation.split('\n').map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 py-0.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
