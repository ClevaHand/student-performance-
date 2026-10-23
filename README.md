# Student Performance Analytics Dashboard
React + TypeScript + Vite + Tailwind CSS v4 + Recharts.

## Run
    npm install
    npm run dev      # http://localhost:5173
    npm run build

## Replace mock data with an API
Copy `.env.example` to `.env` and set `VITE_API_URL=https://your-api`. `fetchStudents()` in `src/lib.ts` then calls
`GET {VITE_API_URL}/students` and expects `Student[]` (see `src/types.ts`). Add authentication headers there.

## Configuration
Benchmark, pass mark and category thresholds live in `DEFAULT_CONFIG` (`src/lib.ts`).
All KPIs and charts are derived from the same student list; the categories are computed, not stored.
