# รายละเอียดการตั้งค่าโครงสร้างโปรเจคจบ (Front-end: React + Tailwind CSS v4.0)

เอกสารฉบับนี้จัดทำขึ้นเพื่อแสดงรายละเอียดโครงสร้างซอฟต์แวร์ เครื่องมือ (Tools) และเวอร์ชัน (Versions) ของไลบรารีต่างๆ ที่ใช้ในการขึ้นโครงโปรเจคฝั่ง Front-end เพื่อใช้ประกอบการทำโปรเจคจบ (Graduation Project) หรือเขียนในเล่มรายงานบทที่ 3 (การดำเนินงาน/การออกแบบระบบ)

---

## 1. ข้อมูลเครื่องมือหลักของระบบ (System Environment)

* **Node.js**: `v22.22.0` (สภาพแวดล้อมหลักในการรัน JavaScript ฝั่ง Server เพื่อรันและสร้างโปรเจค)
* **npm (Node Package Manager)**: `v10.9.4` (ตัวจัดการแพ็กเกจไลบรารีและดาวน์โหลด Dependencies)
* **Vite**: `v8.2.0` (เครื่องมือในการ Build และ Bundle โปรเจคที่ทำงานรวดเร็วมากแทน Webpack)
* **TypeScript**: `v6.0.2` (ภาษาโปรแกรมมิ่งหลักสำหรับการควบคุมประเภทตัวแปรเพื่อช่วยลดข้อผิดพลาด)

---

## 2. โครงสร้าง Dependencies (package.json)

รายละเอียดเวอร์ชันไลบรารีและปลั๊กอินทั้งหมดในโปรเจคฝั่ง [front_end](file:///d:/project/front_end):

### 2.1 Dependencies หลัก (Production)

| ชื่อเครื่องมือ / ไลบรารี | เวอร์ชัน | คำอธิบายหน้าที่ |
| :--- | :---: | :--- |
| **React** | `^19.2.8` | ไลบรารีหลักในการสร้าง Component และจัดการ View UI |
| **React DOM** | `^19.2.8` | ตัวเชื่อมต่อการแสดงผล Component ของ React เข้ากับ DOM ของ Browser |
| **Tailwind CSS** | `^4.3.3` | CSS Framework สไตล์ Utility-First สำหรับแต่งดีไซน์พรีเมียม |
| **@tailwindcss/vite** | `^4.3.3` | ปลั๊กอินเชื่อมการคอมไพล์ Tailwind CSS v4.0 เข้ากับ Vite ทำให้ทำงานเร็วมาก |
| **React Router DOM** | `^7.18.2` | ไลบรารีสำหรับจัดการเส้นทางและการเปลี่ยนหน้าเว็ป (Routing) แบบ Single Page Application (SPA) |
| **Lucide React** | `^1.33.0` | ไอคอนเวกเตอร์ที่สวยงาม ทันสมัย และง่ายต่อการปรับขนาด/สีผ่าน CSS |

### 2.2 DevDependencies (Development)

| ชื่อเครื่องมือ | เวอร์ชัน | คำอธิบายหน้าที่ |
| :--- | :---: | :--- |
| **typescript** | `~6.0.2` | คอมไพเลอร์แปลง TypeScript เป็น JavaScript |
| **vite** | `^8.2.0` | ตัวรัน Server สำหรับพัฒนาโปรเจค (Dev Server) และตัว Build ระบบ |
| **@vitejs/plugin-react** | `^6.0.4` | ปลั๊กอินของ Vite สำหรับคอมไพล์โค้ด React Fast Refresh |
| **oxlint** | `^1.75.0` | เครื่องมือสแกนตรวจสอบความถูกต้องและจัดรูปแบบโค้ด (Linter) ที่รวดเร็ว |
| **@types/react** | `^19.2.17` | ไทป์คำจำกัดความ (Type definitions) ของ React |
| **@types/react-dom** | `^19.2.3` | ไทป์คำจำกัดความของ React DOM |
| **@types/node** | `^24.13.3` | ไทป์คำจำกัดความสำหรับสภาพแวดล้อม Node.js |

---

## 3. โครงสร้างโฟลเดอร์ของโปรเจค (Directory Structure)

โฟลเดอร์หลักภายใต้ `front_end/src` ได้ถูกจัดกลุ่มตามมาตรฐานอุตสาหกรรม (Industry Standard Layout) เพื่อให้จัดเก็บไฟล์โค้ดได้เป็นระเบียบ สะดวกต่อการเขียนเล่มรายงานโครงงาน:

```text
front_end/
├── public/                 # จัดเก็บไฟล์คงที่ (Static assets) ที่ไม่ต้องผ่าน Vite คอมไพล์ (เช่น โลโก้, รูปภาพ)
├── src/
│   ├── assets/             # จัดเก็บไฟล์มีเดีย เช่น รูปภาพ โลโก้ หรือไฟล์ SVG ต่างๆ
│   ├── components/         # คอมโพเนนต์ที่เรียกใช้งานซ้ำๆ (เช่น Navbar, Footer, GlassCard)
│   ├── context/            # การจัดการ State ส่วนกลางของแอพ (เช่น สถานะการล็อกอิน, ธีม Dark Mode)
│   ├── hooks/              # Custom Hooks พิเศษสำหรับช่วยแบ่งเบา Logic การทำงาน (เช่น useLocalStorage)
│   ├── pages/              # หน้าหลักของระบบ (เช่น Home - หน้าแรกดีไซน์หรู, Dashboard - แดชบอร์ดข้อมูลจำลอง)
│   ├── services/           # บริการติดต่อสื่อสาร API ฝั่ง Back-end (มีฟังก์ชัน get, post รองรับ)
│   ├── utils/              # ฟังก์ชันช่วยเหลืออเนกประสงค์ (Helper Functions เช่น จัดรูปแบบวันที่)
│   ├── App.tsx             # จุดเริ่มต้นโครงสร้างเว็ปไซต์, การตั้งค่า Routes และการรวม Navbar/Footer เข้าด้วยกัน
│   ├── index.css           # ไฟล์สไตล์หลักที่นำเข้า Tailwind CSS v4.0 และตั้งค่า Fonts
│   └── main.tsx            # จุดเชื่อมต่อหลักในการ Mount ตัวแอพ React เข้ากับ HTML
├── index.html              # ไฟล์ HTML หลักที่เป็นโครงหน้าเว็ป (ตั้งค่า SEO Title และ Meta Description แล้ว)
├── package.json            # ไฟล์ระบุข้อมูล Dependencies และคำสั่งรันระบบ
├── tsconfig.json           # การตั้งค่าพฤติกรรมและการตรวจไทป์ของ TypeScript
└── vite.config.ts          # การตั้งค่าของ Vite และปลั๊กอิน (React + Tailwind v4)
```

---

## 4. วิธีการรันโปรเจค (How to run)

1. เปิด Terminal (PowerShell หรือ CMD) ไปที่โฟลเดอร์ `front_end`:
   ```bash
   cd front_end
   ```
2. ติดตั้ง Dependencies (หากยังไม่ได้ติดตั้ง):
   ```bash
   npm install
   ```
3. รันโปรเจคในโหมดพัฒนา (Development Mode):
   ```bash
   npm run dev
   ```
   *เว็ปไซต์จะรันที่: `http://localhost:5173` (หรือตามพอร์ตที่ระบุบน Terminal)*

4. คอมไพล์และแพ็คโปรเจคเพื่อนำไปใช้งานจริง (Production Build):
   ```bash
   npm run build
   ```
   *ไฟล์ผลลัพธ์จะไปอยู่ที่โฟลเดอร์ `dist/` เพื่อนำขึ้นโฮสต์เซิร์ฟเวอร์ต่อไป*
