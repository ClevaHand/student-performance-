import type { Gender, Student } from './types'
export const SUBJECTS = ['Geography', 'Mathematics', 'English Language', 'Science', 'History']
// Demo records: student averages come from the brief; subject scores are generated so each
// student's mean equals the listed average. Illustrative only, not verified student data.
const RAW: [string, number, Gender][] = [
  ['Maria Adams', 80.2, 'Female'], ['Esther Samuel', 30.4, 'Female'], ['Benjamin Adokwu', 79, 'Male'],
  ['Olivia Olisa', 76.4, 'Female'], ['Michael Samson', 78.2, 'Male'], ['Ethan Malgwi', 78, 'Male'],
  ['Christiana Trust', 77.4, 'Female'], ['Isabella Matthew', 75.4, 'Female'], ['John Osadebe', 75.4, 'Male'],
  ['William Atubu', 75.2, 'Male'], ['Daniel Sunday', 58.2, 'Male'], ['William Bahago', 52.6, 'Male'],
  ['Segun Ayo', 50.8, 'Male'], ['James Brown', 50.8, 'Male'], ['Samuel Akoji', 18.4, 'Male'],
  ['Muhammed Bello', 50.4, 'Male'], ['Success Johnson', 50.2, 'Female'], ['Femi Ojo', 40.2, 'Male'],
  ['Uchechi Okonkwo', 20.4, 'Female'], ['Alexander Inyang', 38.2, 'Male'],
]
const BASE = [6, 5, 3, 1]
const r2 = (n: number) => Math.round(n * 100) / 100
export const MOCK_STUDENTS: Student[] = RAW.map(([name, avg, gender], i) => {
  const first = BASE.map((b, s) => r2(avg + b + ((i * 7 + s * 3) % 5) - 2))
  const history = r2(avg * 5 - first.reduce((a, b) => a + b, 0))
  const scores = [...first, history]
  return {
    id: `s${i + 1}`, studentId: `STU-${String(1001 + i)}`, name, gender,
    className: i % 2 ? 'Grade 9B' : 'Grade 9A', academicYear: '2025/26', term: 'Term 2',
    subjectScores: Object.fromEntries(SUBJECTS.map((s, k) => [s, scores[k]])),
    averageScore: avg, assessmentDate: '2026-03-20',
  }
})
