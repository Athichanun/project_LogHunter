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
      showToast('📋', 'คัดลอกรายงานลงคลิปบอร์ดแล้ว');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = structuredText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('📋', 'คัดลอกรายงานลงคลิปบอร์ดแล้ว');
    }
  };

  // Gauge arc
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const score = selectedCase?.score ?? 0;
  const dashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 85) return { text: 'text-red-400', stroke: 'text-red-500', bg: 'bg-red-500/8 text-red-400 border-red-500/15', bar: 'severity-bar-critical' };
    if (s >= 60) return { text: 'text-amber-400', stroke: 'text-amber-500', bg: 'bg-amber-500/8 text-amber-400 border-amber-500/15', bar: 'severity-bar-high' };
    return { text: 'text-emerald-400', stroke: 'text-emerald-500', bg: 'bg-emerald-500/8 text-emerald-400 border-emerald-500/15', bar: 'severity-bar-low' };
  };

  // Extract IPs from source log
  const renderIpLookup = () => {
    if (!selectedCase) return null;
    const sourceLog = selectedCase.sourceLog || '';

    if (sourceLog.includes('[REDACTED-IP]')) {
      return (
        <div className="glass rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
            <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
              <i className="fa-solid fa-globe text-amber-400 text-[9px]" />
            </div>
            <span>IP ต้องสงสัย</span>
          </h4>
          <div className="text-[11px] text-slate-500 bg-surface-sunken/80 border border-border-default rounded-lg px-4 py-3 flex items-center space-x-2">
            <i className="fa-solid fa-eye-slash text-slate-600" />
            <span>IP ถูกปกปิดด้วย Privacy Mask ตอนนำเข้า</span>
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
      <div className="glass rounded-xl p-5 space-y-3">
        <h4 className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
          <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
            <i className="fa-solid fa-globe text-amber-400 text-[9px]" />
          </div>
          <span>IP ต้องสงสัย</span>
        </h4>
        <div className="space-y-2">
          {uniqueIps.slice(0, 5).map((ip) => (
            <div
              key={ip}
              className="flex items-center justify-between bg-surface-sunken/80 border border-border-default rounded-lg px-4 py-2.5 fade-in hover:border-border-strong transition-all duration-200"
            >
              <span className="code-font text-xs text-amber-400 font-medium">{ip}</span>
              <div className="flex items-center space-x-1.5">
                <a
                  href={`https://www.virustotal.com/gui/ip-address/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-overlay hover:bg-border-subtle text-slate-300 text-[10px] font-medium px-2.5 py-1 rounded-md transition-all duration-200 hover:text-teal-400 border border-border-default"
                >
                  VT
                </a>
                <a
                  href={`https://www.shodan.io/host/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-overlay hover:bg-border-subtle text-slate-300 text-[10px] font-medium px-2.5 py-1 rounded-md transition-all duration-200 hover:text-teal-400 border border-border-default"
                >
                  Shodan
                </a>
                <a
                  href="https://socradar.io/free-tools/soc-incident-toolkit/ip-reputation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-overlay hover:bg-border-subtle text-slate-300 text-[10px] font-medium px-2.5 py-1 rounded-md transition-all duration-200 hover:text-teal-400 border border-border-default"
                >
                  SOCRadar
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-600">
          คลิกเพื่อตรวจสอบ IP ในแท็บใหม่
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <i className="fa-solid fa-box-archive text-teal-400 text-xs" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">ประวัติการวิเคราะห์</h2>
            <p className="text-xs text-slate-500">
              ค้นหาและดูรายงานนิติวิทยาศาสตร์ย้อนหลัง
            </p>
          </div>
        </div>
        <span className="bg-surface-overlay/80 text-slate-400 border border-border-default text-[11px] px-3 py-1.5 rounded-lg code-font">
          {history.length} cases
        </span>
      </div>

      <div className="h-px bg-gradient-to-r from-teal-500/20 via-border-default to-transparent" />

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px]">
        {/* Left: Case List */}
        <div className="lg:col-span-4 glass rounded-xl p-3.5 flex flex-col h-[560px]">
          <div className="relative mb-3 shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <i className="fa-solid fa-magnifying-glass text-[11px]" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-sunken/80 border border-border-default focus:border-teal-500/50 focus:outline-none rounded-lg py-2 pl-9 pr-3 text-xs text-slate-300 transition-all duration-200 input-glow"
              placeholder="ค้นหา..."
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-0.5">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-overlay/50 border border-border-default flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-folder-open text-slate-600 text-xl" />
                </div>
                <p className="text-xs text-slate-500 font-medium">ยังไม่มีประวัติการสแกน</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  เริ่มสแกนได้ที่หน้า "นำเข้าล็อก"
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isSelected = selectedCaseId === item.id;
                const scoreColor = getScoreColor(item.score);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col space-y-1.5 cursor-pointer ${scoreColor.bar} ${
                      isSelected
                        ? 'bg-teal-500/8 border-teal-500/25 glow-teal-sm'
                        : 'bg-surface-sunken/60 border-border-default hover:border-border-strong hover:bg-surface-overlay/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] code-font text-slate-300 font-medium truncate max-w-[160px]">
                        {item.fileName}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${scoreColor.bg}`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    {editingCaseId === item.id ? (
                      <form
                        onSubmit={(e) => handleSaveRename(item.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center space-x-1.5 my-0.5"
                      >
                        <input
                          type="text"
                          value={newTitleInput}
                          onChange={(e) => setNewTitleInput(e.target.value)}
                          className="flex-1 bg-surface-sunken border border-teal-500/40 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 input-glow"
                          autoFocus
                        />
                        <button type="submit" className="btn-primary text-white font-medium px-2.5 py-1.5 rounded-lg text-[10px]">
                          บันทึก
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCaseId(null)}
                          className="bg-surface-overlay text-slate-300 px-2.5 py-1.5 rounded-lg text-[10px] border border-border-default"
                        >
                          ยกเลิก
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs font-medium text-slate-200 truncate block w-full">
                        {item.title}
                      </span>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-border-default/50">
                      <span>{item.timestamp}</span>
                      <span>{item.analyst}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-1 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(item.id, item.title, e)}
                        className="text-[10px] px-2.5 py-1 rounded-lg text-slate-500 hover:text-teal-400 hover:bg-teal-500/8 transition-all duration-200 cursor-pointer"
                      >
                        <i className="fa-solid fa-pen mr-0.5" /> Rename
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, item.title, e)}
                        className="text-[10px] px-2.5 py-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 cursor-pointer"
                      >
                        <i className="fa-solid fa-trash mr-0.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Forensic Report Detail */}
        <div className="lg:col-span-8 flex flex-col h-[560px]">
          {!selectedCase ? (
            <div className="flex-1 border border-border-default border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-surface-raised/20">
              <div className="w-16 h-16 rounded-2xl bg-surface-overlay/50 border border-border-default flex items-center justify-center mb-4">
                <i className="fa-solid fa-square-poll-vertical text-slate-600 text-2xl" />
              </div>
              <h3 className="text-sm font-medium text-slate-300">เลือกเคสจากรายการด้านซ้าย</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs">
                คลิกเคสเพื่อดูรายงานวิเคราะห์ MITRE ATT&CK แบบเต็ม
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-0.5 fade-in">
              {/* Meta header */}
              <div className="glass rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-gradient-to-br from-teal-500/15 to-teal-600/5 rounded-xl text-teal-400 border border-teal-500/15">
                    <i className="fa-solid fa-file-invoice text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{selectedCase.fileName}</h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span>
                        Analyst: <span className="text-slate-300">{selectedCase.analyst}</span>
                      </span>
                      <span className="text-border-strong">•</span>
                      <span>{selectedCase.timestamp}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCopyReport}
                  className="bg-surface-overlay hover:bg-border-subtle text-slate-300 text-xs py-2 px-4 rounded-xl transition-all duration-200 font-medium cursor-pointer border border-border-default hover:border-border-strong"
                >
                  <i className="fa-solid fa-copy mr-1.5" /> คัดลอก
                </button>
              </div>

              {/* Risk Score & MITRE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gauge */}
                <div className="glass rounded-xl p-5 flex items-center space-x-5">
                  <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48" cy="48" r={radius}
                        stroke="currentColor" strokeWidth="4"
                        className="text-border-subtle" fill="transparent"
                      />
                      <circle
                        cx="48" cy="48" r={radius}
                        stroke="currentColor" strokeWidth="4"
                        className={`transition-all duration-1000 ease-out ${getScoreColor(score).stroke}`}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px currentColor)` }}
                      />
                    </svg>
                    <span className={`absolute text-lg font-bold ${getScoreColor(score).text}`}>
                      {score}%
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border ${getScoreColor(score).bg}`}>
                      {score >= 85 ? 'CRITICAL' : selectedCase.severity}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-200 mt-2">ระดับภัยคุกคาม</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      คะแนนความเสี่ยงจากการวิเคราะห์
                    </p>
                  </div>
                </div>

                {/* MITRE Card */}
                <div className="glass rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center">
                        <i className="fa-solid fa-crosshairs text-red-400 text-[9px]" />
                      </div>
                      <span>MITRE ATT&CK</span>
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedCase.mitre.map((m) => (
                        <span
                          key={m}
                          className="bg-red-500/8 border border-red-500/15 text-red-300 text-[10px] px-2.5 py-1 rounded-lg code-font font-medium hover:bg-red-500/12 transition-colors duration-200"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 mt-3">
                    Techniques ตามมาตรฐาน MITRE
                  </span>
                </div>
              </div>

              {/* IP Lookup */}
              {renderIpLookup()}

              {/* Narrative */}
              <div className="glass rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-md bg-teal-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-book-open text-teal-400 text-[9px]" />
                  </div>
                  <span>สรุปเหตุการณ์</span>
                </h4>
                <div className="bg-surface-sunken/80 border border-border-default p-4 rounded-xl space-y-2">
                  <h5 className="text-sm font-semibold text-teal-400">{selectedCase.title}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedCase.abstract}</p>
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-magnifying-glass-location text-amber-400 text-[9px]" />
                  </div>
                  <span>หลักฐานสนับสนุน</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCase.why.map((item, idx) => (
                    <div
                      key={idx}
                      className="glass rounded-xl p-4 space-y-2 fade-in hover:border-border-strong transition-all duration-200"
                    >
                      <h5 className="text-xs font-medium text-slate-200 flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500/15 to-teal-600/5 text-teal-400 flex items-center justify-center text-[10px] code-font font-bold border border-teal-500/15">
                          {idx + 1}
                        </span>
                        <span>{item.title}</span>
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed pl-8">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation */}
              <div className="bg-emerald-500/[0.04] border border-emerald-500/15 p-5 rounded-xl space-y-3 glow-teal-sm">
                <h5 className="text-xs font-medium text-emerald-400 flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                    <i className="fa-solid fa-shield-halved text-[10px]" />
                  </div>
                  <span>แผนลดความเสี่ยง</span>
                </h5>
                <div className="text-xs text-slate-300 leading-relaxed space-y-1.5 pl-1">
                  {selectedCase.mitigation.split('\n').map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2 py-0.5">
                      <i className="fa-solid fa-check text-emerald-500 text-[9px] mt-1 shrink-0" />
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
