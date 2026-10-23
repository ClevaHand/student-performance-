import { MOCK_STUDENTS, SUBJECTS } from './data'
import type { Category, Config, Gender, Row, Student } from './types'
export const DEFAULT_CONFIG: Config = { benchmark: 70, passMark: 50, thresholds: { excellent: 75, good: 50, atRisk: 40 } }
export const CATS: Category[] = ['Excellent', 'Good', 'At Risk', 'Low']
export const classify = (s: number, c: Config): Category =>
  s >= c.thresholds.excellent ? 'Excellent' : s >= c.thresholds.good ? 'Good' : s >= c.thresholds.atRisk ? 'At Risk' : 'Low'
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)
const pct = (n: number, d: number) => (d ? (n / d) * 100 : 0)

/** Data service: set VITE_API_URL to read GET {url}/students (Student[]); otherwise mock data is used. */
export async function fetchStudents(): Promise<Student[]> {
  const url = import.meta.env.VITE_API_URL as string | undefined
  if (url) {
    const res = await fetch(`${url}/students`)
    if (!res.ok) throw new Error(`API responded with ${res.status}`)
    return res.json()
  }
  await new Promise((r) => setTimeout(r, 300))
  return MOCK_STUDENTS
}

export function withCategory(students: Student[], c: Config): Row[] {
  const seen = new Set<string>()
  return students
    .filter((s) => Number.isFinite(s.averageScore) && !seen.has(s.studentId) && !!seen.add(s.studentId))
    .map((s) => ({ ...s, category: classify(s.averageScore, c) }))
}

export function summarise(rows: Row[], c: Config) {
  const n = rows.length
  const subjects = SUBJECTS.map((name) => {
    const v = rows.map((r) => r.subjectScores[name]).filter(Number.isFinite)
    return { name, avg: mean(v), count: v.length }
  }).sort((a, b) => b.avg - a.avg)
  const genders = (['Female', 'Male'] as Gender[]).map((name) => {
    const l = rows.filter((r) => r.gender === name)
    return { name, count: l.length, avg: mean(l.map((r) => r.averageScore)), total: l.reduce((a, r) => a + r.averageScore, 0) }
  })
  const totalScore = genders.reduce((a, g) => a + g.total, 0)
  return {
    n, avg: mean(rows.map((r) => r.averageScore)), subjects, genders,
    share: genders.map((g) => ({ name: g.name, value: pct(g.total, totalScore) })),
    benchmarkRate: pct(rows.filter((r) => r.averageScore >= c.benchmark).length, n),
    passRate: pct(rows.filter((r) => r.averageScore >= c.passMark).length, n),
    dist: CATS.map((name) => ({ name, count: rows.filter((r) => r.category === name).length })),
  }
}

export function downloadCsv(rows: Row[]) {
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const head = ['Name', 'Student ID', 'Class', 'Gender', ...SUBJECTS, 'Average', 'Category']
  const lines = rows.map((r) => [r.name, r.studentId, r.className, r.gender, ...SUBJECTS.map((s) => r.subjectScores[s] ?? ''), r.averageScore, r.category].map(q).join(','))
  const url = URL.createObjectURL(new Blob([[head.map(q).join(','), ...lines].join('\n')], { type: 'text/csv' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'students.csv' })
  a.click(); URL.revokeObjectURL(url)
}
