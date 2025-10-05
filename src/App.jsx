import React, { useMemo, useRef, useState } from "react";

/**
 * FINDRISC Wizard – Colorful UX/UI
 * - โทนสีใหม่ (Indigo/Sky/Emerald) + gradient พื้นหลัง + การเน้นสีเชิงความหมาย
 * - ปุ่ม/การ์ดโค้งมน เงานุ่ม ๆ, โฟกัสสเตตัสชัดเจน, ไอคอน SVG
 * - วิซาร์ดถามทีละข้อ + สรุป + ปุ่มพิมพ์/บันทึก PNG (ต้องติดตั้ง html2canvas)
 */

// ---- CONSTS ----
const AGE_OPTIONS = [
  { label: "น้อยกว่า 45 ปี", value: "<45", score: 0 },
  { label: "45–54 ปี", value: "45-54", score: 2 },
  { label: "55–64 ปี", value: "55-64", score: 3 },
  { label: "> 64 ปี", value: ">64", score: 4 },
];

const SEX_OPTIONS = [
  { label: "ชาย", value: "male" },
  { label: "หญิง", value: "female" },
];

// ---- HELPERS ----
function calcBMI(weightKg, heightCm) {
  const h = Number(heightCm) / 100;
  const w = Number(weightKg);
  if (!h || !w) return 0;
  return w / (h * h);
}
function bmiScore(bmi) {
  if (!bmi) return 0;
  if (bmi < 25) return 0;
  if (bmi < 30) return 1;
  return 3; // ≥ 30
}
function waistScore(waistCm, sex) {
  const w = Number(waistCm) || 0;
  if (sex === "male") {
    if (w < 94) return 0;
    if (w <= 102) return 3;
    return 4; // >102
  } else {
    if (w < 80) return 0;
    if (w <= 88) return 3;
    return 4; // >88
  }
}
function riskBand(total) {
  if (total <= 14) return { band: "ต่ำ–ปานกลาง", color: "text-emerald-700", bar: "from-emerald-500 to-emerald-400", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", percent: "~1–17% ภายใน 10 ปี" };
  if (total <= 20) return { band: "สูง", color: "text-amber-700", bar: "from-amber-500 to-amber-400", chip: "bg-amber-50 text-amber-700 ring-amber-200", percent: "~33% ภายใน 10 ปี" };
  return { band: "สูงมาก", color: "text-rose-700", bar: "from-rose-500 to-rose-400", chip: "bg-rose-50 text-rose-700 ring-rose-200", percent: "~50% ภายใน 10 ปี" };
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export default function App() {
  const [view, setView] = useState("home"); // home | wizard | summary
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    age: "<45",
    sex: "male",
    heightCm: "",
    weightKg: "",
    bmiManual: "",
    useBMIManual: false,
    waistCm: "",
    exercise: true,
    fruitveg: true,
    hypertRx: false,
    highGlu: false,
    famDm: "none",
  });

  const bmi = useMemo(() => {
    return form.useBMIManual ? Number(form.bmiManual) || 0 : calcBMI(form.weightKg, form.heightCm);
  }, [form.heightCm, form.weightKg, form.bmiManual, form.useBMIManual]);

  const total = useMemo(() => {
    const ageScore = AGE_OPTIONS.find(a => a.value === form.age)?.score ?? 0;
    const bmiS = bmiScore(bmi);
    const waistS = waistScore(form.waistCm, form.sex);
    const exS = form.exercise ? 0 : 2;
    const fvS = form.fruitveg ? 0 : 1;
    const rxS = form.hypertRx ? 2 : 0;
    const gluS = form.highGlu ? 5 : 0;
    const famS = form.famDm === "first" ? 5 : form.famDm === "extended" ? 3 : 0;
    return ageScore + bmiS + waistS + exS + fvS + rxS + gluS + famS;
  }, [form, bmi]);

  const { band, percent, color, bar, chip } = riskBand(total);
  const barWidth = `${clamp((total / 26) * 100, 0, 100).toFixed(0)}%`;

  function onChange(e) {
    const { name, type, value, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }
  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }
  function start() { setView("wizard"); setStep(0); }
  function finish() { setView("summary"); }
  function resetAll() {
    setForm({ age: "<45", sex: "male", heightCm: "", weightKg: "", bmiManual: "", useBMIManual: false, waistCm: "", exercise: true, fruitveg: true, hypertRx: false, highGlu: false, famDm: "none" });
    setView("home"); setStep(0);
  }

  // Export PNG (ต้องติดตั้ง: npm i html2canvas)
  const summaryRef = useRef(null);
  async function exportPNG() {
    const el = summaryRef.current; if (!el) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = `findrisc-result-${Date.now()}.png`; a.click();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-white text-slate-800">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur u-navbar no-print">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-sky-500/15 ring-1 ring-sky-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-indigo-600"><path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div className="text-base font-semibold tracking-tight">FINDRISC – Diabetes Risk</div>
          </div>
          <div className="flex items-center gap-2">
            {view === 'summary' && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-slate-300 bg-transparent px-3 py-1.5 text-sm hover:bg-slate-100"
                >
                  พิมพ์
                </button>
                <button
                  onClick={exportPNG}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
                >
                  บันทึกเป็นรูปภาพ
                </button>
              </div>
            )}

            {/* แสดงเฉพาะช่วงเริ่มทำแบบประเมินจนถึงหน้าสรุป (ไม่แสดงบน home) */}
            {(view === 'wizard' || view === 'summary') && (
              <Button variant="dark" onClick={resetAll} icon="refresh">
                รีเซ็ต
              </Button>
            )}
          </div>

        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {view === 'home' && (<Home onStart={start} />)}
        {view === 'wizard' && (
          <Wizard step={step} form={form} onChange={onChange} bmi={bmi} next={next} back={back} finish={finish} setForm={setForm} />
        )}
        {view === 'summary' && (
          <Summary refEl={summaryRef} form={form} bmi={bmi} total={total} band={band} percent={percent} color={color} chip={chip} bar={bar} barWidth={barWidth} />
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">
          © 2025 Diabetes Risk Demo • ใช้เพื่อคัดกรองเบื้องต้นเท่านั้น ไม่ใช่ผลการวินิจฉัย
        </footer>
      </main>
    </div>
  );
}

// ---- HOME ----
function Home({ onStart }) {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-200/50 to-sky-200/50 blur-2xl" />
        <div className="relative z-10 grid gap-6 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">ความรู้พื้นฐานเรื่องโรคเบาหวานชนิดที่ 2</h1>
            <p className="mt-2 text-slate-600">รู้ปัจจัยเสี่ยง ป้องกันได้: น้ำหนักเกิน/รอบเอวสูง, ขยับน้อย, อาหารหวาน/ไขมันสูง, ความดัน/ไขมันผิดปกติ และประวัติครอบครัว</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Pill icon="book">สัญญาณเตือน</Pill>
              <Pill icon="shield">การป้องกัน</Pill>
              <Pill icon="lab">การคัดกรอง</Pill>
            </div>
            <div className="mt-6">
              <Button variant="primary" size="lg" onClick={onStart} icon="arrow">เริ่มทำแบบประเมิน</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InfoCard title="สัญญาณเตือน" icon="alert">ปัสสาวะบ่อย กระหายน้ำ น้ำหนักลด เหนื่อยง่าย แผลหายช้า ตามัว — ควรพบแพทย์เพื่อตรวจ</InfoCard>
            <InfoCard title="การป้องกัน" icon="run">คุมอาหาร ออกกำลังกาย ≥150 นาที/สัปดาห์ น้ำหนักลด 5–7% ช่วยลดความเสี่ยงได้มาก</InfoCard>
            <InfoCard title="การคัดกรอง" icon="doc">ผู้มีความเสี่ยงควรตรวจ FPG/HbA1c ตามคำแนะนำบุคลากรสาธารณสุข</InfoCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, children, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
        <Icon name={icon} className="h-5 w-5 text-indigo-600" />
        <span>{title}</span>
      </div>
      <div className="text-sm text-slate-600">{children}</div>
    </div>
  );
}

function Pill({ children, icon }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
      <Icon name={icon} className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

// ---- WIZARD ----
const STEPS = [
  { key: 'age', title: 'อายุ' },
  { key: 'sexwaist', title: 'เพศกำเนิด & รอบเอว' },
  { key: 'bmi', title: 'ดัชนีมวลกาย (BMI)' },
  { key: 'exercise', title: 'กิจกรรมทางกาย' },
  { key: 'fruitveg', title: 'ผัก/ผลไม้' },
  { key: 'hypertRx', title: 'ยาลดความดัน' },
  { key: 'highGlu', title: 'น้ำตาลสูงผิดปกติ' },
  { key: 'famDm', title: 'ประวัติครอบครัว' },
];

function Wizard({ step, form, onChange, bmi, next, back, finish, setForm }) {
  const progress = `${Math.round(((step + 1) / STEPS.length) * 100)}%`;

  return (
    <section className="mx-auto max-w-4xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
          <div>ขั้นตอน {step + 1} / {STEPS.length}: {STEPS[step].title}</div>
          <div>{progress}</div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-400" style={{ width: progress }} />
        </div>
      </div>

      {/* Step body */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {STEPS[step].key === 'age' && (
          <Segmented name="age" value={form.age} onChange={onChange} options={AGE_OPTIONS.map(o => ({ label: `${o.label} (+${o.score})`, value: o.value }))} />
        )}

        {STEPS[step].key === 'sexwaist' && (
          <div className="space-y-3">
            <Segmented name="sex" value={form.sex} onChange={onChange} options={SEX_OPTIONS} />
            <Field label="รอบเอว (ซม.)">
              <NumberInput name="waistCm" placeholder="เช่น 85" value={form.waistCm} onChange={onChange} min={40} max={200} />
            </Field>
            <p className="text-xs text-slate-500">เกณฑ์ให้คะแนน: ชาย &lt;94=0, 94–102=3, &gt;102=4 • หญิง &lt;80=0, 80–88=3, &gt;88=4</p>
          </div>
        )}

        {STEPS[step].key === 'bmi' && (
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="useBMIManual" checked={form.useBMIManual} onChange={onChange} />
              <span>ป้อนค่า BMI เอง</span>
            </label>
            {!form.useBMIManual ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="ส่วนสูง (ซม.)"><NumberInput name="heightCm" placeholder="เช่น 165" value={form.heightCm} onChange={onChange} min={80} max={250} /></Field>
                <Field label="น้ำหนัก (กก.)"><NumberInput name="weightKg" placeholder="เช่น 68" value={form.weightKg} onChange={onChange} min={20} max={300} /></Field>
              </div>
            ) : (
              <Field label="BMI (กก./ม²)"><NumberInput name="bmiManual" step="0.1" placeholder="เช่น 27.5" value={form.bmiManual} onChange={onChange} min={10} max={70} /></Field>
            )}
            <div className="rounded-xl bg-slate-50 p-3 text-sm">ค่า BMI ที่คำนวณได้: <strong>{bmi ? bmi.toFixed(1) : '-'}</strong> • เกณฑ์: &lt;25=0, 25–29.9=1, ≥30=3</div>
          </div>
        )}

        {STEPS[step].key === 'exercise' && (
          <ToggleBoolean name="exercise" value={form.exercise} setForm={setForm} yesLabel="ใช่ (≥30 นาที/วัน)" noLabel="ไม่ใช่" />
        )}
        {STEPS[step].key === 'fruitveg' && (
          <ToggleBoolean name="fruitveg" value={form.fruitveg} setForm={setForm} yesLabel="กินทุกวัน" noLabel="ไม่ได้ทุกวัน" />
        )}
        {STEPS[step].key === 'hypertRx' && (
          <ToggleBoolean name="hypertRx" value={form.hypertRx} setForm={setForm} yesLabel="ใช้ยาลดความดัน" noLabel="ไม่ได้ใช้" />
        )}
        {STEPS[step].key === 'highGlu' && (
          <ToggleBoolean name="highGlu" value={form.highGlu} setForm={setForm} yesLabel="เคย" noLabel="ไม่เคย" />
        )}
        {STEPS[step].key === 'famDm' && (
          <Segmented name="famDm" value={form.famDm} onChange={onChange} options={[
            { label: 'ไม่มี/ไม่ทราบ (+0)', value: 'none' },
            { label: 'ญาติห่าง (+3)', value: 'extended' },
            { label: 'ญาติสายตรง (+5)', value: 'first' },
          ]} />
        )}
      </div>

      {/* Nav */}
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" onClick={back} disabled={step === 0} icon="back">ย้อนกลับ</Button>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={next} icon="arrow">ถัดไป</Button>
        ) : (
          <Button variant="success" onClick={finish} icon="check">ดูสรุปผล</Button>
        )}
      </div>
    </section>
  );
}

// ---- SUMMARY ----
function Summary({ refEl, form, bmi, total, band, percent, color, chip, bar, barWidth }) {
  const printedAt = new Date().toLocaleString(); // เวลาออกรายงาน

  return (
    <section className="mx-auto max-w-4xl">
      {/* กล่องสรุปสำหรับจอ + ใช้สำหรับพิมพ์ */}
      <div
        ref={refEl}
        className="rounded-3xl border bg-white p-6 shadow-sm print-sheet print-onepage"
      >

        {/* Header (เฉพาะตอนพิมพ์ ทำให้ดูเป็นรายงาน) */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold print-title">สรุปผลการประเมิน</h2>
            <div className="text-sm text-slate-600 print-subtitle">FINDRISC – ความเสี่ยงภายใน 10 ปี</div>
          </div>

          {/* ป้ายระดับความเสี่ยง (ใช้ print-chip ตอนพิมพ์) */}
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ring-inset ${chip} print-chip`}>
            <span className="font-semibold">{band}</span>
            <span className="text-slate-500">{percent}</span>
          </div>
        </div>

        {/* กล่องคะแนนรวม */}
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4 print-section">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">คะแนนรวม</div>

            {/* ตัวเลขใหญ่ขึ้นเวลาพิมพ์ */}
            <div className="mt-1 text-3xl font-bold text-slate-900 print-kpi">
              {total} <span className="text-base font-medium text-slate-400">/ 26</span>
            </div>

            {/* Progress สำหรับพิมพ์ */}
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 print-progress">
              <span style={{ width: barWidth }} />
            </div>
            <div className="mt-1 text-right text-xs text-slate-500 print-hint">{barWidth}</div>
          </div>

          {/* กล่องรายละเอียดค่าอ่านได้ */}
          <div className="rounded-2xl border p-4 print-section">
            <div className="grid gap-2 text-sm print-kv">
              <div className="k">อายุ</div><div className="v">{AGE_OPTIONS.find(a => a.value === form.age)?.label}</div>
              <div className="k">เพศกำเนิด</div><div className="v">{form.sex === 'male' ? 'ชาย' : 'หญิง'}</div>
              <div className="k">รอบเอว (ซม.)</div><div className="v">{form.waistCm || '-'}</div>
              <div className="k">BMI (กก./ม²)</div><div className="v">{bmi ? bmi.toFixed(1) : '-'}</div>
              <div className="k">ออกกำลังกาย ≥30 นาที/วัน</div><div className="v">{form.exercise ? 'ใช่' : 'ไม่ใช่'}</div>
              <div className="k">กินผัก/ผลไม้ทุกวัน</div><div className="v">{form.fruitveg ? 'ใช่' : 'ไม่ใช่'}</div>
              <div className="k">ใช้ยาลดความดัน</div><div className="v">{form.hypertRx ? 'ใช่' : 'ไม่ใช่'}</div>
              <div className="k">เคยน้ำตาลสูงผิดปกติ</div><div className="v">{form.highGlu ? 'เคย' : 'ไม่เคย'}</div>
              <div className="k">ประวัติครอบครัวเบาหวาน</div>
              <div className="v">{form.famDm === 'first' ? 'ญาติสายตรง' : form.famDm === 'extended' ? 'ญาติห่าง' : 'ไม่มี/ไม่ทราบ'}</div>
            </div>
          </div>
        </div>

        {/* คำแนะนำ */}
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          <AdviceCard title="ตรวจคัดกรองยืนยัน" tone="blue">
            คะแนน "สูง/สูงมาก" ควรพิจารณาตรวจยืนยัน FPG/HbA1c/OGTT และปรึกษาแพทย์
          </AdviceCard>
          <AdviceCard title="ควบคุมน้ำหนัก & รอบเอว" tone="green">
            ตั้งเป้า BMI &lt; 25 และรอบเอวตามเกณฑ์ ลดความเสี่ยงได้ชัดเจน
          </AdviceCard>
          <AdviceCard title="พฤติกรรมสุขภาพดี" tone="violet">
            กินผักผลไม้ทุกวัน ออกกำลังกายสม่ำเสมอ จัดการความดัน/ไขมัน งดสูบบุหรี่
          </AdviceCard>
        </div>

        {/* Footer สำหรับกระดาษ */}
        <div className="print-footer">
          <div>จัดทำด้วย FINDRISC Wizard</div>
          <div>พิมพ์เมื่อ: {printedAt}</div>
        </div>
      </div>

      {/* ปุ่มใช้งานบนจอ เท่านั้น */}
      <div className="mt-4 flex items-center justify-end gap-2 no-print">
        <Button variant="outline" onClick={() => window.print()} icon="print">พิมพ์ผล</Button>
        <Button variant="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} icon="top">เลื่อนขึ้นด้านบน</Button>
      </div>
    </section>
  );
}


function Readout({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-slate-500">{label}</div>
      <div className="font-medium text-slate-800">{value}</div>
    </div>
  );
}

// ---- Reusable UI ----
function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-slate-600">{label}</div>
      {children}
    </label>
  );
}

function NumberInput({ name, value, onChange, placeholder, ...props }) {
  return (
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-300/70 bg-slate-50 px-3 py-3 text-base md:py-2 md:text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      {...props}
    />
  );
}

function Segmented({ name, value, onChange, options = [] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition ${value === opt.value ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100" : "border-slate-300 hover:bg-slate-50"}`}
        >
          <span className="text-base md:text-sm text-slate-800">{opt.label}</span>
          <input type="radio" className="accent-indigo-600" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} />
        </label>
      ))}
    </div>
  );
}

function ToggleBoolean({ name, value, setForm, yesLabel = "ใช่", noLabel = "ไม่ใช่" }) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border">
      <button type="button" onClick={() => setForm(p => ({ ...p, [name]: true }))} className={`px-4 py-3 text-base md:py-2 md:text-sm transition ${value ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}>{yesLabel}</button>
      <button type="button" onClick={() => setForm(p => ({ ...p, [name]: false }))} className={`px-4 py-3 text-base md:py-2 md:text-sm transition ${!value ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}>{noLabel}</button>
    </div>
  );
}

function AdviceCard({ title, children, tone = "blue" }) {
  const toneMap = {
    blue: { bar: "bg-sky-400", ring: "ring-sky-200", icon: "info", text: "text-sky-800", bg: "bg-sky-50" },
    green: { bar: "bg-emerald-400", ring: "ring-emerald-200", icon: "check", text: "text-emerald-800", bg: "bg-emerald-50" },
    violet: { bar: "bg-violet-400", ring: "ring-violet-200", icon: "spark", text: "text-violet-800", bg: "bg-violet-50" },
  }[tone];
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${toneMap.bg} p-4 ring-1 ${toneMap.ring}`}>
      <div className={`absolute left-0 top-0 h-full w-1 ${toneMap.bar}`} />
      <div className="ml-2">
        <div className={`mb-1 flex items-center gap-2 font-semibold ${toneMap.text}`}>
          <Icon name={toneMap.icon} className="h-4 w-4" />
          {title}
        </div>
        <div className="text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}

function Button({ children, variant = "primary", size = "md", onClick, disabled, icon }) {
  const base = "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-base md:py-2 md:text-sm font-medium transition focus:outline-none focus-visible:ring-2 w-full sm:w-auto justify-center";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-200",
    dark: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-300",
  };
  const sizes = { md: "px-4 py-2", lg: "px-5 py-3 text-base" };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} disabled:opacity-50`}>
      {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function Icon({ name, className = "h-4 w-4", ...props }) {
  const common = { strokeWidth: 2, stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case 'arrow': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M5 12h14M13 5l7 7-7 7" /></svg>);
    case 'check': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M20 6L9 17l-5-5" /></svg>);
    case 'back': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M19 12H5m8 7-7-7 7-7" /></svg>);
    case 'print': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M6 9V4h12v5M6 18h12v-6H6v6Z" /></svg>);
    case 'image': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /><path {...common} d="m21 15-4-4-10 10" /></svg>);
    case 'top': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M4 8h16M12 20V8m0 0 4 4m-4-4-4 4" /></svg>);
    case 'refresh': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" /></svg>);
    case 'book': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4h16v13H6.5A2.5 2.5 0 0 0 4 19.5V4Z" /></svg>);
    case 'shield': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>);
    case 'lab': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M9 3v6l-5 9h16l-5-9V3" /></svg>);
    case 'alert': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path {...common} d="M12 9v4M12 17h.01" /></svg>);
    case 'run': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="m13 6 3 1-2 4 3 3-2 6-3-4-3 1 2-5-3-3 5-3Z" /></svg>);
    case 'doc': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path {...common} d="M14 2v6h6" /></svg>);
    case 'info': return (<svg viewBox="0 0 24 24" className={className} {...props}><circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" /><path {...common} d="M12 8h.01M11 12h1v4h1" /></svg>);
    case 'spark': return (<svg viewBox="0 0 24 24" className={className} {...props}><path {...common} d="M5 3v4M3 5h4M19 17v4m-2-2h4M11 11 7 7m10 10-4-4M12 2v6m0 8v6M2 12h6m8 0h6" /></svg>);
    default: return null;
  }
}
