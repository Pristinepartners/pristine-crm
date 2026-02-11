'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface StageData {
  pipeline: string
  stage: string
  count: number
}

interface StageDistributionChartProps {
  data: StageData[]
}

const COLORS = [
  '#c9a96e', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
]

export function StageDistributionChart({ data }: StageDistributionChartProps) {
  const chartData = data.map(d => ({
    name: `${d.pipeline} - ${d.stage}`,
    value: d.count,
  }))

  if (chartData.length === 0) {
    return (
      <div className="bg-[var(--color-card)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Stage Distribution</h3>
        <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
          No opportunities yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-card)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Stage Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
