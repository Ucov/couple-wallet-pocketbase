'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface DailyData {
  day: string
  amount: number
  isToday: boolean
}

interface Props {
  data: DailyData[]
  total: number
  trendPercent: number
}

export default function DailyBarChart({ data, total, trendPercent }: Props) {
  const formatCurrency = (value: number) => `€${value.toFixed(0)}`

  return (
    <section className="mb-8">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-1">Gasto Total del Mes</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-100">€{total.toFixed(2)}</span>
            {trendPercent !== 0 && (
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${trendPercent > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {trendPercent > 0 ? '+' : ''}{trendPercent.toFixed(1)}% vs mes pasado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickFormatter={formatCurrency}
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: '#27272a', radius: 4 }}
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value: any) => [`€${Number(value).toFixed(2)}`, 'Gastado']}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? '#34d399' : '#3f3f46'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
