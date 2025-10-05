# FINDRISC Wizard – สรุปโปรเจกต์ (README)

เว็บแอปประเมินความเสี่ยงโรคเบาหวานชนิดที่ 2 ตามแนวคิดแบบสอบถาม **FINDRISC** แบบวิซาร์ด (ถามทีละขั้น) พร้อมหน้าสรุปที่พิมพ์ได้ในหน้าเดียว (A4) และบันทึกเป็น PNG

---

## ฟีเจอร์หลัก

- วิซาร์ดถามทีละข้อ → สรุปคะแนน/ระดับเสี่ยง
- โทนสี **Indigo / Sky / Emerald** + UI นุ่มตา (การ์ด/ปุ่มโค้งมน เงานุ่ม Focus ชัด)
- รองรับมือถือ/แท็บเล็ตเต็มรูปแบบ (Responsive)
- **พิมพ์สวยงาม**: ซ่อน Navbar/ปุ่มอัตโนมัติ, บีบเนื้อหาให้พอดี **A4 แผ่นเดียว**
- **Export PNG** หน้าสรุปด้วย `html2canvas`
- ฟอนต์ภาษาไทย **Prompt** จาก Google Fonts
- เคารพ `prefers-reduced-motion` (ลดแอนิเมชันเมื่อผู้ใช้ตั้งค่า)

---

## เทคโนโลยี

- **React + Vite**
- **Tailwind CSS**
- **html2canvas** (แปลง DOM → PNG)
- **Google Fonts: Prompt**

---

## โฟลว์ผู้ใช้

1. **Home**: ข้อมูลพื้นฐาน + ปุ่ม “เริ่มทำแบบประเมิน”  
2. **Wizard**: แถบความคืบหน้า + คำถามทีละหัวข้อ  
3. **Summary**: คะแนนรวม / ระดับเสี่ยง (ต่ำ–ปานกลาง | สูง | สูงมาก) + ปุ่ม **พิมพ์** และ **บันทึก PNG**

> ปุ่ม **รีเซ็ต** แสดงเฉพาะช่วง `wizard` และ `summary` (ไม่แสดงบน `home`)  
> Navbar และปุ่มต่าง ๆ ถูกซ่อนตอนพิมพ์ด้วยคลาส `.no-print`, `.u-navbar`

---

## เกณฑ์การคำนวณคะแนน (ย่อ)

- **อายุ**: 0–4  
- **BMI**: `<25=0`, `25–29.9=1`, `≥30=3`  
- **รอบเอว** (ตามเพศ): `0/3/4`  
- **ออกกำลังกาย ≥30 นาที/วัน**: `ใช่=0`, `ไม่=2`  
- **กินผัก/ผลไม้ทุกวัน**: `ใช่=0`, `ไม่=1`  
- **ใช้ยาลดความดัน**: `ใช่=2`, `ไม่=0`  
- **เคยน้ำตาลสูง**: `เคย=5`, `ไม่เคย=0`  
- **ประวัติครอบครัว**: `ไม่มี/ไม่ทราบ=0`, `ญาติห่าง=3`, `ญาติสายตรง=5`

> รวมคะแนน → แบ่งระดับความเสี่ยง + แถบ Progress และเปอร์เซ็นต์โดยประมาณ

---

## โครงสร้างโปรเจกต์

```text
diabetes-risk/
├─ node_modules/
├─ public/
│  └─ vite.svg
├─ index.html                 # root HTML (mount #root)
├─ package.json               # scripts, dependencies
├─ package-lock.json
├─ postcss.config.js          # Tailwind + Autoprefixer
├─ tailwind.config.js         # Tailwind paths/theme
├─ vite.config.js             # Vite config
├─ eslint.config.js
├─ README.md                  # (ไฟล์นี้)
└─ src/
   ├─ main.jsx                # entry: createRoot, import index.css
   ├─ index.css               # Tailwind + ฟอนต์ Prompt + util/print CSS
   ├─ App.css                 # (ถ้าไม่ใช้ สามารถลบได้)
   └─ App.jsx                 # โค้ดหลักทั้งหมด (Home, Wizard, Summary, UI utils)
