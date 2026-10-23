import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, ArrowUpDown, CheckCircle2, CircleDot, Inbox, X, XOctagon } from 'lucide-react'
import type { Category, Row } from './types'
import { CATS } from './lib'

export const CAT: Record<Category, { c: string; bg: string; Icon: typeof CheckCircle2 }> = {
  Excellent: { c: '#15803D', bg: '#DCFCE7', Icon: CheckCircle2 }, Good: { c: '#A16207', bg: '#FEF9C3', Icon: CircleDot },
  'At Risk': { c: '#C2410C', bg: '#FFEDD5', Icon: AlertTriangle }, Low: { c: '#B91C1C', bg: '#FEE2E2', Icon: XOctagon },
}
export const Badge = ({ cat }: { cat: Category }) => {
  const { c, bg, Icon } = CAT[cat]
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: c, background: bg }}><Icon size={12} aria-hidden />{cat}</span>
}
export const Card = ({ title, sub, children, className = '' }: { title: string; sub?: string; children: ReactNode; className?: string }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
    <h2 className="text-base font-semibold">{title}</h2>{sub && <p className="mb-3 text-sm text-slate-500">{sub}</p>}{children}
  </section>
)
export const Kpi = ({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-2 text-sm text-slate-500"><span className="text-indigo-700" aria-hidden>{icon}</span>{label}</div>
    <p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p>
  </div>
)
export const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Inbox className="text-slate-400" /><h2 className="font-semibold">{title}</h2><p className="max-w-md text-sm text-slate-500">{text}</p></div>
)

export function Gauge({ avg, bench }: { avg: number; bench: number }) {
  const p = bench ? (avg / bench) * 100 : 0
  return (
    <div role="img" aria-label={`Average ${avg.toFixed(2)} out of 100. Benchmark ${bench}. ${p.toFixed(1)} percent of benchmark achieved.`}>
      <p className="text-4xl font-semibold">{avg.toFixed(2)}<span className="text-lg text-slate-500">/100</span></p>
      <div className="relative mt-5 h-4 rounded-full bg-slate-100"><div className="h-4 rounded-full bg-indigo-700" style={{ width: `${Math.min(avg, 100)}%` }} /><div className="absolute -top-1 h-6 w-0.5 bg-slate-900" style={{ left: `${bench}%` }} /></div>
      <div className="relative mt-1 h-5 text-xs text-slate-600"><span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${bench}%` }}>Benchmark {bench}</span></div>
      <p className="mt-2 text-sm">{p.toFixed(1)}% of benchmark achieved. The bar is scored out of 100, so a full bar does not mean the benchmark is met.</p>
    </div>
  )
}

const num = (v: unknown) => Number(v).toFixed(1)
export function SubjectChart({ data, bench }: { data: { name: string; avg: number; count: number }[]; bench: number }) {
  const low = data.filter((d) => d.avg < bench).map((d) => d.name)
  return (
    <div role="img" aria-label={`Average score by subject: ${data.map((d) => `${d.name} ${d.avg.toFixed(1)}`).join(', ')}. Below benchmark: ${low.join(', ') || 'none'}.`}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20 }}>
          <CartesianGrid vertical={false} stroke="#E2E8F0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} /><YAxis domain={[0, 100]} width={30} />
          <Tooltip content={({ active, payload }: any) => active && payload?.length ? (
            <div className="rounded-lg border bg-white p-2 text-xs shadow"><b>{payload[0].payload.name}</b><br />Average {payload[0].payload.avg.toFixed(2)}<br />Students {payload[0].payload.count}<br />Vs benchmark {(payload[0].payload.avg - bench).toFixed(2)}</div>) : null} />
          <ReferenceLine y={bench} stroke="#172033" strokeDasharray="4 4" label={{ value: `Benchmark ${bench}`, position: 'insideTopRight', fontSize: 11 }} />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]}>{data.map((d) => <Cell key={d.name} fill={d.avg < bench ? '#C2410C' : '#4338CA'} />)}<LabelList dataKey="avg" position="top" formatter={num} fontSize={11} /></Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500">Orange bars are below the benchmark{low.length ? `: ${low.join(', ')} needs attention.` : '.'}</p>
    </div>
  )
}

export function GenderChart({ genders }: { genders: { name: string; avg: number; count: number }[] }) {
  const [f, m] = genders
  const diff = Math.abs(f.avg - m.avg)
  return (
    <div role="img" aria-label={`Female average ${f.avg.toFixed(2)} (${f.count} students), male average ${m.avg.toFixed(2)} (${m.count} students).`}>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={genders} layout="vertical" margin={{ right: 40 }}>
          <XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="name" width={60} />
          <Tooltip formatter={(v: unknown) => Number(v).toFixed(2)} />
          <Bar dataKey="avg" radius={[0, 6, 6, 0]}><Cell fill="#2563EB" /><Cell fill="#6D5AE6" /><LabelList dataKey="avg" position="right" formatter={num} fontSize={11} /></Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-slate-600">The gap is {diff.toFixed(2)} points ({f.name} {f.count}, {m.name} {m.count} students). With groups this small, treat it as indicative, not as evidence of cause.</p>
    </div>
  )
}

export function ShareChart({ share }: { share: { name: string; value: number }[] }) {
  return (
    <div role="img" aria-label={share.map((s) => `${s.name} ${s.value.toFixed(2)} percent`).join(', ')}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart><Pie data={share} dataKey="value" innerRadius={55} outerRadius={85} label={(e: any) => `${e.value.toFixed(1)}%`}><Cell fill="#2563EB" /><Cell fill="#6D5AE6" /></Pie><Tooltip formatter={(v: unknown) => `${Number(v).toFixed(2)}%`} /><Legend /></PieChart>
      </ResponsiveContainer>
      <p className="text-sm text-slate-600">Share of all points scored. It depends on group size, so it is not a measure of how well each group performs; see the averages chart for that.</p>
    </div>
  )
}

export function DistChart({ dist, active, onPick }: { dist: { name: Category; count: number }[]; active: Category | null; onPick: (c: Category | null) => void }) {
  return (
    <div>
      <div role="img" aria-label={dist.map((d) => `${d.name}: ${d.count}`).join(', ')}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dist}><CartesianGrid vertical={false} stroke="#E2E8F0" /><XAxis dataKey="name" /><YAxis allowDecimals={false} width={28} /><Tooltip />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} onClick={(d: any) => onPick(active === d.name ? null : d.name)} cursor="pointer">
              {dist.map((d) => <Cell key={d.name} fill={CAT[d.name].c} />)}<LabelList dataKey="count" position="top" fontSize={11} /></Bar></BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">{dist.map((d) => (
        <button key={d.name} aria-pressed={active === d.name} onClick={() => onPick(active === d.name ? null : d.name)} className={`rounded-full border px-3 py-1 text-xs ${active === d.name ? 'border-indigo-700 bg-indigo-50' : 'border-slate-300'}`}>{d.name}: {d.count}</button>))}</div>
    </div>
  )
}

type SortKey = 'name' | 'averageScore' | 'category'
export function StudentTable({ rows, q, setQ, onOpen }: { rows: Row[]; q: string; setQ: (s: string) => void; onOpen: (r: Row) => void }) {
  const [key, setKey] = useState<SortKey>('averageScore'); const [dir, setDir] = useState(-1)
  const [page, setPage] = useState(0); const [size, setSize] = useState(10)
  useEffect(() => setPage(0), [q, rows.length, size])
  const sorted = useMemo(() => [...rows].sort((a, b) => dir * (key === 'name' ? a.name.localeCompare(b.name) : key === 'category' ? CATS.indexOf(a.category) - CATS.indexOf(b.category) : a.averageScore - b.averageScore)), [rows, key, dir])
  const pages = Math.max(1, Math.ceil(sorted.length / size)); const view = sorted.slice(page * size, page * size + size)
  const th = (k: SortKey, label: string) => (
    <th scope="col" aria-sort={key === k ? (dir > 0 ? 'ascending' : 'descending') : 'none'} className="px-3 py-2 text-left font-medium">
      <button className="inline-flex items-center gap-1" onClick={() => { setDir(key === k ? -dir : k === 'name' ? 1 : -1); setKey(k) }}>{label}<ArrowUpDown size={12} aria-hidden /></button></th>)
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="text-sm">Search<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or ID" className="ml-2 rounded-lg border border-slate-300 px-3 py-1.5" /></label>
        <label className="text-sm">Rows<select value={size} onChange={(e) => setSize(+e.target.value)} className="ml-2 rounded-lg border border-slate-300 px-2 py-1.5">{[5, 10, 20].map((n) => <option key={n}>{n}</option>)}</select></label>
        <span className="text-sm text-slate-500" aria-live="polite">{rows.length} matching students</span>
      </div>
      {rows.length === 0 ? <EmptyState title="No students match" text="Try clearing the search or filters." /> : (
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr>{th('name', 'Student')}<th scope="col" className="px-3 py-2 text-left font-medium">ID</th><th scope="col" className="px-3 py-2 text-left font-medium">Class</th>{th('averageScore', 'Average')}{th('category', 'Category')}<th scope="col" className="px-3 py-2 text-left font-medium">Actions</th></tr></thead>
          <tbody>{view.map((r) => (<tr key={r.id} className="border-b border-slate-100"><td className="px-3 py-2 font-medium">{r.name}</td><td className="px-3 py-2">{r.studentId}</td><td className="px-3 py-2">{r.className}</td><td className="px-3 py-2">{r.averageScore.toFixed(2)}</td><td className="px-3 py-2"><Badge cat={r.category} /></td>
            <td className="px-3 py-2"><button onClick={() => onOpen(r)} className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50" aria-label={`View details for ${r.name}`}>Details</button></td></tr>))}</tbody></table></div>)}
      <div className="mt-3 flex items-center justify-end gap-3 text-sm"><button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Previous</button>Page {page + 1} of {pages}<button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Next</button></div>
    </div>
  )
}

export function DetailsPanel({ row, bench, onClose }: { row: Row; bench: number; onClose: () => void }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  const subs = Object.entries(row.subjectScores)
  const below = subs.filter(([, v]) => v < bench).map(([k]) => k); const above = subs.filter(([, v]) => v >= bench).map(([k]) => k)
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="dtitle" className="h-full w-full max-w-md overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between"><div><h2 id="dtitle" className="text-xl font-semibold">{row.name}</h2><p className="text-sm text-slate-500">{row.studentId} · {row.className}</p></div><button autoFocus onClick={onClose} aria-label="Close details" className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button></div>
        <p className="mt-4 text-3xl font-semibold">{row.averageScore.toFixed(2)}</p><div className="mt-1"><Badge cat={row.category} /></div>
        <ul className="mt-5 space-y-3">{subs.map(([k, v]) => (<li key={k}><div className="flex justify-between text-sm"><span>{k}</span><span>{v.toFixed(1)} ({v - bench >= 0 ? '+' : ''}{(v - bench).toFixed(1)} vs benchmark)</span></div>
          <div className="relative mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full" style={{ width: `${Math.min(v, 100)}%`, background: v < bench ? '#C2410C' : '#4338CA' }} /><div className="absolute -top-0.5 h-3 w-0.5 bg-slate-900" style={{ left: `${bench}%` }} /></div></li>))}</ul>
        <p className="mt-5 text-sm"><b>At or above benchmark:</b> {above.join(', ') || 'none'}</p><p className="mt-1 text-sm"><b>Below benchmark:</b> {below.join(', ') || 'none'}</p>
        <p className="mt-4 text-xs text-slate-500">Last assessment: {row.assessmentDate}. No history is held for this student, so no trend is shown. Demo data.</p>
      </div>
    </div>
  )
}
