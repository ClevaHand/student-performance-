export type Category = 'Excellent' | 'Good' | 'At Risk' | 'Low'
export type Gender = 'Female' | 'Male'
export interface Student {
  id: string; studentId: string; name: string; gender: Gender; className: string
  academicYear: string; term: string; subjectScores: Record<string, number>
  averageScore: number; assessmentDate: string
}
export type Row = Student & { category: Category }
export interface Config { benchmark: number; passMark: number; thresholds: { excellent: number; good: number; atRisk: number } }
