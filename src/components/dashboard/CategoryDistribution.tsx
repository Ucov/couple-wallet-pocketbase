'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { memo } from 'react'

interface CategoryData {
  name: string
  amount: number
  color: string
  icon: string
}

interface CategoryDistributionProps {
  categories: CategoryData[]
  total: number
}

// Map custom tailwind-like colors to real hex codes for Recharts since it doesn't parse Tailwind classes directly
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#d946ef', '#14b8a6', '#64748b']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 backdrop-blur-md p-3 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{data.icon}</span>
          <p className="text-sm font-semibold text-zinc-200">{data.name}</p>
        </div>
        <p className="text-sm font-bold text-white mt-2">€{Number(data.value).toFixed(2)}</p>
      </div>
    )
  }
  return null
}

const CategoryDistribution = memo(function CategoryDistribution({ categories, total }: CategoryDistributionProps) {
  if (categories.length === 0) return null

  // Format data for Recharts Pie
  const donutData = categories.map((c, i) => ({
    name: c.name,
    value: c.amount,
    icon: c.icon,
    color: c.color && c.color.startsWith('#') ? c.color : COLORS[i % COLORS.length]
  }))

  return (
    <div className="space-y-6 mt-4">
      <div className="h-48 w-full flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Etiqueta central del Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-zinc-500 tracking-widest">TOTAL</span>
          <span className="text-lg font-bold text-zinc-200">€{total.toFixed(0)}</span>
        </div>
      </div>
      
      <div className="mt-4 px-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Desglose por Categoría</p>
        <div className="space-y-3">
          {donutData.map((cat, i) => {
            const percentage = ((cat.value / total) * 100).toFixed(1)
            return (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-zinc-300 font-medium">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-100">€{cat.value.toFixed(2)}</span>
                    <span className="text-zinc-500 text-xs ml-2 w-10 inline-block text-right">{percentage}%</span>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div className="w-full bg-zinc-800/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

export default CategoryDistribution
