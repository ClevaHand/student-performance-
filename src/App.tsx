import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { BookOpen, Download, GraduationCap, LayoutDashboard, LifeBuoy, Menu, Percent, Printer, RefreshCw, Target, TrendingUp, Users } from 'lucide-react'
import { CATS, DEFAULT_CONFIG, downloadCsv, fetchStudents, summarise, withCategory } from './lib'
import { SUBJECTS } from './data'
import type { Category, Row, Student } from './types'
import { Badge, Card, DetailsPanel, DistChart, EmptyState, Gauge, GenderChart, Kpi, ShareChart, StudentTable, SubjectChart } from './ui'

const NAV = [['/', 'Overview', LayoutDashboard], ['/subjects', 'Subject Analysis', BookOpen], ['/students', 'Student Directory', Users], ['/trends', 'Performance Trends', TrendingUp]] as const
const cfg = DEFAULT_CONFIG

function Shell() {
  const [students, setStudents] = useState<Student[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [cls, setCls] = useState(''); const [cat, setCat] = useState<Category | null>(null); const [q, setQ] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0]); const [open, setOpen] = useState(false); const [sel, setSel] = useState<Row | null>(null)
  const load = useCallback(() => { setLoading(true); setError(''); fetchStudents().then(setStudents).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)) }, [])
  useEffect(load, [load])

  const rows = useMemo(() => withCategory(students, cfg), [students])
  const classes = useMemo(() => [...new Set(rows.map((r) => r.className))].sort(), [rows])
  const inClass = useMemo(() => rows.filter((r) => !cls || r.className === cls), [rows, cls])
  const stats = useMemo(() => summarise(inClass, cfg), [inClass])
  const shown = useMemo(() => inClass.filter((r) => (!cat || r.category === cat) && (!q || `${r.name} ${r.studentId}`.toLowerCase().includes(q.toLowerCase()))), [inClass, cat, q])
  const reset = () => { setCls(''); setCat(null); setQ('') }
  const active = [cls && `Class: ${cls}`, cat && `Category: ${cat}`, q && `Search: ${q}`].filter(Boolean) as string[]
  const support = stats.dist.filter((d) => d.name === 'At Risk' || d.name === 'Low').reduce((a, d) => a + d.count, 0)
  const table = <StudentTable rows={shown} q={q} setQ={setQ} onOpen={setSel} />
  const bySubject = useMemo(() => inClass.filter((r) => r.subjectScores[subject] < cfg.benchmark).sort((a, b) => a.subjectScores[subject] - b.subjectScores[subject]), [inClass, subject])

  const overview = (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={<GraduationCap />} label="Average Student Score" value={`${stats.avg.toFixed(2)}%`} note={`Mean of ${stats.n} students' averages. No previous-term data.`} />
        <Kpi icon={<Target />} label="Benchmark Achievement" value={`${stats.benchmarkRate.toFixed(0)}%`} note={`Students averaging ${cfg.benchmark}+ ÷ students assessed`} />
        <Kpi icon={<Percent />} label="Pass Rate" value={`${stats.passRate.toFixed(0)}%`} note={`Students averaging ${cfg.passMark}+ ÷ students assessed`} />
        <Kpi icon={<LifeBuoy />} label="Students Requiring Support" value={String(support)} note="Classified At Risk or Low" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Average Score vs Benchmark" sub="Current average against the configured benchmark"><Gauge avg={stats.avg} bench={cfg.benchmark} /></Card>
        <Card title="Average Score by Subject" sub="Sorted high to low, dashed line is the benchmark"><SubjectChart data={stats.subjects} bench={cfg.benchmark} /></Card>
        <Card title="Average Score by Gender" sub="Mean student score for each group"><GenderChart genders={stats.genders} /></Card>
        <Card title="Share of Total Score by Gender" sub="Calculated from the dataset"><ShareChart share={stats.share} /></Card>
        <Card title="Performance Distribution" sub="Select a category to filter the table" className="lg:col-span-2"><DistChart dist={stats.dist} active={cat} onPick={setCat} /></Card>
      </div>
      <Card title="Student Performance">{table}</Card>
    </div>
  )

  return (
    <div className="min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-slate-200 bg-white p-4 transition-transform md:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center gap-2 font-semibold text-indigo-700"><GraduationCap />EduInsight</div>
        <nav aria-label="Main" className="space-y-1">{NAV.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={16} aria-hidden />{label}</NavLink>))}</nav>
        <p className="absolute bottom-4 left-4 right-4 text-xs text-slate-500">Reports and Settings are future capabilities.</p>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}
      <main className="p-4 md:ml-60 md:p-8">
        <div className="mb-4 flex items-center gap-3"><button className="rounded-lg border p-2 md:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <div><h1 className="text-2xl font-semibold md:text-3xl">Student Performance Analysis</h1><p className="text-sm text-slate-500">Monitor academic outcomes and identify opportunities for improvement.</p></div></div>
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Demo data: illustrative records, not verified student data.</p>
        <div className="no-print mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm">Class<select value={cls} onChange={(e) => setCls(e.target.value)} className="ml-2 rounded-lg border border-slate-300 px-2 py-1.5"><option value="">All</option>{classes.map((c) => <option key={c}>{c}</option>)}</select></label>
          <span className="text-sm text-slate-500">2025/26 · Term 2</span>
          <button onClick={reset} className="rounded-lg border px-3 py-1.5 text-sm">Reset filters</button>
          <button onClick={load} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"><RefreshCw size={14} />Refresh</button>
          <button onClick={() => downloadCsv(shown)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-700 px-3 py-1.5 text-sm text-white"><Download size={14} />Export CSV</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"><Printer size={14} />Print</button>
        </div>
        {active.length > 0 && <p className="mb-4 text-sm">Active filters: {active.join(' · ')}</p>}
        <p className="mb-4 hidden text-sm print:block">Generated {new Date().toLocaleDateString('en-GB')}. Filters: {active.join(', ') || 'none'}. Confidential: contains student information.</p>
        {loading ? <p role="status" className="animate-pulse text-slate-500">Loading…</p> : error ? <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">Could not load data: {error} <button onClick={load} className="underline">Retry</button></div> : (
          <Routes>
            <Route path="/" element={overview} />
            <Route path="/students" element={<Card title="Student Directory">{table}</Card>} />
            <Route path="/subjects" element={<div className="space-y-4">
              <label className="text-sm">Subject<select value={subject} onChange={(e) => setSubject(e.target.value)} className="ml-2 rounded-lg border border-slate-300 px-2 py-1.5">{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></label>
              <Card title="All Subjects" sub={`Highest: ${stats.subjects[0]?.name}. Lowest: ${stats.subjects[stats.subjects.length - 1]?.name}.`}><SubjectChart data={stats.subjects} bench={cfg.benchmark} /></Card>
              <Card title={`${subject}: students below benchmark (${bySubject.length})`}>{bySubject.length ? <ul className="divide-y">{bySubject.map((r) => <li key={r.id} className="flex items-center justify-between py-2 text-sm"><span>{r.name} · {r.className}</span><span className="flex items-center gap-3">{r.subjectScores[subject].toFixed(1)}<Badge cat={r.category} /></span></li>)}</ul> : <p className="text-sm">No students below benchmark.</p>}</Card></div>} />
            <Route path="/trends" element={<EmptyState title="No historical data" text="Trends need scores from more than one term. Only Term 2 is loaded, so nothing is charted rather than inventing past results." />} />
          </Routes>)}
      </main>
      {sel && <DetailsPanel row={sel} bench={cfg.benchmark} onClose={() => setSel(null)} />}
    </div>
  )
}
export default function App() { return <BrowserRouter><Shell /></BrowserRouter> }
